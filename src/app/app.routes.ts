import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShopComponent } from './components/shop/shop.component';
import { AccountComponent } from './components/account/account.component';
import { ContactComponent } from './components/contact/contact.component';


export const routes: Routes = [
    {
        path:'',
        component: HomeComponent
    },
    {
        path:'account',
        component:AccountComponent
    },
    {
        path:'cart',
        component:CartComponent
    },
    {
        path:'checkout',
        component:CheckoutComponent
    },
    {
        path:'product-detail',
        component:ProductDetailComponent
    },
    {
        path:'shop',
        component:ShopComponent
    },
    {
        path:'contact',
        component:ContactComponent
    }
];
