import React, { useRef } from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DealInvoice = ({ dealData, buyerDetails, demandDetails, isDemandDeal = true, visible = false }) => {
  const invoiceRef = useRef(null);
  
  const generatePDF = async () => {
    const invoice = invoiceRef.current;
    
    if (!invoice) return;
    
    try {
      const canvas = await html2canvas(invoice, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`farmily_deal_${dealData.id || new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  // Format currencies
  const formatCurrency = (value) => {
    return `₹${parseFloat(value).toFixed(2)}`;
  };
  
  // Get current date formatted
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate total amount
  const calculateTotal = () => {
    if (isDemandDeal) {
      const price = parseFloat(dealData.offered_price || 0);
      const quantity = parseFloat(dealData.offered_quantity || 0);
      return price * quantity;
    } else {
      const price = parseFloat(dealData.offered_price || 0);
      const quantity = parseFloat(dealData.quantity || 0);
      return price * quantity;
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="deal-invoice-container">
      <Button 
        type="primary" 
        icon={<PrinterOutlined />} 
        onClick={generatePDF}
        style={{ marginBottom: '16px' }}
      >
        Generate Invoice
      </Button>
      
      <div 
        ref={invoiceRef} 
        className="invoice-template" 
        style={{ 
          padding: '20px',
          border: '1px solid #ddd',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#fff',
          fontFamily: 'Arial, sans-serif',
          color: '#333',
          position: 'relative'
        }}
      >
        {/* Invoice Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '30px',
          borderBottom: '2px solid #2d6a4f',
          paddingBottom: '10px'
        }}>
          <div>
            <h1 style={{ color: '#2d6a4f', margin: '0 0 5px 0', fontSize: '24px' }}>FARMILY</h1>
            <p style={{ margin: '0', fontSize: '14px' }}>Direct Farm to Consumer Platform</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>DEAL INVOICE</h2>
            <p style={{ margin: '0', fontSize: '14px' }}>Date: {getCurrentDate()}</p>
            <p style={{ margin: '0', fontSize: '14px' }}>Deal ID: #{dealData.id}</p>
          </div>
        </div>
        
        {/* Party Information */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '30px' 
        }}>
          <div style={{ width: '48%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d6a4f' }}>Farmer</h3>
            <p style={{ margin: '0', fontSize: '14px' }}><strong>
              {isDemandDeal ? 
                `${dealData.farmer_first_name || ''} ${dealData.farmer_last_name || ''}` : 
                demandDetails.farmer_name || 'Farmer'
              }
            </strong></p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              {isDemandDeal ? dealData.farmer_location || '' : demandDetails.farmer_location || ''}
            </p>
          </div>
          <div style={{ width: '48%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d6a4f' }}>Buyer</h3>
            <p style={{ margin: '0', fontSize: '14px' }}><strong>{buyerDetails.name || 'Buyer'}</strong></p>
            <p style={{ margin: '0', fontSize: '14px' }}>{buyerDetails.location || ''}</p>
            <p style={{ margin: '0', fontSize: '14px' }}>Phone: {buyerDetails.phone || 'N/A'}</p>
            <p style={{ margin: '0', fontSize: '14px' }}>Email: {buyerDetails.email || 'N/A'}</p>
            {buyerDetails.company && buyerDetails.company !== 'Not specified' && (
              <p style={{ margin: '0', fontSize: '14px' }}>Company: {buyerDetails.company}</p>
            )}
          </div>
        </div>
        
        {/* Deal Details */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d6a4f', 
            borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Deal Details
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Product</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Quantity</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Price Per Unit</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {isDemandDeal 
                    ? (demandDetails.title || (demandDetails.category && demandDetails.category.charAt(0).toUpperCase() + demandDetails.category.slice(1)) || 'Product')
                    : (demandDetails.name || (demandDetails.category && demandDetails.category.charAt(0).toUpperCase() + demandDetails.category.slice(1)) || 'Product')
                  }
                </td>
                <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                  {isDemandDeal 
                    ? `${dealData.offered_quantity} ${demandDetails.unit || 'units'}`
                    : `${dealData.quantity} ${demandDetails.unit || 'units'}`
                  }
                </td>
                <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                  {formatCurrency(dealData.offered_price)} / {demandDetails.unit || 'unit'}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                  {formatCurrency(calculateTotal())}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <td colSpan="3" style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                  <strong>Total</strong>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                  <strong>{formatCurrency(calculateTotal())}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Payment Info and Notes */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '48%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d6a4f' }}>Payment Info</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>Payment Method: Cash on Delivery</p>
            <p style={{ margin: '0', fontSize: '14px' }}>Payment Status: Pending</p>
          </div>
          <div style={{ width: '48%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d6a4f' }}>Notes</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              {isDemandDeal 
                ? (dealData.notes || 'No additional notes.')
                : (dealData.notes || 'No additional notes.')
              }
            </p>
          </div>
        </div>
        
        {/* Signatures */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '50px',
          marginBottom: '20px'
        }}>
          <div style={{ width: '45%', borderTop: '1px solid #ddd', paddingTop: '10px', textAlign: 'center' }}>
            <p style={{ margin: '0', fontSize: '14px' }}>Farmer Signature</p>
          </div>
          <div style={{ width: '45%', borderTop: '1px solid #ddd', paddingTop: '10px', textAlign: 'center' }}>
            <p style={{ margin: '0', fontSize: '14px' }}>Buyer Signature</p>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '10px', textAlign: 'center' }}>
          <p style={{ margin: '0', fontSize: '12px', color: '#777' }}>
            This is a computer-generated invoice and does not require a signature.
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#777' }}>
            Farmily - Connecting Farmers and Buyers Directly
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealInvoice; 