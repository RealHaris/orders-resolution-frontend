import { request } from "@/common/http";
import type {
  AuthCredentials,
  AuthSuccessData,
  User,
} from "@/common/types/application/user";

/**
 * POST /api/users/signup
 */
export const signup = async (
  credentials: AuthCredentials,
): Promise<AuthSuccessData> => {
  try {
    const response = await request({
      method: "POST",
      path: "users/signup",
      data: credentials,
    });
    return response as AuthSuccessData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST /api/users/login
 */
export const login = async (
  credentials: AuthCredentials,
): Promise<AuthSuccessData> => {
  try {
    const response = await request({
      method: "POST",
      path: "users/login",
      data: credentials,
    });
    return response as AuthSuccessData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST /api/users/logout — public; always clears the cookie.
 */
export const logout = async (): Promise<{ msg: string }> => {
  try {
    const response = await request({
      method: "POST",
      path: "users/logout",
    });
    return response as { msg: string };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * GET /api/users/me
 */
export const getMe = async (): Promise<User> => {
  try {
    const response = await request({
      method: "GET",
      path: "users/me",
    });
    return response as User;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
