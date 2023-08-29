import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShopcartService {
  cart: any[] = [];

  constructor() {
    this.loadCart(); // Cargar el carrito al inicio
  }

  loadCart() {
    const sessionCart = sessionStorage.getItem('cart');
    if (sessionCart != null) {
      this.cart = JSON.parse(sessionCart);
      console.log(this.cart);
    }
  }

  updateCart(newCart: any[]) {
    this.cart = newCart;
    sessionStorage.setItem('cart', JSON.stringify(newCart));
  }

  calcTotal(): number {
    let total = 0;

    for (const product of this.cart) {
      total += product.price * product.selectedQuantity;
    }

    return total;
  }
}
