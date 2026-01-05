import { Component, input, output } from '@angular/core';
import { Product } from '@pet-market/shared-types';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
  addToCart = output<Product>();

  onAddToCart(product: Product) {
    // emit the product to the parent component
    this.addToCart.emit(product);
  }
}
