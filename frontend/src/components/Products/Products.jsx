import React, { useState, useEffect } from 'react';
import { 
  Card,
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Upload, 
  message 
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  UploadOutlined 
} from '@ant-design/icons';

const FarmerProductsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState();
  const [mode, setMode] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);

 
  // Categories for dropdown selection
  const categories = [
    'Vegetables', 
    'Fruits', 
    'Grains', 
    'Meat', 
    'Dairy & Eggs', 
    'Herbs', 
    'Other'
  ];

  // Units for dropdown selection
  const units = [
    'kg', 
    'lb', 
    'pieces', 
    'bunches', 
    'dozen', 
    'bottles', 
    'jars'
  ];

  // Availability options
  const availabilityOptions = [
    'In Season', 
    'Year-round', 
    'Limited Stock', 
    'Pre-order', 
    'Sold Out'
  ];

  // Function to fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Include auth if needed
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data); // Update state with fetched products
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to load products");
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if(mode==0){
        fetchProducts();
    }
    
  }, [mode]);


  const columns = [
    // {
    //     title: "Image",
    //     dataIndex: "category",
    //     key: "image",
    //     render: (category) => {
    //       const imageSrc = categoryImages[category] || "/images/default.jpg"; // Use default if not found
    //       return (
    //         <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
    //           <img
    //             src={imageSrc}
    //             alt={category}
    //             className="w-full h-full object-cover"
    //           />
    //         </div>
    //       );
    //     },
    //   },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: categories.map((cat) => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    //   render: (price) => `₹${price.toFixed(2)}`, // Format for INR
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true, // Truncate long descriptions
    },
    {
      title: "Availability",
      dataIndex: "is_active",
      key: "is_active",
      filters: [
        { text: "Available", value: true },
        { text: "Not Available", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (is_active) => {
        let color = is_active ? "green" : "red";
        return (
          <span
            className={`text-${color}-600 px-2 py-1 rounded-full bg-${color}-100`}
          >
            {is_active ? "Available" : "Not Available"}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </div>
      ),
    },
  ];
  

  const showModal = () => {
    setMode(1)
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setMode(0)
  };

  const handleSubmit = async (values) => {
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct 
      ? `http://127.0.0.1:8000/api/products/${editingProduct.id}/`
      : "http://127.0.0.1:8000/api/products/";

    try {
        console.log("Submitting data:", values); // Debugging

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(values),
        });

        const responseText = await response.text(); // Read raw response
        console.log("Raw Response:", responseText); // Debugging

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${responseText}`);
        }

        const data = responseText ? JSON.parse(responseText) : {}; // Parse if content exists
        console.log("Parsed Response:", data); // Debugging

        if (editingProduct) {
            setProducts((prevProducts) =>
                prevProducts.map((prod) => (prod.id === data.id ? data : prod))
            );
        } else {
            setProducts((prevProducts) => [data, ...prevProducts]);
        }

        setIsModalVisible(false);
        form.resetFields();
        setEditingProduct(null);
    } catch (error) {
        console.error("Error:", error.message);
        message.error("Failed to save product. Please try again.");
    }
};

  
  

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Ensure token is included
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        message.success('Product deleted successfully!');
        setProducts(products.filter(product => product.id !== productId)); // Remove from UI
      } else {
        const data = await response.json();
        message.error(data.message || 'Failed to delete product.');
      }
    } catch (error) {
      message.error('An error occurred while deleting the product.');
    }
  };
  

  const handleEdit = (product) => {
    form.setFieldsValue({
      id: product.id,
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      availability: product.availability,
      description: product.description,
    });
  
    setEditingProduct(product);  // Store the product being edited
    setIsModalVisible(true);  // Show the modal
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Card>
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
          className="bg-green-600 hover:bg-green-700"
        >
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table 
          dataSource={products} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </div>

      <Modal
  title="Add New Product"
  visible={isModalVisible}
  onCancel={handleCancel}
  footer={null}
  width={700}
>
  <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Product Name */}
      <Form.Item
        name="name"
        label="Product Name"
        rules={[{ required: true, message: 'Please enter product name' }]}
      >
        <Input placeholder="e.g. Organic Black Pepper" />
      </Form.Item>

      {/* Category */}
      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: 'Please select a category' }]}
      >
        <Select placeholder="Select a category">
          {[
            'Rubber',
            'Coconut',
            'Jackfruit',
            'Banana',
            'Pepper',
            'Cardamom',
            'Tea',
            'Coffee',
            'Arecanut',
            'Cashew',
            'Ginger',
            'Turmeric',
            'Nutmeg',
            'Clove',
            'Tapioca',
            'Mango',
            'Pineapple',
            'Others',
          ].map((category) => (
            <Select.Option key={category} value={category.toLowerCase()}>
              {category}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Price */}
      <Form.Item
        name="price"
        label="Price ($)"
        rules={[{ required: true, message: 'Please enter price' }]}
      >
        <InputNumber
          min={0.01}
          step={0.01}
          precision={2}
          placeholder="e.g. 2.99"
          className="w-full"
        />
      </Form.Item>

      {/* Product Availability (is_active) */}
      <Form.Item
        name="is_active"
        label="Availability"
        rules={[{ required: true, message: 'Please select availability' }]}
      >
        <Select placeholder="Select availability">
          <Select.Option value={true}>Available</Select.Option>
          <Select.Option value={false}>Not Available</Select.Option>
        </Select>
      </Form.Item>
    </div>

    {/* Description */}
    <Form.Item
      name="description"
      label="Description"
      rules={[{ required: true, message: 'Please enter a description' }]}
    >
      <Input.TextArea
        rows={4}
        placeholder="Describe your product, including quality, growing methods, etc."
      />
    </Form.Item>

    {/* Form Actions */}
    <Form.Item className="flex justify-end">
      <Button onClick={handleCancel} className="mr-2">
        Cancel
      </Button>
      <Button  type="primary" htmlType="submit" className="bg-green-600 hover:bg-green-700">
        Save Product
      </Button>
    </Form.Item>
  </Form>
</Modal>

    </div>
    </Card>
  );
};

export default FarmerProductsPage;