import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  InputNumber, 
  Button, 
  Row, 
  Col, 
  Input, 
  Slider,
  Divider,
  message,
  Empty,
  Checkbox,
  Tooltip
} from 'antd';
import { 
  SendOutlined,
  InfoCircleOutlined,
  CarOutlined
} from '@ant-design/icons';
import axios from 'axios';

const RespondToDemandModal = ({ isVisible, demand, onClose, formatPrice, onResponseSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  // Reset form when the demand changes or modal becomes visible
  useEffect(() => {
    if (demand && isVisible) {
      form.setFieldsValue({
        price: demand.price_per_unit || 0,
        quantity: Math.min(demand.quantity || 1, 100),
        notes: '',
        can_deliver: false
      });
    } else if (!isVisible) {
      form.resetFields();
    }
  }, [demand, isVisible, form]);
  
  // Handle form submission
  const handleResponseSubmit = async (values) => {
    if (!demand) {
      message.error("Error: No demand selected. Please try again.");
      onClose();
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("You must be logged in to respond to demands");
        setSubmitting(false);
        return;
      }
      
      // Get the current user's farmer ID from localStorage or other state
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const farmerId =  userData.id;
      console.log("Farmer ID:", farmerId);
      if (!farmerId) {
        message.error("Your farmer profile information is missing. Please update your profile.");
        setSubmitting(false);
        return;
      }
      
      // Prepare request payload with all required fields
      const requestData = {
        demand: demand.id,
        farmer: farmerId,
        offered_price: values.price,
        offered_quantity: values.quantity,
        notes: values.notes || "",
        can_deliver: values.can_deliver || false
      };
      
      console.log("Sending demand response data:", requestData);
      
      const response = await axios.post('http://127.0.0.1:8000/api/demand-responses/', requestData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Demand response success:", response.data);
      message.success("Your response has been submitted to the buyer");
      
      // Notify parent component that a response was successfully submitted
      if (onResponseSubmit) {
        onResponseSubmit(demand.id);
      }
      
      onClose();
    } catch (error) {
      console.error("Demand response error:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        
        if (error.response.status === 400) {
          if (error.response.data.non_field_errors?.includes('The fields demand, farmer must make a unique set.')) {
            message.warning("You have already responded to this demand. The buyer will review your offer.");
            
            // Even though there was an error, notify parent component that this demand has been responded to
            if (onResponseSubmit) {
              onResponseSubmit(demand.id);
            }
            
            onClose();
          } else {
            // Show specific validation errors if available
            const errorMessages = [];
            for (const field in error.response.data) {
              const fieldErrors = error.response.data[field];
              if (Array.isArray(fieldErrors)) {
                errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
              }
            }
            
            if (errorMessages.length > 0) {
              message.error(`Validation errors: ${errorMessages.join('; ')}`);
            } else {
              message.error("Failed to submit response: " + JSON.stringify(error.response.data));
            }
          }
        } else {
          message.error("Failed to submit response: " + (error.response.data.detail || "Unknown error"));
        }
      } else {
        message.error("Network error. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render empty state when demand is missing
  const renderEmptyState = () => {
    return (
      <Empty 
        description="Demand information not available" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  };
  
  // Render the form
  const renderForm = () => {
    if (!demand) return renderEmptyState();
    
    return (
      <Form
        form={form} 
        layout="vertical"
        onFinish={handleResponseSubmit}
        initialValues={{
          price: demand.price_per_unit || 0,
          quantity: Math.min(demand.quantity || 1, 100),
          notes: '',
          can_deliver: false
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="price"
              label={`Your Offered Price (per ${demand.unit || 'unit'})`}
              rules={[{ required: true, message: 'Please enter your offered price' }]}
            >
              <InputNumber
                min={1}
                max={10000}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <div className="price-slider">
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => (
                  <Slider
                    min={Math.max(1, (demand.price_per_unit || 0) * 0.7)}
                    max={(demand.price_per_unit || 0) * 1.3}
                    onChange={val => form.setFieldsValue({ price: val })}
                    value={getFieldValue('price')}
                    tipFormatter={value => `₹${value}`}
                  />
                )}
              </Form.Item>
              <Row justify="space-between">
                <Col>Lower</Col>
                <Col>Original: ₹{demand.price_per_unit || 0}</Col>
                <Col>Higher</Col>
              </Row>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="quantity"
              label={`Quantity You Can Provide (${demand.unit || 'unit'})`}
              rules={[{ required: true, message: 'Please enter the quantity you can provide' }]}
            >
              <InputNumber
                min={0.1}
                max={(demand.quantity || 1) * 2}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <div className="quantity-slider">
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => (
                  <Slider
                    min={0.1}
                    max={(demand.quantity || 1) * 1.5}
                    step={0.1}
                    onChange={val => form.setFieldsValue({ quantity: val })}
                    value={getFieldValue('quantity')}
                    tipFormatter={value => `${value} ${demand.unit || 'unit'}`}
                  />
                )}
              </Form.Item>
              <div style={{ marginTop: 5 }}>
                <strong>Requested: {demand.quantity || 0} {demand.unit || 'unit'}</strong>
              </div>
            </div>
          </Col>
        </Row>
        
        <Form.Item
          name="notes"
          label="Additional Notes (optional)"
        >
          <Input.TextArea
            rows={4}
            placeholder="Add any details about your offer, quality of produce, delivery terms, etc."
          />
        </Form.Item>
        
        <Form.Item 
          name="can_deliver" 
          valuePropName="checked"
        >
          <Checkbox>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CarOutlined style={{ marginRight: 8, color: '#2d6a4f' }} />
              I can deliver this product to the buyer
              <Tooltip title="Check this if you can handle delivery to the buyer's location. This will be visible to the buyer and will be reflected in the deal.">
                <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
              </Tooltip>
            </span>
          </Checkbox>
        </Form.Item>
        
        <div className="response-note">
          <InfoCircleOutlined /> Your response will be sent to {demand.buyerInfo?.name || 'the buyer'}. 
          They will review your offer and may contact you directly for negotiation.
        </div>
        
        <Form.Item className="response-actions">
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting}>
            Submit Response
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  // Render the demand summary
  const renderDemandSummary = () => {
    if (!demand) return null;
    
    return (
      <div className="original-demand">
        <h4>Original Demand</h4>
        <p><strong>Product:</strong> {demand.product_name || 'Not specified'}</p>
        <p><strong>Quantity:</strong> {demand.quantity || 0} {demand.unit || 'units'}</p>
        <p><strong>Price:</strong> {formatPrice ? formatPrice(demand.price_per_unit || 0) : `₹${demand.price_per_unit || 0}`} per {demand.unit || 'unit'}</p>
        <p><strong>Valid Until:</strong> {demand.availableTill || 'Not specified'}</p>
      </div>
    );
  };
  
  return (
    <Modal
      title={demand ? `Respond to Demand: ${demand.title || 'Untitled Demand'}` : 'Respond to Demand'}
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose={true}
      className="respond-to-demand-modal"
    >
      {demand ? (
        <div className="demand-response-summary">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {renderDemandSummary()}
            </Col>
          </Row>
          
          <Divider />
          
          {renderForm()}
        </div>
      ) : renderEmptyState()}
    </Modal>
  );
};

export default RespondToDemandModal; 