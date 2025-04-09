import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import ProfilePictureUpload from './Pfp';
import PhoneVerification from './PhoneVerification';
import countriesData from "./countries.json";
import { Card, Form, Input, Select, DatePicker, Button, Divider, Typography, Row, Col, message } from 'antd';
import { UserOutlined, HomeOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import './ProfileComponents.css';
import './ProfileDatePicker.css';
import pincodeData from './pincode.json';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ProfileForm = ({ initialData, onSubmit, loading, firstName, lastName, submitLabel, can }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(initialData.country || '');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(initialData.state || '');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialData.city || '');

  useEffect(() => {
    if (selectedCountry) {
      const country = countriesData.find((c) => c.name === selectedCountry);
      setStates(country ? country.states : []);
      setFormData({ ...formData, country: selectedCountry });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const state = states.find((s) => s.name === selectedState);
      setCities(state ? state.cities : []);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      const state = states.find((s) => s.name === selectedState);
      setCities(state ? state.cities : []);
    }
  });

  useEffect(() => {
    if (selectedCity) {
      const state = states.find((s) => s.name === selectedState);
      setCities(state ? state.cities : []);
      const city = cities.find((c) => c.name === selectedCity);
      setFormData({ ...formData, state: selectedState, city: selectedCity });
    }
  }, [selectedCity]);

  // Function to validate phone number format
  const validatePhoneNumber = (phone) => {
    // Indian phone number format: 10 digits, optionally starting with +91
    const phoneRegex = /^(\+91[ -]?)?[0]?(91)?[6789]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Function to validate if date is at least 18 years ago
  const validateAge = (dob) => {
    if (!dob) return false;

    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18;
  };

  const handleChange = (e) => {
    if (e.target.name === 'profilepic') {
      const file = e.target.files[0];
      setFormData({ ...formData, profilepic: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Validate phone number
      if (name === 'phoneno') {
        if (!validatePhoneNumber(value)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phoneno: 'Please enter a valid Indian phone number (10 digits)',
          }));
        } else {
          setErrors((prevErrors) => {
            const { phoneno, ...rest } = prevErrors;
            return rest;
          });
        }
      }

      if (name === 'pincode') {

        if (!Array.isArray(pincodeData.pincodes)) {
          console.error("pincodeData is not an array. Check your JSON structure.");
          return;
        }
        if (!(pincodeData.pincodes).includes(Number(value))) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            pincode: 'Invalid Pincode',
          }));
        } else {
          setErrors((prevErrors) => {
            const { pincode, ...rest } = prevErrors;
            return rest;
          });
        }
      }
    }
  };

  const handlePhoneUpdate = (newPhone) => {
    setFormData((prev) => ({ ...prev, phoneno: newPhone }));

    // Validate the updated phone number
    if (!validatePhoneNumber(newPhone)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneno: 'Please enter a valid Indian phone number (10 digits)',
      }));
    } else {
      setErrors((prevErrors) => {
        const { phoneno, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  // Handle date of birth change
  const handleDateChange = (date, dateString) => {
    setFormData({ ...formData, dob: dateString });

    // Validate age (must be at least 18)
    if (!validateAge(dateString)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dob: 'You must be at least 18 years old',
      }));
    } else {
      setErrors((prevErrors) => {
        const { dob, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      message.error("Form contains errors. Fix them before submitting.");
      return; // Stop form submission if there are errors
    }
    const city = cities.find((c) => c.name === selectedCity);
    onSubmit({ ...formData, lat: city?.latitude, lng: city?.longitude });
  };

  return (
    <Card className="profile-form-card">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <Title level={3} className="form-title">Profile Information</Title>
          <Text type="secondary">Update your personal information and how you'll appear on the platform</Text>
        </div>

        <Divider />

        {/* Profile Picture and Name Section */}
        <div className="form-section profile-picture-section">
          <Row gutter={24} align="middle">
            <Col xs={24} md={6}>
              <div className="section-label">
                <UserOutlined />
                <Text strong>Profile Picture</Text>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <div className="profile-picture-upload">
                <ProfilePictureUpload
                  name="profilepic"
                  onChange={handleChange}
                  preview={preview || (initialData.profilepic ? `http://127.0.0.1:8000${initialData.profilepic}` : null)}
                  currentImage={formData.profilepic}
                />
                <div className="profile-name">
                  <Text strong style={{ fontSize: '18px' }}>{firstName} {lastName}</Text>
                  <Text type="secondary">Update your profile picture</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Bio Section */}
        <div className="form-section">
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <div className="section-label">
                <UserOutlined />
                <Text strong>About You</Text>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <TextArea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself"
                className="form-input"
              />
              <Text type="secondary" className="input-help-text">
                A brief description that will be displayed on your profile
              </Text>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Contact Information */}
        <div className="form-section">
          <div className="section-title">
            <PhoneOutlined className="section-icon" />
            <Title level={4}>Contact Information</Title>
          </div>

          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <div className="form-group">
                <Text strong>Phone Number</Text>
                <Input
                  name="phoneno"
                  value={formData.phoneno || ''}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="form-input"
                  prefix={<PhoneOutlined />}
                />
                {errors.phoneno && (
                  <Text className='text-red' type="danger" style={{ display: 'block', marginTop: '4px' }}>
                    {errors.phoneno}
                  </Text>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="form-group">
                <Text strong>Date of Birth</Text>
                <div className="date-picker-wrapper">
                  <div className="date-picker-prefix">
                    <CalendarOutlined />
                  </div>
                  <DatePicker
                    name="dob"
                    value={formData.dob ? moment(formData.dob) : null}
                    onChange={handleDateChange}
                    placeholder="Select your date of birth"
                    className="form-input date-picker-with-prefix"
                    suffixIcon={<CalendarOutlined />}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    disabledDate={(current) => {
                      // Only disable future dates
                      return current && current > moment().endOf('day');
                    }}
                  />
                </div>
                {errors.dob && (
                  <Text className='text-red' type="danger" style={{ display: 'block', marginTop: '4px' }}>
                    {errors.dob}
                  </Text>
                )}
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Location Information */}
        <div className="form-section">
          <div className="section-title">
            <GlobalOutlined className="section-icon" />
            <Title level={4}>Location Information</Title>
          </div>

          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <div className="form-group">
                <Text strong>Country</Text>
                <div className="select-container">
                  <Select
                    value={selectedCountry}
                    onChange={value => setSelectedCountry(value)}
                    placeholder="Select a country"
                    className="form-select"
                    suffixIcon={<ChevronDownIcon className="select-arrow" />}
                  >
                    <Select.Option value="">Select a country</Select.Option>
                    <Select.Option value="India">India</Select.Option>
                  </Select>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="form-group">
                <Text strong>Postal Code</Text>
                <Input
                  type="number"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                  className="form-input"
                />
                {errors.pincode && (
                  <Text className='text-red' type="danger" style={{ display: 'block', marginTop: '4px' }}>
                    {errors.pincode}
                  </Text>
                )}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-group">
                <Text strong>State</Text>
                <div className="select-container">
                  <Select
                    value={selectedState}
                    onChange={value => setSelectedState(value)}
                    placeholder="Select a state"
                    disabled={!selectedCountry}
                    className="form-select"
                    suffixIcon={<ChevronDownIcon className="select-arrow" />}
                  >
                    <Select.Option value="">Select a state</Select.Option>
                    {states.map((state) => (
                      <Select.Option key={state.id} value={state.name}>
                        {state.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="form-group">
                <Text strong>Nearest City</Text>
                <div className="select-container">
                  <Select
                    value={selectedCity}
                    onChange={value => setSelectedCity(value)}
                    placeholder="Select your nearest city"
                    disabled={!selectedState}
                    className="form-select"
                    suffixIcon={<ChevronDownIcon className="select-arrow" />}
                  >
                    <Select.Option value="">Select your nearest city</Select.Option>
                    {cities.map((city) => (
                      <Select.Option key={city.id} value={city.name}>
                        {city.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <div className="form-group">
                <Text strong>Full Address</Text>
                <TextArea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your full address"
                  className="form-input"
                />
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="form-actions">
          {can}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="submit-button"
          >
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export { ProfileForm };