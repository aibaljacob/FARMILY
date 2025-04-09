import { notification } from 'antd';

// Configure notifications globally to appear below the header
// and auto-close after 5 seconds without buttons
export const configureNotifications = () => {
  notification.config({
    placement: 'topRight',
    top: 70, // Position below the header
    duration: 5, // Auto-close after 5 seconds
    maxCount: 3, // Limit number of notifications shown simultaneously
  });
};

// Helper function to show success notification
export const showSuccessNotification = (message, description) => {
  notification.success({
    message,
    description,
    placement: 'topRight',
    duration: 5,
    btn: null, // Remove buttons
  });
};

// Helper function to show error notification
export const showErrorNotification = (message, description) => {
  notification.error({
    message,
    description,
    placement: 'topRight',
    duration: 5,
    btn: null, // Remove buttons
  });
};

// Helper function to show info notification
export const showInfoNotification = (message, description) => {
  notification.info({
    message,
    description,
    placement: 'topRight',
    duration: 5,
    btn: null, // Remove buttons
  });
};

// Helper function to show warning notification
export const showWarningNotification = (message, description) => {
  notification.warning({
    message,
    description,
    placement: 'topRight',
    duration: 5,
    btn: null, // Remove buttons
  });
};
