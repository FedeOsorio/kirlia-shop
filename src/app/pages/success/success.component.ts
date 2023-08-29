import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { json } from 'express';
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent {

  emailContent: string = '';
  destinataryEmail: string = '';

  constructor(private route: ActivatedRoute, private emailService: EmailService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const status = params['status']; // Lee el parámetro 'status' (u otro) que hayas configurado en la redirección de MercadoPago

      if (status === 'approved') {
        this.emailContent = localStorage.getItem('emailContent');
        console.log(this.emailContent);

        this.destinataryEmail = localStorage.getItem('destinataryEmail');
        console.log(this.destinataryEmail);
        // Aquí puedes llamar a tu función para enviar el correo
        this.emailService.sendEmail(this.emailContent, this.destinataryEmail).subscribe(
          response => {
            if (response.success) {
              console.log('Correo enviado con éxito', response.message);
              localStorage.removeItem('emailContent');
              localStorage.removeItem('destinataryEmail');
              sessionStorage.clear();
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
    });
  }
}