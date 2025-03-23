
"use client";
import React, { useState } from "react";
import { Form, Input, Button, notification, Spin } from "antd";
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
}

const SignupForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const onFinish = async (values: SignupFormValues) => {
    setLoading(true);
    setIsButtonDisabled(true);

    try {
      const response = await axios.post("http://localhost:9095/api/v1/auth/register", 
      
       {
          firstName: values.firstname,
          lastName: values.lastname,
          email: values.email,
          password: values.password,
        
      });

      if(response){

        notification.success({
          message: "Signup Successful!",
          description: "You have successfully signed up.",
        });
        form.resetFields();

        // redirect to login page
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }


    } catch (error: any) {
      console.log("Signup error:", error);
      
      notification.error({
        message: "Signup Failed",
        description: error.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
      setIsButtonDisabled(false);
    }
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
                <Form form={form} name="signup" onFinish={onFinish} layout="vertical">
                  <Form.Item
                    label="First Name"
                    name="firstname"
                    rules={[{ required: true, message: "Please input your first name!" }]}
                  >
                    <Input size="large" suffix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    label="Last Name"
                    name="lastname"
                    rules={[{ required: true, message: "Please input your last name!" }]}
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
                    rules={[{ required: true, message: "Please input your password!" }]}
                  >
                    <Input.Password
                      placeholder="input password"
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Please confirm your password!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Passwords do not match!"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="confirm password"
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

                  <Form.Item>
                    {loading ? (
                      <Button type="primary" block disabled>
                        <Spin /> Signing Up...
                      </Button>
                    ) : (
                      <Button type="primary" htmlType="submit" block disabled={isButtonDisabled}>
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
