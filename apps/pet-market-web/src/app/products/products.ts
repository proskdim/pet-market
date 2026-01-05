import { afterNextRender, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductStore } from '../stores/product.store';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../components/product-card/product-card';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CartStore } from '../stores/cart.store';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ProductCard, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  searchTerm = '';
  readonly productStore = inject(ProductStore);
  readonly cartStore = inject(CartStore);

  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((searchTerm) => {
        this.productStore.searchProducts(searchTerm);
      });

    afterNextRender(() => {
      this.productStore.loadProducts();
    });
  }

  onSearchTermChange(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }
}
