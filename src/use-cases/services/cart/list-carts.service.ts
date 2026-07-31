import { CartsRepository } from '@/database/repositories/carts-repository';
import {
    Injectable
} from '@nestjs/common';
import { Cart } from '@prisma/client';

@Injectable()
export class ListCartsService {
  constructor(
    private cartsRepository: CartsRepository,
  ) {}

  async execute(
    userId: string,
    page: number
  ): Promise<{carts: Cart[], total: number}> {
   return await this.cartsRepository.findMany(userId, page)
  }
}
