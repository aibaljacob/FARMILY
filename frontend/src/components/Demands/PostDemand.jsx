import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Switch, 
  Button, 
  InputNumber, 
  Typography,
  Space,
  Divider,
  Modal,
  List,
  Spin,
  Tooltip,
  Tag,
  Empty,
  Badge,
  Pagination
} from 'antd';
import { 
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  SaveOutlined,
  ClearOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  CommentOutlined,
  MessageOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './Demands.css';
import moment from 'moment';
import ResponsesModal from './ResponsesModal';
import { showSuccessNotification, showErrorNotification } from '../../utils/notificationConfig';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DemandManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState('add');
  const [demands, setDemands] = useState([]);
  const [error, setError] = useState(null);
  const [editingDemand, setEditingDemand] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const formRef = useRef(null);
  const [responsesModalVisible, setResponsesModalVisible] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [responseCounts, setResponseCounts] = useState({});

  // Category options
  const categoryOptions = [
    { value: 'rubber', label: 'Rubber' },
    { value: 'coconut', label: 'Coconut' },
    { value: 'jackfruit', label: 'Jackfruit' },
    { value: 'banana', label: 'Banana' },
    { value: 'pepper', label: 'Black Pepper' },
    { value: 'cardamom', label: 'Cardamom' },
    { value: 'tea', label: 'Tea' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'arecanut', label: 'Arecanut' },
    { value: 'cashew', label: 'Cashew' },
    { value: 'ginger', label: 'Ginger' },
    { value: 'turmeric', label: 'Turmeric' },
    { value: 'nutmeg', label: 'Nutmeg' },
    { value: 'clove', label: 'Clove' },
    { value: 'tapioca', label: 'Tapioca' },
    { value: 'mango', label: 'Mango' },
    { value: 'pineapple', label: 'Pineapple' },
    { value: 'others', label: 'Others' }
  ];

  // Unit options
  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'count', label: 'Count/Pieces' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'quintal', label: 'Quintal' },
    { value: 'ton', label: 'Ton' },
    { value: 'bundle', label: 'Bundle' }
  ];

  // Category colors for visual distinction
  const categoryColors = {
    rubber: '#f50',
    coconut: '#87d068',
    jackfruit: '#ffd700',
    banana: '#ffa940',
    pepper: '#ff4d4f',
    cardamom: '#722ed1',
    tea: '#13c2c2',
    coffee: '#964b00',
    arecanut: '#faad14',
    cashew: '#d48265',
    ginger: '#ff7a45',
    turmeric: '#ffc53d',
    nutmeg: '#cf1322',
    clove: '#531dab',
    tapioca: '#1890ff',
    mango: '#eb2f96',
    pineapple: '#fadb14',
    others: '#8c8c8c'
  };

  // Function to get the default unit based on category
  const getDefaultUnitForCategory = (category) => {
    const unitMap = {
      'rubber': 'kg',
      'coconut': 'count',
      'jackfruit': 'count',
      'banana': 'dozen',
      'pepper': 'kg',
      'cardamom': 'g',
      'tea': 'kg',
      'coffee': 'kg',
      'arecanut': 'kg',
      'cashew': 'kg',
      'ginger': 'kg',
      'turmeric': 'kg',
      'nutmeg': 'kg',
      'clove': 'g',
      'tapioca': 'kg',
      'mango': 'count',
      'pineapple': 'count',
      'others': 'kg'
    };
    return unitMap[category] || 'kg';
  };

  // Function to get default step value for quantity based on unit
  const getStepForUnit = (unit) => {
    const stepMap = {
      'kg': 0.1,
      'g': 1,
      'count': 1,
      'dozen': 0.5,
      'lb': 0.1,
      'quintal': 0.1,
      'ton': 0.01,
      'bundle': 1
    };
    return stepMap[unit] || 0.1;
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to safely format price
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) ? `₹${numPrice.toFixed(2)}` : '₹0.00';
  };

  // Function to safely format quantity
  const formatQuantity = (quantity, unit) => {
    const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    
    if (isNaN(numQuantity)) return '1.00';
    
    // Format based on unit type
    if (['count', 'dozen', 'bundle'].includes(unit)) {
      return Number.isInteger(numQuantity) ? numQuantity.toString() : numQuantity.toFixed(1);
    } else {
      return numQuantity.toFixed(2);
    }
  };

  // Get unit label based on unit value
  const getUnitLabel = (unitValue) => {
    const unit = unitOptions.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  // Function to check if a demand is still valid
  const isValidDemand = (validUntil) => {
    return new Date(validUntil) > new Date();
  };

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    const defaultUnit = getDefaultUnitForCategory(value);
    
    // Suggest a default unit but don't automatically set it
    if (!form.getFieldValue('unit')) {
      form.setFieldsValue({ unit: defaultUnit });
    }
    
    // Update quantity step after unit changes
    const currentQuantity = form.getFieldValue('quantity');
    if (currentQuantity) {
      if (['count', 'dozen', 'bundle'].includes(defaultUnit) && !Number.isInteger(currentQuantity)) {
        form.setFieldsValue({
          quantity: Math.round(currentQuantity)
        });
      }
    }
  };

  // Handle unit change
  const handleUnitChange = (unit) => {
    // Update quantity step after unit changes
    const currentQuantity = form.getFieldValue('quantity');
    if (currentQuantity) {
      if (['count', 'dozen', 'bundle'].includes(unit) && !Number.isInteger(currentQuantity)) {
        form.setFieldsValue({
          quantity: Math.round(currentQuantity)
        });
      }
    }
    
    // Set focus to quantity field to encourage the user to enter a value
    setTimeout(() => {
      const quantityField = document.querySelector('.quantity-input .ant-input-number-input');
      if (quantityField) {
        quantityField.focus();
      }
    }, 100);
  };

  // Function to fetch demands from backend
  const fetchDemands = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Use the user_only parameter to fetch only the current user's demands
      const response = await axios.get('http://127.0.0.1:8000/api/demands/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          user_only: 'true' // This will filter demands to only show the current user's
        }
      });

      // Sort demands by created_at in descending order (newest first)
      const sortedDemands = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setDemands(sortedDemands);
      
      // Fetch response counts for each demand
      await fetchResponseCounts(sortedDemands, token);
      
      setError(null);
    } catch (error) {
      console.error("Error fetching demands:", error);
      const errorMessage = error.response?.data?.detail || "Failed to load demands. Please try again later.";
      setError(errorMessage);
      showErrorNotification('Load Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch response counts for all demands
  const fetchResponseCounts = async (demands, token) => {
    try {
      const countRequests = demands.map(demand => 
        axios.get(`http://127.0.0.1:8000/api/demand-responses/?demand=${demand.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(countRequests);
      
      const counts = {};
      responses.forEach((response, index) => {
        counts[demands[index].id] = response.data.length;
      });
      
      setResponseCounts(counts);
    } catch (error) {
      console.error("Error fetching response counts:", error);
    }
  };

  // Fetch demands when component mounts
  useEffect(() => {
    fetchDemands();
  }, []);

  const showAddModal = () => {
    setMode('add');
    form.resetFields();
    form.setFieldsValue({ 
      is_active: true,
      validUntil: moment().add(7, 'days')
    });
    setEditingDemand(null);
    setIsModalVisible(true);
  };

  const handleEdit = (demand) => {
    setMode('edit');
    form.setFieldsValue({
      category: demand.category,
      pricePerUnit: parseFloat(demand.price_per_unit),
      quantity: parseFloat(demand.quantity),
      unit: demand.unit,
      validUntil: moment(demand.valid_until),
      isActive: demand.is_active
    });
    setSelectedCategory(demand.category);
    setEditingDemand(demand);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingDemand(null);
    setSelectedCategory(null);
  };

  const handleDelete = async (demandId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`http://127.0.0.1:8000/api/demands/${demandId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      showSuccessNotification('Demand Deleted', 'Your demand has been deleted successfully');
      fetchDemands(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting demand:", error);
      const errorMessage = error.response?.data?.detail || "Failed to delete demand. Please try again.";
      showErrorNotification('Delete Failed', errorMessage);
    }
  };

  const handleSubmit = async (values) => {
    setFormSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Format the data for API
      const demandData = {
        category: values.category,
        price_per_unit: parseFloat(values.pricePerUnit),
        quantity: parseFloat(values.quantity),
        unit: values.unit,
        valid_until: values.validUntil.format('YYYY-MM-DDTHH:mm:ss'),
        is_active: values.isActive === undefined ? true : values.isActive
      };

      if (editingDemand) {
        // Update existing demand
        await axios.put(`http://127.0.0.1:8000/api/demands/${editingDemand.id}/`, demandData, { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        });
        showSuccessNotification('Demand Updated', 'Your demand has been updated successfully');
      } else {
        // Add new demand
        await axios.post('http://127.0.0.1:8000/api/demands/', demandData, { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        });
        showSuccessNotification('Demand Posted', 'Your demand has been posted successfully');
      }
      
      // Refresh demands list
      fetchDemands();
      setIsModalVisible(false);
      form.resetFields();
      setEditingDemand(null);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error submitting demand:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        const errorMessage = error.response.data.detail || 
                  Object.entries(error.response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ') || 
                  'Failed to submit demand';
        showErrorNotification('Submission Failed', errorMessage);
      } else {
        showErrorNotification('Network Error', 'Network error or server unreachable');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const paginatedDemands = demands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Function to show responses modal
  const showResponsesModal = (demand) => {
    setSelectedDemand(demand);
    setResponsesModalVisible(true);
  };

  // Handle responses modal close
  const handleResponsesModalClose = () => {
    // Refresh response counts when the modal is closed
    const token = localStorage.getItem('access_token');
    if (token && selectedDemand) {
      // Only refresh the count for the selected demand
      axios.get(`http://127.0.0.1:8000/api/demand-responses/?demand=${selectedDemand.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(response => {
        console.log("response",response);
        const updatedCounts = { ...responseCounts };
        updatedCounts[selectedDemand.id] = response.data.length;
        setResponseCounts(updatedCounts);
      }).catch(error => {
        console.error("Error refreshing response count:", error);
      });
    }
    console.log("responseCounts",responseCounts);
    setResponsesModalVisible(false);
    setSelectedDemand(null);
  };

  if (loading) {
    return (
      <div className="demands-page">
        <div className="page-header">
          <div>
            <Title level={3}>
              <ShoppingOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
              My Demands
            </Title>
            <Text type="secondary">Manage your product demand listings</Text>
          </div>
        </div>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="demands-page">
        <div className="page-header">
          <div>
            <Title level={3}>
              <ShoppingOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
              My Demands
            </Title>
            <Text type="secondary">Manage your product demand listings</Text>
          </div>
        </div>
        <div className="error-container">
          <InfoCircleOutlined style={{ fontSize: '32px', color: '#f5222d' }} />
          <Text type="danger">{error}</Text>
          <Button type="primary" onClick={fetchDemands}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="demands-page">
      <div className="page-header">
        <div>
          <Title level={3}>
            <ShoppingOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
            My Demands
          </Title>
          <Text type="secondary">Manage your product demand listings</Text>
        </div>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={showAddModal}
          className="add-button"
        >
          Post New Demand
        </Button>
      </div>

      {demands.length === 0 ? (
        <Empty 
          description="No demands found. Post your first demand to get started!" 
          className="empty-state"
        />
      ) : (
        <>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
            dataSource={paginatedDemands}
            renderItem={(demand) => (
              <List.Item>
                <Card 
                  className="demand-card"
                  data-category={demand.category}
                  actions={[
                    <Tooltip title="Edit Demand">
                      <EditOutlined key="edit" onClick={() => handleEdit(demand)} />
                    </Tooltip>,
                    <Tooltip title="Delete Demand">
                      <DeleteOutlined key="delete" onClick={() => handleDelete(demand.id)} />
                    </Tooltip>
                  ]}
                >
                  <div className="demand-header">
                    <Tag color={categoryColors[demand.category]} className="demand-category">
                      {categoryOptions.find(cat => cat.value === demand.category)?.label || demand.category}
                    </Tag>
                    <Badge 
                      status={isValidDemand(demand.valid_until) && demand.is_active ? "success" : "error"} 
                      text={isValidDemand(demand.valid_until) && demand.is_active ? "Active" : "Inactive"} 
                    />
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div className="demand-details">
                    <div className="demand-detail-row">
                      <DollarOutlined className="demand-icon" />
                      <Text strong>Price per Unit:</Text>
                      <Text>{formatPrice(demand.price_per_unit)}</Text>
                    </div>
                    
                    <div className="demand-detail-row">
                      <ShoppingOutlined className="demand-icon" />
                      <Text strong>Quantity Required:</Text>
                      <Text>{formatQuantity(demand.quantity, demand.unit)} {getUnitLabel(demand.unit)}</Text>
                    </div>
                    
                    <div className="demand-detail-row">
                      <CalendarOutlined className="demand-icon" />
                      <Text strong>Valid Until:</Text>
                      <Text>{formatDate(demand.valid_until)}</Text>
                    </div>
                    
                

                    {/* Response count badge */}
                    {/* <div className="demand-responses-count">
                      <Badge count={responseCounts[demand.id] || 0} style={{ backgroundColor: '#2d6a4f' }} />
                      <Text type="secondary" style={{ marginLeft: '8px' }}>
                        {responseCounts[demand.id] === 1 
                          ? '1 response received' 
                          : `${responseCounts[demand.id] || 0} responses received`}
                      </Text>
                    </div> */}
                    
                    {/* View Responses button */}
                    <div className="view-responses-btn" style={{ marginTop: '16px', textAlign: 'center', color:"white"}}>
                      <Button 
                        type="primary" 
                        ghost
                        icon={<CommentOutlined />}
                        onClick={() => showResponsesModal(demand)}
                        style={{ width: '100%' }}
                        disabled={!responseCounts[demand.id] || responseCounts[demand.id] === 0}
                      >
                        View Responses
                      </Button>
                    </div>
                  </div>
                  
                  <div className="demand-timestamps">
                    <Text type="secondary" className="timestamp">
                      Posted: {formatDate(demand.created_at)}
                    </Text>
                    {demand.created_at !== demand.updated_at && (
                      <Text type="secondary" className="timestamp">
                        Updated: {formatDate(demand.updated_at)}
                      </Text>
                    )}
                  </div>
                </Card>
              </List.Item>
            )}
          />
          
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={demands.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['6', '12', '24']}
              showTotal={(total) => `Total ${total} demands`}
            />
          </div>
        </>
      )}

      <Modal
        title={mode === 'add' ? 'Post New Demand' : 'Edit Demand'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        okText={mode === 'add' ? 'Post Demand' : 'Update Demand'}
        cancelText="Cancel"
        onCancel={handleCancel}
        destroyOnClose
        maskClosable={false}
        confirmLoading={formSubmitting}
        okButtonProps={{ 
          disabled: formSubmitting,
          className: 'add-button'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          ref={formRef}
          style={{ padding: '16px' }}
          validateMessages={{
            required: '${label} is required!',
            number: {
              min: '${label} must be at least ${min}'
            }
          }}
        >
          <Form.Item
            name="category"
            label={<span>Product Category <Tooltip title="Select your product category"><InfoCircleOutlined /></Tooltip></span>}
            rules={[{ required: true, message: 'Please select a product category' }]}
            style={{ marginBottom: '16px' }}
          >
            <Select 
              placeholder="Select product category"
              disabled={formSubmitting} 
              onChange={handleCategoryChange}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              {categoryOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="pricePerUnit"
              label={<span>Price per Unit <Tooltip title="Price you are willing to pay per unit"><InfoCircleOutlined /></Tooltip></span>}
              rules={[{ required: true, message: 'Please enter price per unit' }]}
              className="price-input"
              style={{ marginBottom: '16px' }}
            >
              <InputNumber
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                disabled={formSubmitting}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              />
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="unit"
              label={<span>Unit <Tooltip title="Choose the measurement unit for this product"><InfoCircleOutlined /></Tooltip></span>}
              rules={[{ required: true, message: 'Please select a unit' }]}
              className="unit-select"
              style={{ marginBottom: '16px' }}
              help={selectedCategory ? `Suggested unit for ${categoryOptions.find(c => c.value === selectedCategory)?.label || selectedCategory}: ${getDefaultUnitForCategory(selectedCategory)}` : "Select a unit for your product"}
            >
              <Select
                placeholder="Select unit"
                disabled={formSubmitting}
                onChange={handleUnitChange}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                style={{ backgroundColor: '#f9f9f9' }}
              >
                {unitOptions.map(unit => (
                  <Option key={unit.value} value={unit.value}>
                    {unit.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span>Required Quantity <Tooltip title="How much do you need"><InfoCircleOutlined /></Tooltip></span>}
              rules={[{ required: true, message: 'Please enter required quantity' }]}
              className="quantity-input"
              style={{ marginBottom: '16px' }}
            >
              <InputNumber
                min={0}
                step={getStepForUnit(form.getFieldValue('unit') || 'kg')}
                style={{ width: '100%' }}
                disabled={formSubmitting}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="validUntil"
            label={<span>Valid Until <Tooltip title="When this demand expires"><InfoCircleOutlined /></Tooltip></span>}
            rules={[{ required: true, message: 'Please select validity date' }]}
            style={{ marginBottom: '16px' }}
          >
            <DatePicker
              className="date-picker"
              style={{ width: '100%' }}
              disabled={formSubmitting}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              disabledDate={(current) => {
                // Can't select days before today
                return current && current < moment().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label={<span>Demand Status <Tooltip title="Is this demand active"><InfoCircleOutlined /></Tooltip></span>}
            valuePropName="checked"
            initialValue={true}
            style={{ marginBottom: '16px' }}
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              defaultChecked
              disabled={formSubmitting}
            />
          </Form.Item>

          {formSubmitting && (
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <Spin size="small" /> <Text type="secondary">Saving demand...</Text>
            </div>
          )}
        </Form>
      </Modal>
      
      {/* Responses Modal */}
      <ResponsesModal
        visible={responsesModalVisible}
        demandId={selectedDemand?.id}
        demandDetails={selectedDemand}
        onClose={handleResponsesModalClose}
      />
    </div>
  );
};

export default DemandManagement; 