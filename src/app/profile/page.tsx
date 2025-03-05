"use client";

import React, { useState } from "react";
import { Layout, Form, Input, Button, Upload, message, Image } from "antd";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const { Content } = Layout;

interface FormValues {
  username: string;
  email: string;
}

const ProfileSettings: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // Handle form submission
  const onFinish = (values: FormValues) => {
    console.log("Form values:", values);
    message.success("Profile updated successfully!");
  };

  // Handle form submission failure
  const onFinishFailed = (errorInfo: ValidateErrorEntity<FormValues>) => {
    console.log("Failed:", errorInfo);
    message.error("Please correct the errors in the form.");
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Layout style={{ padding: "50px" }}>
      <Content style={{ margin: "0 auto", maxWidth: "600px" }}>
        <h1 style={{ textAlign: "center" }}>Profile Settings</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            username: "John Doe",
            email: "john.doe@example.com",
          }}
        >
          {/* Profile Image Upload */}
          <Upload
            action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
            listType="picture-circle"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {fileList.length === 0 && uploadButton}
          </Upload>

          {previewImage && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}

          {/* Username Input */}
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          {/* Email Input */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default ProfileSettings;
