import { afterNextRender, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductStore } from '../stores/product.stores';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../components/product-card/product-card';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ProductCard, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  searchTerm = '';
  readonly productStore = inject(ProductStore);

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
