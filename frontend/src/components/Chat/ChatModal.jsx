import React from 'react';
import { Modal } from 'antd';
import Chat from './Chat';
import './ChatModal.css';

const ChatModal = ({ visible, onClose, dealId, dealType, dealTitle }) => {
  console.log('ChatModal props:', { visible, dealId, dealType, dealTitle });
  
  return (
    <Modal
      title={`Chat - ${dealTitle || 'Deal'}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="chat-modal"
      destroyOnClose={true}
    >
      <Chat 
        dealId={dealId} 
        dealType={dealType} 
        onClose={onClose} 
      />
    </Modal>
  );
};

export default ChatModal; 