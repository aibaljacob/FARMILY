import { useState, useRef } from 'react';
import { UserOutlined } from '@ant-design/icons';

const ProfilePictureUpload = ({ onChange, preview, currentImage }) => {
  const fileInputRef = useRef(null);
  
  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    // This will trigger the parent's handleChange function
    onChange(event);
  };

  return (
    <div className="relative inline-block">
      <input
        type="file"
        name="profilepic"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        onClick={handleClick}
        className="cursor-pointer relative group"
      >
        {(preview || currentImage) ? (
          <img
            src={preview || currentImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover transition-opacity group-hover:opacity-80"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center transition-colors group-hover:bg-gray-300">
            <UserOutlined className=" rounded-full object-cover -gray-200"  style={{fontSize:"50px"}}/>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center rounded-full  bg-opacity-0 group-hover:bg-opacity-20 transition-all">
          <span className="text-white opacity-0 group-hover:opacity-100">
            Change
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;