/** Authenticated role for this product. */
export enum UserRoles {
  USER = "User",
}

/** Public user shape returned by auth endpoints (password is never included). */
export type User = {
  _id: string;
  email: string;
  role: UserRoles;
};

/** Signup / login request body. */
export type AuthCredentials = {
  email: string;
  password: string;
};

/** Signup / login success payload after HTTP unwrap. */
export type AuthSuccessData = {
  user: User;
};
