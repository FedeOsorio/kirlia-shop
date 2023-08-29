import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Card } from '../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private baseUrl = 'http://localhost:3000'; // URL de tu servidor Express

  constructor(private http: HttpClient) { }

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards`);
  }

  filterCards(cards: any[], expansionChecked: any, typeChecked: any): Observable<any[]> {
    // Lógica de filtrado basada en los checkboxes marcados
    // Implementa aquí la lógica para filtrar las tarjetas
    const filteredCards = cards.filter(card => expansionChecked[card.expansion] && typeChecked[card.type]);
    return of(filteredCards);
  }

  updateStock(card: any) {
    return this.http.put<Card[]>(`${this.baseUrl}/cards/${card._id}`, card);
  }
}
