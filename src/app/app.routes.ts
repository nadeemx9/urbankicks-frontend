import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AccountComponent } from './components/account/account.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ContactComponent } from './components/contact/contact.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { RegisterComponent } from './components/register/register.component';
import { ShopComponent } from './components/shop/shop.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'account',
    component: AccountComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    component: CartComponent, canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent, canActivate: [AuthGuard]
  },
  {
    path: 'product-detail',
    component: ProductDetailComponent
  },
  {
    path: 'shop',
    component: ShopComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'add-product',
    component: AddProductComponent, canActivate: [AuthGuard]
  }
];
