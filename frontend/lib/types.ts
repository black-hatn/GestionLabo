export type UserRole = "ADMIN" | "RECEPTIONIST" | "COLLECTOR" | "LAB_TECH" | "DOCTOR";

export type LoginPayload = {
  email: string;
  password: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
};
