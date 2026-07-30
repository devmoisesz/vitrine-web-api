export interface InputGetProfileDto {
  userId: string;
}

interface AddressResponse {
  label: string | null;
  cep: string | null;
  state: string;
  city: string;
  neighborhood: string;
  street: string | null;
  number: string | null;
  complement: string | null;
  createdAt: Date;
}

export interface OutputGetProfileDto {
  user_name: string;
  user_email: string;
  provider: 'LOCAL' | 'GOOGLE';
  user_role?: string;
  store_name?: string;
  store_address?: AddressResponse;
  user_address: AddressResponse[];
}
