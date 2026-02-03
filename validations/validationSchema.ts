// components/validation.ts
import * as yup from "yup";

export const signupSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can contain only letters and spaces")
    .required("Name is required"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters")
    .required("Email is required"),

  mobile: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    )
    .required("Password is required"),
});

export const signinSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
