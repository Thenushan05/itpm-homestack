"use client";

import React, { useState } from "react";
import styles from "./signin.module.sass";

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Add your sign-in logic here (API call, etc.)
  };

  return (
    <div className={styles.signinContainer}>
      <form onSubmit={handleSubmit} className={styles.signinForm}>
        <h2 className={styles.title}>Sign In</h2>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Sign In
        </button>

        <p className={styles.registerLink}>
          Don&apos;t have an account? <a href="/signup">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default SignInPage;
