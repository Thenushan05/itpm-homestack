"use client";
import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message, Spin } from "antd"; // Use `message` instead of `notification`
import Link from "next/link";
import "../auth-sass.sass";
import { Col, Row } from "antd";
import Image from "next/image";
import { sellit } from "@/assets/images";
import { logo } from "@/assets/images";
import {
  EyeOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Space } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

// Define the interface for form values
interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

const SignupForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // Handle form submission
  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setIsButtonDisabled(true);
    console.log("Form values:", values);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signin",
        {
          email: values.email,
          password: values.password,
        }
      );
      console.log(response);

      // Handle successful login
      if (response.data.token) {
        messageApi.success("✅ Login Successful! Redirecting...", 2); // Popup toast with 2-second duration

        if (values.remember) {
          // Save the token to localStorage
          localStorage.setItem("token", response.data.token);
        } else {
          sessionStorage.setItem("token", response.data.token);
        }
        // Redirect to the dashboard after 2 seconds

        router.push("/dashboard");

        form.resetFields();
      } else {
        console.log("Login failed!");
        messageApi.error("❌ Invalid credentials. Please try again.", 2); // Error popup toast
      }
    } catch (error) {
      console.error("Error during login:", error);
      messageApi.error("❌ Login Failed! Something went wrong.", 2);
    } finally {
      setLoading(false);
      setIsButtonDisabled(false);
    }
  };

  return (
    <div className="signup-form-container">
      {contextHolder}
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
                        disabled={isButtonDisabled}
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
