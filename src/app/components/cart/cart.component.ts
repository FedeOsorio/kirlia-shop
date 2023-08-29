import { MpagoService } from 'src/app/services/mpago.service';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { CardService } from 'src/app/services/card.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from 'src/app/models/card';
import { ShopcartService } from 'src/app/services/shopcart.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cart: any = [];
  btnActive: boolean = true;
  btnLoader: boolean = false;

  constructor(private router: Router, private cardService: CardService, private mpago: MpagoService, private shopService: ShopcartService) { }

  ngOnInit() {
    this.shopService.loadCart();
    this.cart = this.shopService.cart;
  }

  getProductQuantityOptions(product: any): number[] {
    return Array.from({ length: product.stock }, (_, index) => index + 1);
  }

  onSelectChange(product: any) {
    const updatedCart = this.shopService.cart.map(item => {
      if (item.id === product.id) {
        return { ...item, selectedQuantity: Number(product.selectedQuantity) };
      }
      return item;
    });
    this.shopService.updateCart(updatedCart);
  }

  purchase() {
    for (const product of this.shopService.cart) {
      if (product.stock == 0) {
        console.error(`No hay stock de la carta ${product.name}`);
      }
      if (product.selectedQuantity > 0 && (product.selectedQuantity <= product.stock)) {
        product.stock -= Number(product.selectedQuantity);
        this.cardService.updateStock(product).subscribe(
          () => {
            console.log(`Stock de ${product.name} actualizado`);
          },
          (error) => {
            console.log(`Stock no actualizado para ${product.name}`);
            product.stock++;
          }
        );
      }
    }

    this.btnLoader = true;
    this.btnActive = false;
    setTimeout(() => {

      this.router.navigate(['checkout']);
    }, 900);


  }

  cleanCart() {
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => {
      location.reload();
    }, 800);

  }

}