import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Space,
  Tag,
  Typography,
  Tooltip,
  Badge,
  Empty,
  List,
  Spin,
  Pagination,
  Switch,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  NumberOutlined,
  CommentOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './Products.css';
import { OffersModal } from '../Offers';
import { showSuccessNotification, showErrorNotification } from '../../utils/notificationConfig';

const { Title, Text } = Typography;

const Products = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [mode, setMode] = useState('view');
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [offersCountByProduct, setOffersCountByProduct] = useState({});
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);
  const [selectedProductForOffers, setSelectedProductForOffers] = useState(null);

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

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'count', label: 'Count/Pieces' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'quintal', label: 'Quintal' },
    { value: 'ton', label: 'Ton' },
    { value: 'bundle', label: 'Bundle' }
  ];

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
    return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
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

  // Function to fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get('http://127.0.0.1:8000/api/products/my-products/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Products fetched:', response.data);
      setProducts(response.data);
      fetchOffersCount(token, response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersCount = async (token, productsData) => {
    try {
      // Fetch all offers for the farmer's products
      const offersResponse = await axios.get('http://127.0.0.1:8000/api/my-product-offers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Count offers by product
      const countMap = {};
      offersResponse.data.forEach(offer => {
        if (!countMap[offer.product]) {
          countMap[offer.product] = {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0
          };
        }
        
        countMap[offer.product].total += 1;
        
        if (offer.status === 'pending') {
          countMap[offer.product].pending += 1;
        } else if (offer.status === 'accepted') {
          countMap[offer.product].accepted += 1;
        } else if (offer.status === 'rejected') {
          countMap[offer.product].rejected += 1;
        }
      });
      
      setOffersCountByProduct(countMap);
      console.log('Offers count by product:', countMap);
    } catch (error) {
      console.error('Error fetching offers count:', error);
      // Don't set error state here to avoid disrupting product display
    }
  };

  const showOffersModal = (product) => {
    setSelectedProductForOffers(product);
    setIsOffersModalVisible(true);
  };

  const handleOffersModalClose = () => {
    setIsOffersModalVisible(false);
    setSelectedProductForOffers(null);
  };

  const handleDealCreated = () => {
    // Refresh the data after a deal is created
    fetchProducts();
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const showAddModal = () => {
    console.log('Add Product button clicked');
    setMode('add');
    form.resetFields();
    form.setFieldsValue({ 
      is_active: true,
      can_deliver: false,
      unit: 'kg',
      quantity: 1
    });
    setEditingProduct(null);
    setIsModalVisible(true);
    console.log('Modal visibility set to true for adding product');
  };

  const handleCancel = () => {
    console.log('Modal closed');
    setIsModalVisible(false);
    form.resetFields();
    setEditingProduct(null);
  };

  const handleSubmit = async (values) => {
    setFormSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Use category as name and ensure price and quantity are sent as numbers
      const data = {
        ...values,
        name: categoryOptions.find(cat => cat.value === values.category)?.label || values.category,
        price: parseFloat(values.price),
        quantity: parseFloat(values.quantity)
      };

      if (editingProduct) {
        // Update existing product
        await axios.put(`http://127.0.0.1:8000/api/products/${editingProduct.id}/`, data, { headers });
        showSuccessNotification('Product Updated', 'Your product has been updated successfully');
      } else {
        // Add new product
        await axios.post('http://127.0.0.1:8000/api/products/', data, { headers });
        showSuccessNotification('Product Added', 'Your product has been added successfully');
      }
      
      // Refresh products list
      fetchProducts();
      setIsModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      console.error("Error response data:", error.response?.data);
      
      // Try to extract a meaningful error message
      let errorMessage = "Failed to save product. Please try again.";
      
      if (error.response?.data) {
        // If it's an object with error details
        if (typeof error.response.data === 'object') {
          // Try different formats of error responses
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else {
            // If it's field errors like {field_name: ["error msg"]}
            const firstErrorField = Object.keys(error.response.data)[0];
            if (firstErrorField && Array.isArray(error.response.data[firstErrorField])) {
              errorMessage = `${firstErrorField}: ${error.response.data[firstErrorField][0]}`;
            } else if (firstErrorField) {
              errorMessage = `${firstErrorField}: ${error.response.data[firstErrorField]}`;
            }
          }
        } else if (typeof error.response.data === 'string') {
          // If it's a string message
          errorMessage = error.response.data;
        }
      }
      
      showErrorNotification('Save Failed', errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`http://127.0.0.1:8000/api/products/${productId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      showSuccessNotification('Product Deleted', 'Your product has been deleted successfully');
      fetchProducts(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage = error.response?.data?.detail || "Failed to delete product. Please try again.";
      showErrorNotification('Delete Failed', errorMessage);
    }
  };

  const handleEdit = (product) => {
    console.log('Edit Product button clicked for product:', product);
    setMode('edit');
    form.setFieldsValue({
      category: product.category,
      unit: product.unit || getDefaultUnitForCategory(product.category),
      quantity: parseFloat(product.quantity || 1),
      price: parseFloat(product.price),
      description: product.description || '',
      is_active: product.is_active,
      can_deliver: product.can_deliver || false
    });
    setEditingProduct(product);
    setIsModalVisible(true);
    console.log('Modal visibility set to true for editing product');
  };

  const handleCategoryChange = (value) => {
    // Set the default unit based on the selected category
    const unit = getDefaultUnitForCategory(value);
    form.setFieldsValue({
      unit: unit
    });
    
    // Update quantity step after unit changes
    const currentQuantity = form.getFieldValue('quantity');
    if (currentQuantity) {
      if (['count', 'dozen', 'bundle'].includes(unit) && !Number.isInteger(currentQuantity)) {
        form.setFieldsValue({
          quantity: Math.round(currentQuantity)
        });
      }
    }
  };

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
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="products-page">
        <div className="page-header">
          <div>
            <Title level={3}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              My Products
            </Title>
            <Text type="secondary">Manage your farm products inventory</Text>
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
      <div className="products-page">
        <div className="page-header">
          <div>
            <Title level={3}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              My Products
            </Title>
            <Text type="secondary">Manage your farm products inventory</Text>
          </div>
        </div>
        <div className="error-container">
          <InfoCircleOutlined style={{ fontSize: '32px', color: '#f5222d' }} />
          <Text type="danger">{error}</Text>
          <Button type="primary" onClick={fetchProducts}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <Title level={3}>
            <ShoppingOutlined style={{ marginRight: '8px' }} />
            My Products
          </Title>
          <Text type="secondary">Manage your farm products inventory</Text>
        </div>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={showAddModal}
          className="add-button"
        >
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Empty 
          description="No products found. Add your first product to get started!" 
          className="empty-state"
        />
      ) : (
        <>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
            dataSource={paginatedProducts}
            renderItem={(product) => (
              <List.Item>
                <Card 
                  className="product-card"
                  data-category={product.category}
                  actions={[
                    <Tooltip title="Edit Product">
                      <EditOutlined key="edit" onClick={() => handleEdit(product)} />
                    </Tooltip>,
                    <Tooltip title="Delete Product">
                      <DeleteOutlined key="delete" onClick={() => handleDelete(product.id)} />
                    </Tooltip>
                  ]}
                >
                  <div className="product-header">
                    <Text strong className="product-name">
                      {categoryOptions.find(cat => cat.value === product.category)?.label || product.category}
                    </Text>
                    <Tag color={product.is_active ? 'success' : 'error'} className="product-category">
                      {product.is_active ? 'Available' : 'Unavailable'}
                    </Tag>
                  </div>
                  
                  <div className="product-details">
                    <div className="product-price-unit-container">
                      <div className="price-badge">
                        
                        <Text className="price">₹{formatPrice(product.price)}</Text>
                      </div>
                      
                      <div className="quantity-badge">
                        <TagOutlined />
                        <Text className="quantity">
                          {formatQuantity(product.quantity, product.unit)} {unitOptions.find(unit => unit.value === product.unit)?.label || 'unit'}
                        </Text>
                      </div>
                    </div>
                    
                    {product.description && (
                      <div className="product-description">
                        <Tooltip title={product.description}>
                          <Text ellipsis={{ rows: 2 }} className="description-text">
                            {product.description}
                          </Text>
                        </Tooltip>
                      </div>
                    )}
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div className="product-status-container">
                      <div className="product-delivery">
                        {product.can_deliver ? (
                          <Badge 
                            status="processing" 
                            color="#52c41a"
                            text={<Text className="delivery-text can-deliver"><CarOutlined /> Delivery Available</Text>} 
                          />
                        ) : (
                          <Badge 
                            status="default"
                            text={<Text className="delivery-text pickup-only"><ShoppingCartOutlined /> Pickup Only</Text>} 
                          />
                        )}
                      </div>
                      
                      {/* Offer count badges */}
                      {offersCountByProduct[product.id] && offersCountByProduct[product.id].total > 0 && (
                        <div className="product-offers-count">
                          <Space>
                            <Tooltip title="Total Offers">
                              <Badge count={offersCountByProduct[product.id].total} style={{ backgroundColor: '#108ee9' }} />
                            </Tooltip>
                            {offersCountByProduct[product.id].pending > 0 && (
                              <Tooltip title="Pending Offers">
                                <Badge count={offersCountByProduct[product.id].pending} style={{ backgroundColor: '#faad14' }} />
                              </Tooltip>
                            )}
                            {offersCountByProduct[product.id].accepted > 0 && (
                              <Tooltip title="Accepted Offers">
                                <Badge count={offersCountByProduct[product.id].accepted} style={{ backgroundColor: '#52c41a' }} />
                              </Tooltip>
                            )}
                          </Space>
                        </div>
                      )}
                    </div>

                    <div className="product-timestamps">
                      <Text type="secondary" className="timestamp">
                        Updated: {formatDate(product.updated_at)}
                      </Text>
                    </div>
                    
                    {/* View Offers Button */}
                    {offersCountByProduct[product.id] && (
                      <div className="view-offers-button-container" style={{ marginTop: '10px' }}>
                        <Button 
                          type="primary" 
                          icon={<CommentOutlined />}
                          onClick={() => showOffersModal(product)}
                          disabled={!offersCountByProduct[product.id]?.total}
                          block
                        >
                          View Offers {offersCountByProduct[product.id]?.pending > 0 && 
                            `(${offersCountByProduct[product.id].pending} pending)`
                          }
                        </Button>
                      </div>
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
              total={products.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['5', '10', '20']}
              showTotal={(total) => `Total ${total} products`}
            />
          </div>
        </>
      )}

      <Modal
        title={mode === 'add' ? 'Add New Product' : 'Edit Product'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        okText={mode === 'add' ? 'Add Product' : 'Update Product'}
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
          initialValues={{ 
            is_active: true,
            can_deliver: false,
            unit: 'kg',
            quantity: 1
          }}
          style={{ padding: '16px' }}
          validateMessages={{
            required: '${label} is required!',
            number: {
              min: '${label} must be at least ${min}'
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label={<span>Product Type <Tooltip title="Select your product category"><InfoCircleOutlined /></Tooltip></span>}
                rules={[{ required: true, message: 'Please select a product category' }]}
                style={{ marginBottom: '16px' }}
              >
                <Select 
                  placeholder="Select product type" 
                  disabled={formSubmitting} 
                  onChange={handleCategoryChange}
                >
                  {categoryOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label={<span>Unit <Tooltip title="Unit of measurement"><InfoCircleOutlined /></Tooltip></span>}
                rules={[{ required: true, message: 'Please select a unit' }]}
                style={{ marginBottom: '16px' }}
              >
                <Select 
                  placeholder="Select unit" 
                  disabled={formSubmitting}
                  onChange={handleUnitChange}
                >
                  {unitOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label={<span>Price (₹) <Tooltip title="Enter the price for your product"><InfoCircleOutlined /></Tooltip></span>}
                rules={[
                  { required: true, message: 'Please enter price' },
                  { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
                ]}
                style={{ marginBottom: '16px' }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter price"
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  disabled={formSubmitting}
                  min={0.01}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label={<span>Quantity <Tooltip title="Enter the quantity/amount of your product"><InfoCircleOutlined /></Tooltip></span>}
                rules={[
                  { required: true, message: 'Please enter quantity' },
                  { type: 'number', min: 0.01, message: 'Quantity must be greater than 0' }
                ]}
                style={{ marginBottom: '16px' }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter quantity"
                  disabled={formSubmitting}
                  min={0.01}
                  step={(form.getFieldValue('unit') && getStepForUnit(form.getFieldValue('unit'))) || 0.1}
                  precision={['count', 'dozen', 'bundle'].includes(form.getFieldValue('unit')) ? 0 : 2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<span>Description (Optional) <Tooltip title="Provide additional details about your product"><InfoCircleOutlined /></Tooltip></span>}
            style={{ marginBottom: '16px' }}
          >
            <Input.TextArea rows={4} placeholder="Enter product description (optional)" disabled={formSubmitting} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label={<span>Availability <Tooltip title="Toggle to set product availability"><InfoCircleOutlined /></Tooltip></span>}
                valuePropName="checked"
                style={{ marginBottom: '16px' }}
              >
                <Switch checkedChildren="Available" unCheckedChildren="Unavailable" disabled={formSubmitting} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="can_deliver"
                label={<span>Delivery Option <Tooltip title="Can you deliver this product?"><InfoCircleOutlined /></Tooltip></span>}
                valuePropName="checked"
                style={{ marginBottom: '16px' }}
              >
                <Switch checkedChildren="Can Deliver" unCheckedChildren="Pickup Only" disabled={formSubmitting} />
              </Form.Item>
            </Col>
          </Row>
          
          {formSubmitting && (
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <Spin size="small" /> <Text type="secondary">Saving product...</Text>
            </div>
          )}
        </Form>
      </Modal>
      
      {/* Offers Modal */}
      {selectedProductForOffers && (
        <OffersModal
          visible={isOffersModalVisible}
          productId={selectedProductForOffers.id}
          productDetails={selectedProductForOffers}
          onClose={handleOffersModalClose}
          onDealCreated={handleDealCreated}
        />
      )}
    </div>
  );
};

export default Products;