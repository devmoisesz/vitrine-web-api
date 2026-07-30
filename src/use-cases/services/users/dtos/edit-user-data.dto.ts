export interface InputEditUserDataDto {
  name?: string;
  email?: string;
}

export interface OutputEditUserDataDto {
  name: string | null;
  email: string | null;
}
