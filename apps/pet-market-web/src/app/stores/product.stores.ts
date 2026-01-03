import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Apollo, gql } from 'apollo-angular';
import { tap } from 'rxjs/operators';

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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stripePriceId: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    loadProducts() {
      patchState(store, { isLoading: true });
      apollo
        .watchQuery<{ products: Product[] }>({
          query: GET_PRODUCTS,
        })
        .valueChanges
        .pipe(
          tap({
            next: ({ data }) => {
              patchState(store, { featuredProducts: (data?.products ?? []) as Product[], isLoading: false });
            },
            error: (err) => {
              console.log(err);
              patchState(store, { error: err.message, isLoading: false });
            }
          })
        )
        .subscribe();
    }
  })),
);