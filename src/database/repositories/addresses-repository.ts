import { Address, Prisma } from '@prisma/client';

export type UserAddressUpdate = Pick<
  Address,
  | 'label'
  | 'cep'
  | 'state'
  | 'city'
  | 'neighborhood'
  | 'street'
  | 'number'
  | 'complement'
>;

export abstract class AddressRepository {
  abstract create(data: Prisma.AddressUncheckedCreateInput): Promise<Address>;
  abstract save(address: Address): Promise<Address>;
  abstract findById(id: string): Promise<Address | null>;
  abstract findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Address | null>;
  abstract saveForUser(
    id: string,
    userId: string,
    data: UserAddressUpdate,
  ): Promise<Address | null>;
  abstract findByUserId(userId: string): Promise<Address[]>;
  abstract findManyByUserId(
    userId: string,
    page: number,
  ): Promise<{ addresses: Address[]; total: number }>;
  abstract findByStoreId(storeId: string): Promise<Address | null>;
}
