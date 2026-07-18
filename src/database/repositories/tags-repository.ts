import { Prisma, Tag } from "@prisma/client";

export abstract class TagsRepository {
    abstract create(data: Prisma.TagUncheckedCreateInput): Promise<Tag>
}