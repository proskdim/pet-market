import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Apollo, gql } from 'apollo-angular';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Product } from '@pet-market/shared-types';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      image
      stripePriceId
      isFeatured
      createdAt
      updatedAt
    }
  }
`;

type ProductState = {
  product: Product | null;
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
};

const initialState: ProductState = {
  product: null,
  featuredProducts: [],
  isLoading: false,
  error: null,
};


export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, apollo = inject(Apollo)) => ({
    loadProducts(): void {
      patchState(store, { isLoading: true, error: null });
      apollo
        .query<{ products: Product[] }>({ query: GET_PRODUCTS })
        .pipe(
          tap(({ data }) => {
            patchState(store, { featuredProducts: data?.products ?? [], isLoading: false });
          }),
          catchError((err: Error) => {
            patchState(store, { error: err.message, isLoading: false });
            return of(null);
          })
        )
        .subscribe();
    }
  })),
);