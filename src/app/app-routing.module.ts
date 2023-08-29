import { CheckoutComponent } from './pages/checkout/checkout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { StoreComponent } from './pages/store/store.component';
import { CartComponent } from './components/cart/cart.component';
import { SuccessComponent } from './pages/success/success.component';

const routes: Routes =
  [
    { path: '', component: HomeComponent },
    { path: 'store', component: StoreComponent },
    { path: 'cart', component: CartComponent },
    { path: 'success', component: SuccessComponent },
    { path: 'checkout', component: CheckoutComponent }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
