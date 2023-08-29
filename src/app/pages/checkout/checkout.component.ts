import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { EmailService } from 'src/app/services/email.service';
import { MpagoService } from 'src/app/services/mpago.service';
import { ShopcartService } from 'src/app/services/shopcart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class CheckoutComponent {
  checkoutForm!: FormGroup;
  paymentMethods = [
    { value: 'transferencia', label: 'Transferencia bancaria' },
    { value: 'mercadopago', label: 'MercadoPago' }
  ];
  selectedPaymentMethod: string = ''; // Para almacenar el método de pago seleccionado
  btnActive: boolean = true;
  btnLoader: boolean = true;
  mpActive: boolean = false
  cart: any = [];
  errorText: boolean = false;
  totalPrice: number = 0;
  selectedShippingMethod: string = '';
  precioEnvioSucursal: number = 1085;
  precioEnvioDomicilio: number = 1765;
  destinataryEmail: string = ''
  emailContent: string = '';

  constructor(
    private emailService: EmailService,
    private router: Router,
    private shopService: ShopcartService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private mpago: MpagoService
  ) { }

  ngOnInit() {
    this.checkoutForm = this.formBuilder.group({
      buyerName: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      zip: ['', Validators.required],
      paymentMethod: ['transferencia', Validators.required]
    });
    this.shopService.loadCart();
    this.cart = this.shopService.cart;
    this.selectedPaymentMethod = 'transferencia'
    this.calcTotal()
  }

  calcTotal() {
    this.totalPrice = 0; // Inicializar la suma en cero
    this.cart.forEach(element => {
      const cuenta = (element.price * element.selectedQuantity)
      this.totalPrice += cuenta;
    });

  }

  onPaymentMethodChange(methodValue: string) {
    this.selectedPaymentMethod = methodValue;
    if (this.selectedPaymentMethod == 'transferencia') {
      this.btnActive = true;
      this.mpActive = false;
    } else if
      (this.selectedPaymentMethod == 'mercadopago') {
      this.mpActive = true;
    }
  }

  updateSelectedShippingOption(event: any) {
    const selectedOption = event.target.selectedOptions[0].dataset.envio;
    this.selectedShippingMethod = selectedOption;
  }

  shippingCostNumber(cost: string): number {
    if (cost == 'Domicilio') {
      this.mpago.shippingCost = this.precioEnvioDomicilio;
      return this.precioEnvioDomicilio;
    } else if (cost == 'Correo') {
      this.mpago.shippingCost = this.precioEnvioSucursal;
      return this.precioEnvioSucursal;
    }
    return 0; // Valor predeterminado si no es ni 'Domicilio' ni 'Correo'
  }

  transfer() {
    this.confirmationService.confirm({
      message: `Realiza el pago y envia el comprobante a kirlia.shop@gmail.com <br><br> <b>Datos:</b> <br> Alias: kirlia.shop <br> CBU: 0000076500000003828771 <br> Titular: Federico <br><br> <b>Confirma el pedido haciendo click en ACEPTAR</b> <br>Aviso: el pedido no se procesa hasta que no recibimos el comprobante.`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-success',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Aceptado', detail: 'Pedido realizado correctamente' });
        this.sendEmail();
        setTimeout(() => {
          localStorage.removeItem('emailContent');
          localStorage.removeItem('destinataryEmail')
          this.router.navigate(['success']);
        }, 1500);
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'error', summary: 'Atención', detail: 'La operación fue cancelada' });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
            break;
        }
      }
    });
  }

  generateEmailContent(cartItems: any[]): string {
    this.emailContent = `
    <h1 style="padding: 20px 0; font-family: Trebuchet MS; width: 100%; text-align: center;"> Kirlia Shop </h1>
    <h2 style="font-family: Trebuchet MS; font-weight: 600; width: 100%; text-align: center;"> Ya recibimos tu pedido </h2>
    <div style="width: 100%;">
    <h4 style="width:80%; margin: auto">Resumen del pedido:</h4>
    </div>
    <table style="border-collapse: collapse; width: 80%; margin:auto">
    <tr>
      <th style="text-align: left; padding: 8px;">Producto</th>
      <th style="text-align: left; padding: 8px;">Descripción</th>
      <th style="text-align: center; padding: 8px;">Cantidad</th>
      <th style="text-align: center; padding: 8px;">Precio</th>
    </tr>
      `;

    // Agrega una fila por cada elemento en el array "cart"
    cartItems.forEach(item => {
      this.emailContent += `
      <tr>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Carta
      </td>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">
      <h3>${item.name} ${item.desc}</h3>
      </td>
      <td style="border: 1px solid #dddddd; text-align: center; padding: 8px;">$${item.price}
      </td>
      <td style="border: 1px solid #dddddd; text-align: center; padding: 8px;">${item.selectedQuantity}
      </td>
    </tr>
    </table>
      `;
    });

    this.emailContent += `
    <table style="border-collapse: collapse; width: 80%; margin: auto; border: 1px solid #dddddd; padding: 8px 0 8px 0;">
    <tr>
      <td style="width: 100%; margin: auto; text-align: right; padding:8px;">Subtotal: $${this.totalPrice}</td>
    </tr>
    <tr>
      <td style="width: 100%; margin: auto; text-align: right; padding:8px;">Envio: $${this.mpago.shippingCost}</td>
    </tr>
    <tr>
      <td style="width: 100%; margin: auto; text-align: right; padding:8px;">Total: $${this.totalPrice + this.mpago.shippingCost}</td>
    </tr>
    </table>
    <hr style="margin-top:25px">
    <h3 style="font-size: 20px; width: 100%; text-align:center">¡Muchas gracias por su compra!</h3>
        <div>
        <p style="font-size: 18px">Si tuviste algún problema con tu pedido escribinos a: <a href="mailto:kirlia.shop@gmail.com">kirlia.shop@gmail.com</a></p>
        <p style="font-size: 18px;">Haremos todo lo posible por solucionarlo.</p>
        <p style="font-size: 18px;">Instagram: <a href="https://www.instagram.com/kirlia.shop">Kirlia Shop</a></p>
    </div>
    <br>`;
    return this.emailContent;
  }

  submitForm() {
    this.errorText = true;
    if (this.checkoutForm.valid) {
      this.errorText = false;
      if (this.selectedPaymentMethod === 'transferencia') {
        this.transfer();
      } else if (this.selectedPaymentMethod === 'mercadopago') {
        // Lógica para procesar pago con MercadoPago
        this.btnActive = false;
        this.btnLoader = true;
        setTimeout(() => {
          this.btnLoader = false;

        }, 800);
        this.emailContent = this.generateEmailContent(this.cart);
        localStorage.setItem('emailContent', this.emailContent);
        localStorage.setItem('destinataryEmail', this.destinataryEmail);
        this.mpago.mpagoInit()
      }
    }
  }

  sendEmail() {
    if (this.destinataryEmail.trim() === '') {
      // Maneja el caso en que el campo esté vacío
      return;
    }
    const emailContent = this.generateEmailContent(this.cart);

    this.emailService.sendEmail(emailContent, this.destinataryEmail).subscribe(
      response => {
        if (response.success) {
          console.log('Correo enviado con éxito', response.message);

          // Realiza otras acciones después de enviar el correo
        } else {
          console.error('Error al enviar el correo', response.message);
        }
      },
      error => {
        console.error('Error al enviar el correo', error);
      }
    );

  }
}