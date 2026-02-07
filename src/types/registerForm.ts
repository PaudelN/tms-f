export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface Errors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  general?: string;
}

export interface PasswordStrength {
  percentage: number;
  Label: string;
  colorClass: string;
  bgClass: string;
}
