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
import { ListCategoriesService } from '@/use-cases/services/products/list-categories.service';
import { ListCategoriesController } from './controllers/users/list-categories.controller';
import { ListSubcategoriesService } from '@/use-cases/services/products/list-subcategories.service';
import { ListSubcategoriesController } from './controllers/users/list-subcategories.controller';
import { ListProductsController } from './controllers/users/list-products.controller';
import { ListProductsService } from '@/use-cases/services/products/list-products.service';
import { ListStoresService } from '@/use-cases/services/stores/list-stores.service';
import { ListStoresController } from './controllers/users/list-stores.controller';
import { ListProductsByStoreService } from '@/use-cases/services/products/list-products-by-store.service';
import { ListProductsByStoreController } from './controllers/users/list-products-by-store.controller';
import { AddProductToCartController } from './controllers/users/add-product-to-cart.controller';
import { AddProductToCartService } from '@/use-cases/services/cart/add-product-to-cart.service';
import { ListCartsService } from '@/use-cases/services/cart/list-carts.service';
import { ListCartsController } from './controllers/users/list-carts.controller';
import { ListCartProductsController } from './controllers/users/list-cart-products.controller';
import { ListCartProductsService } from '@/use-cases/services/cart/list-cart-products.service';
import { EditSelectedProductController } from './controllers/users/edit-selected-product.controller';
import { EditSelectedProductService } from '@/use-cases/services/cart/edit-selected-product.service';
import { DeleteItemCartController } from './controllers/users/delete-item-cart.controller';
import { DeleteItemCartService } from '@/use-cases/services/cart/delete-item-cart.service';
import { RegisterOrderService } from '@/use-cases/services/order/register-order.service';
import { RegisterOrderController } from './controllers/users/register-order.controller';
import { GetProductController } from './controllers/users/get-product.controller';
import { GetProductService } from '@/use-cases/services/products/get-product.service';
import { ListOrdersService } from '@/use-cases/services/order/list-orders.service';
import { ListOrdersController } from './controllers/users/list-orders.controller';
import { ListOrderProductsController } from './controllers/users/list-order-products.controller';
import { ListOrderProductsService } from '@/use-cases/services/order/list-order-products.service';
import { ListStoreOrdersService } from '@/use-cases/services/order/list-store-orders.service';
import { ListStoreOrdersController } from './controllers/collaborators/list-store-orders.controller';
import { SetMainImageService } from '@/use-cases/services/products/set-main-image.service';
import { SetMainImageController } from './controllers/collaborators/set-main-image.controller';
import { GoogleAuthenticateController } from './controllers/users/google-authenticate.controller';
import { GoogleAuthenticateService } from '@/use-cases/services/users/google-authenticate.service';
import { LogoutController } from './controllers/users/logout.controller';
import { ChangePasswordController } from './controllers/users/change-password.controller';
import { ChangePasswordService } from '@/use-cases/services/users/change-password.service';
import { ListUserAddressesController } from './controllers/users/list-user-addresses.controller';
import { ListStoreManageProductsController } from './controllers/collaborators/list-store-manage-products.controller';
import { ListStoreManageProductsService } from '@/use-cases/services/products/list-store-manage-products.service';
import { ListAllStoresController } from './controllers/admin/list-all-stores.controller';
import { ListAllStoresService } from '@/use-cases/services/stores/list-all-stores.service';
import { UploadStoreBannerController } from './controllers/collaborators/upload-store-banner.controller';
import { UploadStoreBannerService } from '@/use-cases/services/stores/upload-store-banner.service';
import { ChangeStoreBannerService } from '@/use-cases/services/stores/change-store-banner.service';
import { ChangeStoreBannerController } from './controllers/collaborators/change-store-banner.controller';
import { DeleteStoreBannerService } from '@/use-cases/services/stores/delete-store-banner.service';
import { DeleteStoreBannerController } from './controllers/collaborators/delete-store-banner.controller';
import { ListStoreHomeController } from './controllers/users/list-store-home.controller';
import { ListStoreHomeService } from '@/use-cases/services/stores/list-store-home.service';

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
    ListUserAddressesController,
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
    ListProductsController,
    GetProductController,
    ListCategoriesController,
    ListSubcategoriesController,
    ListStoresController,
    ListProductsByStoreController,
    AddProductToCartController,
    ListCartsController,
    ListCartProductsController,
    EditSelectedProductController,
    DeleteItemCartController,
    RegisterOrderController,
    ListOrdersController,
    ListOrderProductsController,
    ListStoreOrdersController,
    SetMainImageController,
    GoogleAuthenticateController,
    LogoutController,
    ChangePasswordController,
    ListStoreManageProductsController,
    ListAllStoresController,
    UploadStoreBannerController,
    ChangeStoreBannerController,
    DeleteStoreBannerController,
    ListStoreHomeController
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
    ListProductsService,
    GetProductService,
    ListCategoriesService,
    ListSubcategoriesService,
    ListStoresService,
    ListProductsByStoreService,
    AddProductToCartService,
    ListCartsService,
    ListCartProductsService,
    EditSelectedProductService,
    DeleteItemCartService,
    RegisterOrderService,
    ListOrdersService,
    ListOrderProductsService,
    ListStoreOrdersService,
    SetMainImageService,
    GoogleAuthenticateService,
    ChangePasswordService,
    ListStoreManageProductsService,
    ListAllStoresService,
    UploadStoreBannerService,
    ChangeStoreBannerService,
    DeleteStoreBannerService,
    ListStoreHomeService
  ],
})
export class HttpModule {}
