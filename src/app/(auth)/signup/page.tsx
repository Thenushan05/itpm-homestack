"use client";
import React, { useState } from "react";
import { Form, Input, Button, notification, Spin, Switch, Modal } from "antd";
import { Col, Row } from "antd";
import "../auth-sass.sass";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { sellit } from "@/assets/images";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

interface SignupFormValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "owner" | "member";
  homeName: string;
}

const SignupForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [role, setRole] = useState<"owner" | "member">("owner"); // Default set to "owner"
  const [isModalVisible, setIsModalVisible] = useState(false); // State for controlling the modal visibility

  const onFinish = async (values: SignupFormValues) => {
    setLoading(true);
    setIsButtonDisabled(true);

    try {
      const payload = {
        firstName: values.firstname,
        lastName: values.lastname,
        email: values.email,
        password: values.password,
        role: values.role,
        homeName:
          values.role === "member" || values.role === "owner"
            ? values.homeName
            : undefined,
      };

      const endpoint =
        values.role === "owner"
          ? "http://localhost:5000/api/auth/signup-owner"
          : "http://localhost:5000/api/auth/signup-family-member";

      const response = await axios.post(endpoint, payload);

      if (response.status === 201) {
        if (values.role === "owner") {
          // Navigate to dashboard if the user is an owner
          notification.success({
            message: "Signup Successful!",
            description: "You have successfully signed up as an owner.",
          });
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        } else {
          // Show modal if the user is a member
          setIsModalVisible(true);
        }

        form.resetFields();
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);

      let errorMessage = "Something went wrong!";
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      notification.error({
        message: "Signup Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setIsButtonDisabled(false);
    }
  };

  const handleOk = () => {
    // Close the modal and redirect to the login page
    setIsModalVisible(false);
    window.location.href = "/signin";
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Just close the modal if cancel is clicked
  };

  return (
    <div className="signup-form-container">
      <div className="signup-form">
        <Row>
          <Col xs={24} sm={24} md={24} lg={12}>
            <div className="login-image">
              <Image src={sellit} alt="wallpaper" fill />
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <div className="signup-inner-form-container">
              <div className="signup-form-inner">
                <h2 className="title">Sign Up</h2>

                {/* Role toggle at the top */}
                <Form
                  form={form}
                  name="signup"
                  onFinish={onFinish}
                  layout="vertical"
                >
                  <Form.Item
                    label="Select Role"
                    name="role"
                    initialValue="owner"
                  >
                    <Switch
                      checked={role === "member"}
                      onChange={(checked) => {
                        const newRole = checked ? "member" : "owner";
                        setRole(newRole);
                        form.setFieldsValue({ role: newRole }); // Sync role with form state
                      }}
                      checkedChildren="Member"
                      unCheckedChildren="Owner"
                    />
                  </Form.Item>

                  <Form.Item
                    label="First Name"
                    name="firstname"
                    rules={[
                      {
                        required: true,
                        message: "Please input your first name!",
                      },
                    ]}
                  >
                    <Input size="large" suffix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    label="Last Name"
                    name="lastname"
                    rules={[
                      {
                        required: true,
                        message: "Please input your last name!",
                      },
                    ]}
                  >
                    <Input size="large" suffix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Please input your email!" },
                      { type: "email", message: "Please input a valid email!" },
                    ]}
                  >
                    <Input size="large" suffix={<MailOutlined />} />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          return !value || getFieldValue("password") === value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error("Passwords do not match!")
                              );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  {/* Show Home ID input only if role is "owner" or "member" */}
                  {role === "owner" && (
                    <Form.Item
                      label="Home ID (for Members)"
                      name="homeName"
                      rules={[
                        { required: true, message: "Please enter a Home ID!" },
                      ]}
                    >
                      <Input placeholder="Enter Home ID for Members" />
                    </Form.Item>
                  )}

                  {role === "member" && (
                    <Form.Item
                      label="Home ID"
                      name="homeName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the Home ID!",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Home ID" />
                    </Form.Item>
                  )}

                  <Form.Item>
                    {loading ? (
                      <Button type="primary" block disabled>
                        <Spin /> Signing Up...
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        disabled={isButtonDisabled}
                      >
                        Sign Up
                      </Button>
                    )}
                  </Form.Item>

                  <p className="register">
                    Already have an account?{" "}
                    <Link href="./../signin" className="register-nav">
                      Sign in
                    </Link>
                  </p>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Modal for Member SignUp */}
      <Modal
        title="Member Created!"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Back to Login
          </Button>,
        ]}
      >
        <p>You have successfully signed up as a member.</p>
      </Modal>
    </div>
  );
};

export default SignupForm;
