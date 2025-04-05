import { useState, useRef } from 'react';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import './ProfileComponents.css';

const ProfilePictureUpload = ({ onChange, preview, currentImage }) => {
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    // This will trigger the parent's handleChange function
    onChange(event);
  };

  return (
    <div className="profile-picture-upload-container">
      <input
        type="file"
        name="profilepic"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden-input"
      />
      
      <div 
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`picture-upload-wrapper ${isHovering ? 'hovering' : ''}`}
      >
        {(preview || currentImage) ? (
          <div className="image-container">
            <img
              src={preview || currentImage}
              alt="Profile"
              className="profile-image"
            />
            <div className={`overlay ${isHovering ? 'active' : ''}`}>
              <CameraOutlined className="camera-icon" />
              <span className="change-text">Change Photo</span>
            </div>
          </div>
        ) : (
          <div className="placeholder-container">
            <UserOutlined className="user-icon" />
            <div className={`overlay ${isHovering ? 'active' : ''}`}>
              <CameraOutlined className="camera-icon" />
              <span className="change-text">Upload Photo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;