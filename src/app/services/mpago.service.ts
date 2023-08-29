import { Injectable } from '@angular/core';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { ShopcartService } from './shopcart.service';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class MpagoService {
  cart: any = [];
  shippingCost: number = 0;
  constructor(private shopService: ShopcartService) { }

  async mpagoInit() {
    console.log("Mercado pago activado");
    await loadMercadoPago();
    const mp = new window.MercadoPago("TEST-1b06e5c5-beda-4279-9a39-f05cd80d627d", {
      locale: "es-AR",
    });


    this.cart = this.shopService.cart;

    const order = [];
    this.cart.forEach(e => {
      const orderData = {
        name: e.name,
        desc: e.desc,
        price: e.price,
        quantity: Number(e.selectedQuantity)
      }
      order.push(orderData)

    })

    const shippingCost = this.shippingCost;

    fetch("http://localhost:3000/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order: order,
        shippingCost: shippingCost
      })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (preference) {
        createCheckoutButton(preference.id);
      })
      .catch(function () {
        alert("Unexpected error");
      });



    function createCheckoutButton(preferenceId) {
      // Initialize the checkout
      const bricksBuilder = mp.bricks();

      const renderComponent = async (bricksBuilder) => {
        if (window.checkoutButton && typeof window.checkoutButton.unmount == 'function') {
          window.checkoutButton.unmount();
        }
        await bricksBuilder.create(
          "wallet",
          "button-checkout", // class/id where the payment button will be displayed
          {
            initialization: {
              preferenceId: preferenceId,
              redirectMode: "blank"
            },
            callbacks: {
              onError: (error) => console.error(error),
              onReady: () => { },
            },
          }
        );
      };
      window.checkoutButton = renderComponent(bricksBuilder);
    }
  }
}

