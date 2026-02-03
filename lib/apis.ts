import api from "../lib/axios";

type SignUpPayload = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

export const signupApi = async (data: SignUpPayload) => {
  try {
    const response = await api.post("/api/auth/signup", data);
    return response;
  } catch (error: any) {
    console.log("API ERROR", error.response || error.message);
    throw error; // so SignUp screen can handle
  }
};

// SignIn API
export type SignInPayload = {
  email: string;
  password: string;
};

export const signinApi = async (data: SignInPayload) => {
  try {
    const response = await api.post("/api/auth/signin", data);
    return response;
  } catch (error: any) {
    console.log("SIGNIN API ERROR ", error.response || error.message);
    throw error; // so the SignIn screen can handle it
  }
};
