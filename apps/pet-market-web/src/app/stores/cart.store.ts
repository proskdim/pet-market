import { computed } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Product } from "@pet-market/shared-types";

type CartItem = Product & { quantity: number };

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    return {
      totalItems: computed(() => store.items().reduce((acc, item) => acc + item.quantity, 0)),
    };
  }),
  withMethods((store) => {
    return {
      addToCart(product: Product, quantity = 1): void {
        const currentItems = store.items();
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          patchState(store, {
            items: currentItems.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            ),
          });
        } else {
          patchState(store, { items: [...currentItems, { ...product, quantity }] });
        }
      },
    };
  })
);