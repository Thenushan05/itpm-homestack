"use client";
import React, { useState } from "react";
import { Form, Input, Button, Checkbox, notification } from "antd";
import Link from "next/link";
import "../auth-sass.sass";
import { Col, Row, Spin } from "antd";
import Image from "next/image";
import { sellit } from "@/assets/images";
import { logo } from "@/assets/images";
import { EyeOutlined, MailOutlined } from "@ant-design/icons";
import { EyeInvisibleOutlined } from "@ant-design/icons";
import { Space } from "antd";

// Define the interface for form values
interface SignupFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

const SignupForm: React.FC = () => {
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
      form.resetFields(); // Reset the form
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
              <div className="logo">
                <Image src={logo} alt="logo" />
              </div>
              <div className="signup-form-inner">
                <h2 className="title">Sign In</h2>
                <Form
                  form={form}
                  name="signin"
                  onFinish={onFinish}
                  initialValues={{ remember: true }}
                  layout="vertical"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Please input your email!" },
                      { type: "email", message: "Please input a valid email!" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Enter your mail"
                      suffix={<MailOutlined />}
                    />
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
                    <Space direction="vertical">
                      <Input.Password
                        placeholder="Input password"
                        iconRender={(visible) =>
                          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Form.Item
                        name="remember"
                        valuePropName="checked"
                        noStyle
                      >
                        <Checkbox>Remember Me</Checkbox>
                      </Form.Item>
                      <Link href="/forgot-password" className="forgot">
                        Forgot Password?
                      </Link>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    {loading ? (
                      <Button type="primary" block disabled>
                        <Spin /> Signing In...
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="primarybtn"
                        block
                        disabled={isButtonDisabled} // Disable button during loading
                      >
                        Sign In
                      </Button>
                    )}
                  </Form.Item>

                  <p className="register">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="register-nav">
                      Register here
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
