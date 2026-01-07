import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../stores/cart.store';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  readonly cartStore = inject(CartStore);

  updateQuantity(productId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const quantity = parseInt(value);
    if (quantity >= 1) {
      this.cartStore.updateQuantity(productId, quantity);
    }
  }
}
