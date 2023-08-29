import { Component, EventEmitter, Input, Output } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Card } from 'src/app/models/card';
import { CardService } from 'src/app/services/card.service';

interface CardQuantity extends Card {
  selectedQuantity: number;
}

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent {
  cards: Card[] = [];
  filterCards: Card[] = [];
  cart: any = [];

  expansionChecked: any = {
    scarletAndViolet: false,
    swordAndShield: false,
    sunAndMoon: false
  };

  typeChecked: any = {
    fire: false,
    water: false,
    electric: false,
    grass: false,
    earth: false,
    psychic: false,
    sinister: false,
    dragon: false,
    normal: false,

  };

  categorys = [
    { expansion: 'Scarlet & Violet' },
    { expansion: 'Sword & Shield' },
    { expansion: 'Sun & Moon' }
  ];

  types = [
    { type: 'Fuego' },
    { type: 'Agua' },
    { type: 'Electricidad' },
    { type: 'Planta' },
    { type: 'Tierra/Lucha' },
    { type: 'Psiquico' },
    { type: 'Siniestro' },
    { type: 'Dragon' },
    { type: 'Normal' },
    { type: 'Acero' },
    { type: 'Entrenador' },
  ]

  constructor(private cardService: CardService) { }

  ngOnInit(): void {

    this.cardService.getCards().pipe(
      catchError(error => {
        console.log(error);
        return of(error)
      })
    ).subscribe(data => {
      this.cards = data;
      this.updateFilteredCards();
    });
  }

  updateCheckboxState() {
    this.updateFilteredCards();
  }

  updateFilteredCards() {
    const activeExpansions = Object.keys(this.expansionChecked).filter(
      expansion => this.expansionChecked[expansion]
    );
    const activeTypes = Object.keys(this.typeChecked).filter(
      type => this.typeChecked[type]
    );

    if (activeExpansions.length == 0 && activeTypes.length == 0) {
      this.filterCards = this.cards;
    } else if (activeExpansions.length > 0) {
      this.filterCards = this.cards.filter(card =>
        activeExpansions.includes(card.expansion)
      );
    } else if (activeTypes.length > 0) {
      this.filterCards = this.cards.filter(card =>
        activeTypes.includes(card.type)
      );
    }
  }

  addToCart(selectedCard: Card) {
    const existCart = sessionStorage.getItem('cart');

    if (existCart != null) {
      this.cart = JSON.parse(existCart); // Cargar el carrito existente

      // Verificar si el producto ya está en el carrito
      const existingProductIndex = this.cart.findIndex((product: CardQuantity) => product._id === selectedCard._id);

      if (existingProductIndex !== -1) {
        // Si el producto ya está en el carrito, incrementar la cantidad
        if (this.cart[existingProductIndex].selectedQuantity < selectedCard.stock) {
          this.cart[existingProductIndex].selectedQuantity++;
        } else {
          // Mostrar mensaje o tomar otra acción si la cantidad excede el stock
        }
      } else {
        // Si el producto no está en el carrito, agregarlo
        const newProduct: CardQuantity = {
          ...selectedCard,
          selectedQuantity: 1 // Inicializar la cantidad aquí
        };
        this.cart.push(newProduct);
      }
    } else {
      // Si no hay carrito existente, crear uno nuevo
      this.cart = [{
        ...selectedCard,
        selectedQuantity: 1 // Inicializar la cantidad aquí
      }];
    }

    sessionStorage.setItem('cart', JSON.stringify(this.cart));
  }
}
