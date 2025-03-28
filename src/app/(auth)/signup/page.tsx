"use client";
import React, { useState } from "react";
import { Form, Input, Button, notification, Spin, Radio } from "antd";
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
  ownerId?: string;
}

const SignupForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [role, setRole] = useState<"owner" | "member">("owner");

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
        ownerId: values.role === "member" ? values.ownerId : undefined,
      };

      const endpoint =
        values.role === "owner"
          ? "http://localhost:5000/api/auth/signup-owner"
          : "http://localhost:5000/api/auth/signup-family-member";

      const response = await axios.post(endpoint, payload);

      if (response.status === 201) {
        notification.success({
          message: "Signup Successful!",
          description: "You have successfully signed up.",
        });
        form.resetFields();

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
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
                  layout="vertical"
                >
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

                  <Form.Item
                    label="Sign up as"
                    name="role"
                    initialValue="owner"
                  >
                    <Radio.Group
                      onChange={(e) => setRole(e.target.value)}
                      value={role}
                    >
                      <Radio value="owner">Owner</Radio>
                      <Radio value="member">Member</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {role === "member" && (
                    <Form.Item
                      label="Owner ID"
                      name="ownerId"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the Owner ID!",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Owner ID" />
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
    </div>
  );
};

export default SignupForm;
