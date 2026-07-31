export interface InputStoreManageProductsDto {
  slugStore: string;
  page: number;
  name?: string;
  categoryId?: string;
  subcategoryId?: string;
  status?: 'ATIVO' | 'INATIVO';
}
