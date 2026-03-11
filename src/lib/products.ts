'use server';

import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export type { Product };

/**
 * Robust recursive serialization for Firestore data.
 * Converts Timestamps to ISO strings and handles nested structures for Client Components.
 */
export async function serializeData(data: any): Promise<any> {
  if (data === null || data === undefined) return data;

  // Handle Firestore Timestamps
  if (typeof data === 'object') {
    if (typeof data.toDate === 'function') {
      return data.toDate().toISOString();
    }
    if ('seconds' in data && 'nanoseconds' in data) {
      return new Date(data.seconds * 1000).toISOString();
    }
  }

  // Handle JS Dates
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    const serializedArray = [];
    for (const item of data) {
      serializedArray.push(await serializeData(item));
    }
    return serializedArray;
  }

  // Handle Objects
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Skip functions and private properties
        if (typeof data[key] !== 'function' && !key.startsWith('_')) {
          serialized[key] = await serializeData(data[key]);
        }
      }
    }
    return serialized;
  }

  return data;
}

function getServerFirestore() {
  if (typeof window !== 'undefined') return null;
  
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
  } catch (e) {
    console.error("Firestore initialization failed:", e);
    return null;
  }
}

/**
 * Fetches and serializes all products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
  let dbProducts: Product[] = [];
  let flowProducts: Product[] = [];

  try {
    const db = getServerFirestore();
    if (db) {
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        dbProducts = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        } as any));
    }
  } catch (error) {
    console.warn("Database fetch deferred during build:", error);
  }

  try {
    const results = await getFlowProducts();
    flowProducts = results || [];
  } catch (error) {
    console.warn("External sync deferred during build:", error);
  }

  const uniqueMap = new Map<string, any>();
  
  // Combine, prioritizing database entries for slug collisions
  flowProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
  dbProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  return await serializeData(sorted);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  return await serializeData(product);
};
