import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { CreateAccountService } from '@/use-cases/services/users/create-account.service';
import { CreateAccountController } from './controllers/users/create-account.controller';
import { AuthenticateController } from './controllers/users/authenticate.controller';
import { AuthenticateService } from '@/use-cases/services/users/authenticate.service';
import { RegisterCollaboratorService } from '@/use-cases/services/collaborators/register-collaborator.service';
import { RegisterCollaboratorController } from './controllers/collaborators/register-collaborator.controller';
import { RegisterStoreController } from './controllers/admin/register-store.controller';
import { RegisterStoreService } from '@/use-cases/services/stores/register-store.service';
import { RefreshTokenController } from './controllers/users/refresh-token.controller';
import { EnvService } from '@/env/env.service';
import { GetProfileService } from '@/use-cases/services/users/get-profile.service';
import { GetProfileController } from './controllers/users/get-profile.controller';
import { RegisterUserAddressController } from './controllers/users/register-user-address.controller';
import { RegisterUserAddressService } from '@/use-cases/services/address/register-user-address.service';
import { RegisterStoreAddressController } from './controllers/collaborators/register-store-address.controller';
import { RegisterStoreAddressService } from '@/use-cases/services/address/register-store-address.service';
import { EditUserDataController } from './controllers/users/edit-user-data.controller';
import { EditUserDataService } from '@/use-cases/services/users/edit-user-data.service';
import { UpdateUserAddresController } from './controllers/users/update-user-address.controller';
import { UpdateUserAddressService } from '@/use-cases/services/address/update-user-address.service';
import { ListUsersAddressesController } from './controllers/users/list-users-addresses.controller';
import { ListUserAddressesService } from '@/use-cases/services/address/list-user-addresses.service';
import { EditStoreDataController } from './controllers/collaborators/edit-store-data.controller';
import { EditStoreDataService } from '@/use-cases/services/stores/edit-store-data.service';
import { UpdateStoreAddresController } from './controllers/collaborators/update-store-address.controller';
import { UpdateStoreAddressService } from '@/use-cases/services/address/update-store-address.service';
import { ListEmployeesController } from './controllers/collaborators/list-employees.controller';
import { ListEmployeeService } from '@/use-cases/services/collaborators/list-employee.service';
import { DeactivateStoreController } from './controllers/admin/deactivate-store.controller';
import { DeactivateStoreService } from '@/use-cases/services/stores/deactivate-store.service';
import { ActivateStoreController } from './controllers/admin/activate-store.controller';
import { ActivateStoreService } from '@/use-cases/services/stores/activate-store.service';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { RegisterCategoryController } from './controllers/admin/register-category.controller';
import { RegisterCategoryService } from '@/use-cases/services/products/register-category.service';
import { RegisterSubcategoryController } from './controllers/admin/register-subcategory.controller';
import { RegisterSubcategoryService } from '@/use-cases/services/products/register-subcategory.service';
import { EditCategoryController } from './controllers/admin/edit-category.controller';
import { EditCategoryService } from '@/use-cases/services/products/edit-category.service';
import { EditSubcategoryController } from './controllers/admin/edit-subcategory.controller';
import { EditSubcategoryService } from '@/use-cases/services/products/edit-subcategory.service';
import { DeleteEmployeeController } from './controllers/collaborators/delete-employee.controller';
import { DeleteEmployeeService } from '@/use-cases/services/collaborators/delete-employee.service';
import { StorageModule } from '@/storage/storage.module';
import { RegisterProductController } from './controllers/collaborators/register-product.controller';
import { RegisterProductService } from '@/use-cases/services/products/register-product.service';
import { UploadProductImageController } from './controllers/collaborators/upload-product-image.controller';
import { UploadProductImagesService } from '@/use-cases/services/products/upload-product-image.service';
import { ChangeProductImageController } from './controllers/collaborators/change-product-image.controller';
import { ChangeProductImageService } from '@/use-cases/services/products/change-product-image.service';
import { UploadStoreLogoService } from '@/use-cases/services/stores/upload-store-logo.service';
import { UploadStoreLogoController } from './controllers/collaborators/upload-store-logo.controller';
import { ChangeStoreLogoController } from './controllers/collaborators/change-store-logo.controller';
import { ChangeStoreLogoService } from '@/use-cases/services/stores/change-store-logo.service';
import { DeleteProductImageController } from './controllers/collaborators/delete-product-image.controller';
import { DeleteProductImageService } from '@/use-cases/services/products/delete-product-image.service';
import { DeleteStoreLogoController } from './controllers/collaborators/delete-store-logo.controller';
import { DeleteStoreLogoService } from '@/use-cases/services/stores/delete-store-logo.service';
import { EditProductService } from '@/use-cases/services/products/edit-product.service';
import { EditProductController } from './controllers/collaborators/edit-product.controller';
import { UpdateStatusProductController } from './controllers/collaborators/update-status-product.controller';
import { UpdateStatusProductService } from '@/use-cases/services/products/update-status-product.service';
import { DeleteProductController } from './controllers/collaborators/delete-product.controller';
import { DeleteProductService } from '@/use-cases/services/products/delete-product.service';
import { GetStoreProfileService } from '@/use-cases/services/stores/get-store-profile.service';
import { GetStoreProfileController } from './controllers/users/get-store-profile.controller';
import { ListGlobalProductsService } from '@/use-cases/services/products/list-global-products.service';
import { ListGlobalProductsController } from './controllers/users/list-global-products.controller';
import { ListCategoriesService } from '@/use-cases/services/products/list-categories.service';
import { ListCategoriesController } from './controllers/users/list-categories.controller';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    RegisterCollaboratorController,
    RegisterStoreController,
    RefreshTokenController,
    GetProfileController,
    RegisterUserAddressController,
    RegisterStoreAddressController,
    EditUserDataController,
    UpdateUserAddresController,
    ListUsersAddressesController,
    EditStoreDataController,
    UpdateStoreAddresController,
    ListEmployeesController,
    DeactivateStoreController,
    ActivateStoreController,
    RegisterCategoryController,
    RegisterSubcategoryController,
    EditCategoryController,
    EditSubcategoryController,
    DeleteEmployeeController,
    RegisterProductController,
    UploadProductImageController,
    ChangeProductImageController,
    UploadStoreLogoController,
    ChangeStoreLogoController,
    DeleteProductImageController,
    DeleteStoreLogoController,
    EditProductController,
    UpdateStatusProductController,
    DeleteProductController,
    GetStoreProfileController,
    ListGlobalProductsController,
    ListCategoriesController
  ],
  providers: [
    CreateAccountService,
    AuthenticateService,
    RegisterCollaboratorService,
    RegisterStoreService,
    EnvService,
    GetProfileService,
    RegisterUserAddressService,
    RegisterStoreAddressService,
    EditUserDataService,
    UpdateUserAddressService,
    ListUserAddressesService,
    SlugGeneratorService,
    EditStoreDataService,
    UpdateStoreAddressService,
    ListEmployeeService,
    DeactivateStoreService,
    ActivateStoreService,
    RegisterCategoryService,
    RegisterSubcategoryService,
    EditCategoryService,
    EditSubcategoryService,
    DeleteEmployeeService,
    RegisterProductService,
    UploadProductImagesService,
    ChangeProductImageService,
    UploadStoreLogoService,
    ChangeStoreLogoService,
    DeleteProductImageService,
    DeleteStoreLogoService,
    EditProductService,
    UpdateStatusProductService,
    DeleteProductService,
    GetStoreProfileService,
    ListGlobalProductsService,
    ListCategoriesService
  ],
})
export class HttpModule {}