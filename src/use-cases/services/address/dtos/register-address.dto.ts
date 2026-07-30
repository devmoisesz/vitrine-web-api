export interface InputAddressDto {
  label?: string;
  cep?: string;
  state: string;
  city: string;
  neighborhood: string;
  street?: string;
  number?: string;
  complement?: string;
  createdAt?: Date;
}
