import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Store } from '@prisma/client';
import { StoresRepository, type StoreWithProducts, type StoreWithSegments } from '@/database/repositories/stores-repository';

const segmentInclude = { storeSegments: { include: { segment: true } } } as const;

@Injectable()
export class PrismaStoresRepository implements StoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    page: number,
    name?: string,
    segmentSlugs?: string[],
  ): Promise<{ stores: StoreWithSegments[], total: number }> {
    const pageSize = 20;

    const where: Prisma.StoreWhereInput = {
      status: 'ATIVA',
      storeSegments: segmentSlugs?.length
        ? { some: { segment: { slug: { in: segmentSlugs } } } }
        : undefined,
      OR: name
        ? [
            { name: { contains: name, mode: 'insensitive' } },
            { description: { contains: name, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [stores, total] = await this.prisma.$transaction([
      this.prisma.store.findMany({
        where,
        include: segmentInclude,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.store.count({ where }),
    ]);

    return { stores, total };
  }

  async findManyWithProducts(
  page: number,
  name?: string,
): Promise<{ stores: StoreWithProducts[], total: number }> {
  const pageSize = 5;

  const where: Prisma.StoreWhereInput = {
    status: 'ATIVA',
    OR: name
      ? [
          { name: { contains: name, mode: 'insensitive' } },
          { description: { contains: name, mode: 'insensitive' } },
        ]
      : undefined,
  };

  const storeIds = await this.prisma.$queryRaw<{ id: string }[]>`
    SELECT "id"
    FROM "stores"
    WHERE "status" = 'ATIVA'
    ${name ? Prisma.sql`
      AND (
        "name" ILIKE ${`%${name}%`}
        OR "description" ILIKE ${`%${name}%`}
      )
    ` : Prisma.empty}
    ORDER BY
      MD5("id"::text || CURRENT_DATE::text),
      "id"
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  const stores = await this.prisma.store.findMany({
    where: {
      id: {
        in: storeIds.map(store => store.id),
      },
    },
    include: {
      ...segmentInclude,
      products: {
        where: {
          status: 'ATIVO',
        },
        take: 8,
        orderBy: {
        createdAt: 'desc',
      },
      include: {
        products_images: {
          where: {
            is_main: true
          }
        }
      }
      }
    },
  });

  const storesMap = new Map(
    stores.map(store => [store.id, store]),
  );

  const orderedStores = storeIds
    .map(({ id }) => storesMap.get(id))
    .filter((store) => store !== undefined);

  const total = await this.prisma.store.count({ where });

  return {
    stores: orderedStores,
    total,
  };
}

  async findAll(
    page: number,
    name?: string,
  ): Promise<{ stores: Store[], total: number }> {
    const pageSize = 20;

    const where: Prisma.StoreWhereInput = {
      OR: name
        ? [
            { name: { contains: name, mode: 'insensitive' } },
            { description: { contains: name, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [stores, total] = await this.prisma.$transaction([
      this.prisma.store.findMany({
        where,
        include: segmentInclude,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
          createdAt: 'asc',
        },
      }),
      this.prisma.store.count({ where }),
    ]);

    return { stores, total };
  }

  async create(data: Prisma.StoreUncheckedCreateInput, segmentIds?: string[]): Promise<Store> {
    try {
      return await this.prisma.store.create({
        data: { ...data, ...(segmentIds ? { storeSegments: { create: segmentIds.map(segmentId => ({ segmentId })) } } : {}) },
      });
    } catch (error) { this.handleSegmentAssignmentError(error); }
  }

  async save(store: Store, segmentIds?: string[]): Promise<Store> {
    // findBySlug includes relations for public display; never write those objects as scalar data.
    const { storeSegments: _segments, ...data } = store as StoreWithSegments;
    try { return await this.prisma.store.update({
      where: {
        id: store.id,
      },
      data: {
        ...data,
        ...(segmentIds !== undefined ? { storeSegments: {
          deleteMany: {},
          create: segmentIds.map(segmentId => ({ segmentId })),
        } } : {}),
      },
    }); } catch (error) { this.handleSegmentAssignmentError(error); }
  }

  private handleSegmentAssignmentError(error: unknown): never {
    if ((error as { code?: string })?.code === 'P2003') {
      throw new BadRequestException('Um segmento não está mais disponível. Atualize a lista e tente novamente.');
    }
    throw error;
  }

  async saveImage(id: string, url: string, public_id: string): Promise<void> {
    await this.prisma.store.update({
      where: {
        id,
      },
      data: {
        logo_image_url: url,
        logoPublicId: public_id,
      },
    });
  }

  async saveBanner(id: string, url: string, public_id: string): Promise<void> {
    await this.prisma.store.update({
      where: {
        id,
      },
      data: {
        bannerUrl: url,
        bannerPublicId: public_id,
      },
    });
  }

  async disable(slug: string): Promise<void> {
    await this.prisma.store.update({
      where: {
        slug,
      },
      data: {
        status: 'INATIVA',
      },
    });
  }

  async activate(slug: string): Promise<void> {
    await this.prisma.store.update({
      where: {
        slug,
      },
      data: {
        status: 'ATIVA',
      },
    });
  }

  async findByWhatsapp(whatsapp: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: {
        whatsapp,
      },
    });

    if (!store) return null;

    return store;
  }

  async findById(id: string): Promise<Store | null> {
    const user = await this.prisma.store.findUnique({
      where: {
        id,
      },
    });

    if (!user) return null;

    return user;
  }

  async findBySLugAndEmail(slug: string, email: string): Promise<Store | null> {
    const user = await this.prisma.store.findUnique({
      where: {
        slug,
        email,
      },
    });

    if (!user) return null;

    return user;
  }

  async findBySlug(slug: string): Promise<StoreWithSegments | null> {
    const user = await this.prisma.store.findUnique({
      include: segmentInclude,
      where: {
        slug,
      },
    });

    if (!user) return null;

    return user;
  }
}
