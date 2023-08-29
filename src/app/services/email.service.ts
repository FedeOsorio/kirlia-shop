import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }

  sendEmail(emailContent: string, destinataryEmail: string): Observable<any> {
    console.log('se llamó a sendEmail');
    
    return this.http.post<any>('http://localhost:3000/send_email', { emailContent, destinataryEmail } );
  }
}
