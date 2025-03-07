"use client";
import React, { useState } from "react";
import { Form, Input, Button, notification, Spin, Space } from "antd";
import "../auth-sass.sass";
import { Col, Row } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { sellit } from "@/assets/images";
import Image from "next/image";
import Link from "next/link";

// Define the interface for form values
interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

const SignupForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Handle form submission
  const onFinish = (values: SignupFormValues) => {
    setLoading(true); // Show spinner
    setIsButtonDisabled(true); // Disable the button while loading
    console.log("Form values:", values);

    // Simulate a delay for form submission
    setTimeout(() => {
      notification.success({
        message: "Signup Successful!",
        description: "You have successfully signed up.",
      });
      setLoading(false); // Hide spinner
      setIsButtonDisabled(false); // Re-enable the button
      form.resetFields(); // Reset form fields
    }, 2000); // Adjust the timeout duration as necessary
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
                <Form
                  form={form}
                  name="signup"
                  onFinish={onFinish}
                  initialValues={{
                    remember: true,
                  }}
                  layout="vertical"
                >
                  <Form.Item
                    label="Full Name"
                    name="name"
                    className="input"
                    rules={[
                      {
                        required: true,
                        message: "Please input your full name!",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="large size"
                      suffix={<UserOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    className="input"
                    rules={[
                      { required: true, message: "Please input your email!" },
                      { type: "email", message: "Please input a valid email!" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="large size"
                      suffix={<MailOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    className="input"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Space direction="vertical">
                      <Input.Password
                        placeholder="input password"
                        iconRender={(visible) =>
                          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    className="input"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Space direction="vertical">
                      <Input.Password
                        placeholder="input password"
                        iconRender={(visible) =>
                          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item>
                    {loading ? (
                      <Button type="primary" block disabled>
                        <Spin /> Signing Up...
                      </Button>
                    ) : (
                      <Button
                        className="primarybtn"
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
    </div>
  );
};

export default SignupForm;
