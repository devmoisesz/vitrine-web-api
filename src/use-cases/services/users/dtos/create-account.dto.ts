export interface InputCreateAccountDto {
  name: string;
  email: string;
  password: string;
}

export interface OutputCreateAccountDto {
  id: string;
  name: string;
  email: string;
  password: string;
}
