"use client"; 

import React, { useState } from 'react';
import { Layout, Form, Input, Button, Upload, Avatar, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import { RcFile } from 'antd/lib/upload/interface';

const { Content } = Layout;

const ProfileSettings: React.FC = () => {
  // State to manage form data
  const [form] = Form.useForm();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Handle the profile image upload
  const handleUpload = (info: UploadChangeParam) => {
    const file = info.file.originFileObj as RcFile;

    // Show preview of the uploaded image
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const onFinish = (values: any) => {
    console.log('Form values:', values);
    message.success('Profile updated successfully!');
  };

  // Handle form submission failure
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout style={{ padding: '50px' }}>
      <Content style={{ margin: '0 auto', maxWidth: '600px' }}>
        <h1>Profile Settings</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            username: 'John Doe',
            email: 'john.doe@example.com',
          }}
        >
          <Form.Item label="Profile Image">
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={profileImage}
              style={{ marginBottom: 10 }}
            />
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUpload}
            >
              <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default ProfileSettings;
