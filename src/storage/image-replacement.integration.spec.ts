import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { ChangeProductImageService } from '@/use-cases/services/products/change-product-image.service';
import { ChangeStoreLogoService } from '@/use-cases/services/stores/change-store-logo.service';
import { ChangeStoreBannerService } from '@/use-cases/services/stores/change-store-banner.service';
import { ProductsInMemoryRepository } from '../../test/in-memory-repository/product-in-memory-repository';
import { ProductsImagesInMemoryRepository } from '../../test/in-memory-repository/product-images-in-memory-repository';
import { StoresInMemoryRepository } from '../../test/in-memory-repository/stores-in-memory-repository';
import { StorageInMemory } from '../../test/in-memory-repository/storage-in-memory';
import { makeFakeMulterFile } from '../../test/factories/make-multer-file';

describe.each(['main-product', 'secondary-product', 'logo', 'banner'] as const)(
  'Safe image replacement: %s',
  (kind) => {
    let storage: StorageInMemory;
    let run: () => Promise<unknown>;
    let currentFile: () => Promise<string>;
    let failPersistence: (error: Error) => void;
    let oldId: string;
    let images: ProductsImagesInMemoryRepository;
    let imageId: string;
    const file = makeFakeMulterFile('same-name.png');

    beforeEach(async () => {
      vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
      storage = new StorageInMemory();
      const old = await storage.upload({
        body: file.buffer,
        fileName: file.originalname,
      });
      oldId = old.public_id;
      const stores = new StoresInMemoryRepository();
      const store = await stores.create({
        name: 'Store',
        slug: 'store',
        whatsapp: '11999999999',
      });
      images = new ProductsImagesInMemoryRepository();

      if (kind === 'logo') {
        await stores.saveImage(store.id, old.url, oldId);
        const service = new ChangeStoreLogoService(stores, storage);
        run = () => service.execute(store.slug, file);
        currentFile = async () =>
          (await stores.findBySlug(store.slug))!.logoPublicId!;
        failPersistence = (error) => {
          vi.spyOn(stores, 'saveImage').mockRejectedValueOnce(error);
        };
      } else if (kind === 'banner') {
        await stores.saveBanner(store.id, old.url, oldId);
        const service = new ChangeStoreBannerService(stores, storage);
        run = () => service.execute(store.slug, file);
        currentFile = async () =>
          (await stores.findBySlug(store.slug))!.bannerPublicId!;
        failPersistence = (error) => {
          vi.spyOn(stores, 'saveBanner').mockRejectedValueOnce(error);
        };
      } else {
        const products = new ProductsInMemoryRepository(stores);
        const product = await products.create({
          name: 'Product',
          slug: 'product',
          description: 'Product',
          price: 10,
          stock: 5,
          sizes: [],
          tags: [],
          storeId: store.id,
          categoryId: 'category',
          subcategoryId: 'subcategory',
        });
        const image = await images.create({
          productId: product.id,
          image_url: old.url,
          storage_public_id: oldId,
          is_main: kind === 'main-product',
        });
        imageId = image.id;
        const service = new ChangeProductImageService(
          products,
          storage,
          images,
        );
        run = () => service.execute(store.slug, product.id, image.id, file);
        currentFile = async () =>
          (await images.findById(image.id))!.storage_public_id;
        failPersistence = (error) => {
          vi.spyOn(images, 'replaceFile').mockRejectedValueOnce(error);
        };
      }
    });

    afterEach(() => vi.restoreAllMocks());

    it('keeps the old image until the new file is persisted and uses unique names', async () => {
      const upload = vi.spyOn(storage, 'upload');
      const remove = vi
        .spyOn(storage, 'delete')
        .mockImplementation(async (id) => {
          expect(await currentFile()).not.toBe(id);
          expect(storage.items.has(await currentFile())).toBe(true);
          storage.items.delete(id);
        });

      await run();
      await run(); // Same original filename must never overwrite a stored file.

      expect(upload.mock.calls[0][0].fileName).not.toBe(file.originalname);
      expect(upload.mock.calls[0][0].fileName).not.toBe(
        upload.mock.calls[1][0].fileName,
      );
      expect(remove).toHaveBeenCalledTimes(2);
      expect(storage.items.size).toBe(1);
      expect(storage.items.has(oldId)).toBe(false);
      if (kind.endsWith('product')) {
        expect(images.items).toHaveLength(1);
        expect(images.items[0]).toMatchObject({
          id: imageId,
          is_main: kind === 'main-product',
        });
      }
    });

    it('preserves the old file and database reference when upload fails', async () => {
      vi.spyOn(storage, 'upload').mockRejectedValueOnce(
        new Error('upload failed'),
      );
      const remove = vi.spyOn(storage, 'delete');
      await expect(run()).rejects.toThrow('upload failed');
      expect(await currentFile()).toBe(oldId);
      expect(storage.items.has(oldId)).toBe(true);
      expect(remove).not.toHaveBeenCalled();
    });

    it('cleans up the new upload and preserves the old image when persistence fails', async () => {
      failPersistence(new Error('database failed'));
      await expect(run()).rejects.toThrow('database failed');
      expect(await currentFile()).toBe(oldId);
      expect([...storage.items.keys()]).toEqual([oldId]);
    });

    it('keeps a successful replacement usable and logs failed old-file cleanup', async () => {
      vi.spyOn(storage, 'delete').mockRejectedValueOnce(
        new Error('cleanup failed'),
      );
      await run();
      expect(await currentFile()).not.toBe(oldId);
      expect(storage.items.has(await currentFile())).toBe(true);
      expect(storage.items.has(oldId)).toBe(true);
      expect(Logger.prototype.warn).toHaveBeenCalledOnce();
    });

    it('retains the original database error if compensating cleanup also fails', async () => {
      failPersistence(new Error('database failed'));
      vi.spyOn(storage, 'delete').mockRejectedValueOnce(
        new Error('cleanup failed'),
      );
      await expect(run()).rejects.toThrow('database failed');
      expect(await currentFile()).toBe(oldId);
      expect(storage.items.has(oldId)).toBe(true);
      expect(Logger.prototype.warn).toHaveBeenCalledOnce();
    });
  },
);
