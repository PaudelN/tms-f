export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface Errors {
  email?: string;
  password?: string;
  general?: string;
  [key: string]: string | undefined;
}

export interface LoginResponse {
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  message?: string;
}
