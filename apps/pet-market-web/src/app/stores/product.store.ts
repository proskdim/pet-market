import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Apollo, gql } from 'apollo-angular';
import { of, Subscription } from 'rxjs';
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

const SEARCH_PRODUCTS = gql`
  query SearchProducts($term: String!) {
    searchProducts(term: $term) {
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
  withMethods((store, apollo = inject(Apollo)) => {
    let loadProductsSubscription: Subscription | null = null;
    let searchProductsSubscription: Subscription | null = null;

    return {
      loadProducts(): void {
        loadProductsSubscription?.unsubscribe();
        patchState(store, { isLoading: true, error: null });
        loadProductsSubscription = apollo
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
      },
      searchProducts(term: string): void {
        searchProductsSubscription?.unsubscribe();
        patchState(store, { isLoading: true, error: null });
        searchProductsSubscription = apollo
          .query<{ searchProducts: Product[] }>({
            query: SEARCH_PRODUCTS,
            variables: { term }
          })
          .pipe(
            tap(({ data }) => {
              patchState(store, { featuredProducts: data?.searchProducts ?? [], isLoading: false });
            }),
            catchError((err: Error) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            })
          )
          .subscribe();
      }
    };
  }),
);