/**
 * Product interface matching the backend Prisma model.
 * Shared between frontend and backend applications.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stripePriceId: string;
  isFeatured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

