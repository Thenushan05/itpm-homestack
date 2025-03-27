"use client";
import React, { useState } from "react";
import { Form, Input, Button, notification, Spin, Space } from "antd";
import "../auth-sass.sass";
import { Col, Row } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { sellit } from "@/assets/images";
import Image from "next/image";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Handle reset password process
  const handleResetPassword = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        setIsButtonDisabled(true);
        console.log("New Password:", values.newPassword);

        // Simulate API request delay
        setTimeout(() => {
          notification.success({
            message: "Password Reset Successful!",
            description: "Your password has been updated.",
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
                <h2 className="title">Reset Password</h2>
                <p>Enter a new password for your account.</p>
                <Form form={form} name="reset-password" layout="vertical">
                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your new password!",
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
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your new password!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
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

export default ResetPassword;
