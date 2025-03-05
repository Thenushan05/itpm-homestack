"use client";
import React, { useState } from "react";
import { Form, Input, Button, notification, Spin } from "antd";
import "../auth-sass.sass";
import { Col, Row } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { sellit } from "@/assets/images";
import Image from "next/image";
const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Handle password reset process
  const handleResetPassword = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        setIsButtonDisabled(true);
        console.log("Reset Password for:", values.email);

        // Simulate API request delay
        setTimeout(() => {
          notification.success({
            message: "Reset Link Sent!",
            description: "A password reset link has been sent to your email.",
          });
          setLoading(false);
          setIsButtonDisabled(false);
          form.resetFields();
        }, 2000);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
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
                <h2 className="title">Forgot Password</h2>
                <p className="enter-mail">
                  Enter your email to receive a password reset link.
                </p>
                <Form form={form} name="forgot-password" layout="vertical">
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email!" },
                      {
                        type: "email",
                        message: "Enter a valid email address!",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Enter Your Registered E-mail"
                      suffix={<MailOutlined />}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      className="primarybtn"
                      type="primary"
                      block
                      onClick={handleResetPassword}
                      disabled={isButtonDisabled}
                    >
                      {loading ? <Spin /> : "Reset Password"}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ForgotPassword;
