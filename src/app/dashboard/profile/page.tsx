"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  Upload,
  message,
  Image,
  Typography,
} from "antd";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import axios from "axios";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const { Content } = Layout;
const { Title, Text } = Typography;

interface FormValues {
  username: string;
  email: string;
}

const ProfileSettings: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // 🔹 Fetch user profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("No authentication token found. Please log in.");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/user-profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { ownerId, role, username, email } = response.data;
        setOwnerId(ownerId);
        setRole(role);
        form.setFieldsValue({ username, email }); // Set user details in form
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Failed to fetch profile details.");
      }
    };

    fetchProfile();
  }, []);

  // 🔹 Handle image preview
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // 🔹 Handle form submission
  const onFinish = async (values: FormValues) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No authentication token found.");
        return;
      }

      await axios.put(
        "http://localhost:5000/api/user-profile",
        { username: values.username, email: values.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile.");
    }
  };

  // 🔹 Handle form submission failure
  const onFinishFailed = (errorInfo: ValidateErrorEntity<FormValues>) => {
    console.log("Failed:", errorInfo);
    message.error("Please correct the errors in the form.");
  };

  // 🔹 Handle image upload change
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
        <Title level={2} style={{ textAlign: "center" }}>
          Profile Settings
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
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

          {/* Show Owner ID if the user is an Owner */}
          {role === "owner" && ownerId && (
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <Title level={4}>Owner ID</Title>
              <Text copyable>{ownerId}</Text>
              <p style={{ fontSize: "14px", color: "#888" }}>
                Share this ID with family members to join your account.
              </p>
            </div>
          )}

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
