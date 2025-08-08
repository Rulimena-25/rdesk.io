import React, { useState } from 'react';
import { Upload, Button, message, Card, Typography, List } from 'antd';
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { contactAPI } from '../../services/api';

const { Title, Text } = Typography;

const ContactUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);

    setUploading(true);
    try {
      const response = await contactAPI.uploadContacts(formData);
      
      if (response.data.success) {
        message.success(response.data.message);
        setUploadResult(response.data.data);
        setFileList([]);
      } else {
        message.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = ({ fileList }) => {
    // Only allow one file
    if (fileList.length > 0) {
      setFileList([fileList[fileList.length - 1]]);
    } else {
      setFileList([]);
    }
  };

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.ms-excel' || 
                   file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.type === 'text/csv';
    
    if (!isExcel) {
      message.error('You can only upload Excel or CSV files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }
    
    return true;
  };

  return (
    <div>
      <Card>
        <Title level={4}>Upload Contacts</Title>
        <Text type="secondary">
          Upload Excel or CSV files with contact data. The system will automatically detect:
        </Text>
        <List
          size="small"
          dataSource={[
            'CustomerID, CustomerName, AgentID, ProductID (key fields)',
            'Phone numbers from any column containing "phone", "tel", "mobile", etc.',
            'Indonesian phone number formats (62 or 0 prefix)'
          ]}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
        
        <Upload
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={beforeUpload}
          accept=".xlsx,.xls,.csv"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button>
      </Card>

      {uploadResult && (
        <Card title="Upload Results" style={{ marginTop: 20 }}>
          <p><Text strong>File:</Text> {uploadResult.filename}</p>
          <p><Text strong>Size:</Text> {Math.round(uploadResult.size / 1024)} KB</p>
          <p><Text strong>Contacts Created:</Text> {uploadResult.contactsCreated}</p>
          
          {(uploadResult.parsingErrors && uploadResult.parsingErrors.length > 0) && (
            <div>
              <Text strong type="warning">Parsing Errors: {uploadResult.parsingErrors.length}</Text>
              <List
                size="small"
                dataSource={uploadResult.parsingErrors.slice(0, 5)}
                renderItem={error => (
                  <List.Item>
                    <Text type="warning">{error.error}</Text>
                  </List.Item>
                )}
              />
              {uploadResult.parsingErrors.length > 5 && (
                <Text type="secondary">... and {uploadResult.parsingErrors.length - 5} more errors</Text>
              )}
            </div>
          )}
          
          {(uploadResult.savingErrors && uploadResult.savingErrors.length > 0) && (
            <div>
              <Text strong type="danger">Saving Errors: {uploadResult.savingErrors.length}</Text>
              <List
                size="small"
                dataSource={uploadResult.savingErrors.slice(0, 5)}
                renderItem={error => (
                  <List.Item>
                    <Text type="danger">{error.error}</Text>
                  </List.Item>
                )}
              />
              {uploadResult.savingErrors.length > 5 && (
                <Text type="secondary">... and {uploadResult.savingErrors.length - 5} more errors</Text>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ContactUpload;