'use server';

import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export type { Product };

/**
 * Deep recursive serialization for Firestore data.
 * Ensures ALL nested Timestamps and complex types are plain objects for Client Components.
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
  if (typeof window !== 'undefined') return null; // Defensive check for server-only initialization
  
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
  } catch (e) {
    console.error("Firestore initialization failed during build/runtime:", e);
    return null;
  }
}

/**
 * Fetches all products from Firestore and Printful, then serializes them for Client Components.
 */
export const getAllProducts = async (): Promise<Product[]> => {
  let dbProducts: Product[] = [];
  let flowProducts: Product[] = [];

  try {
    const db = getServerFirestore();
    if (db) {
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        dbProducts = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id } as Product;
        });
    }
  } catch (error) {
    console.warn("Firestore products fetch omitted or failed during build:", error);
  }

  try {
    const results = await getFlowProducts();
    flowProducts = results || [];
  } catch (error) {
    console.warn("External product synchronization skipped or failed:", error);
  }

  const uniqueMap = new Map<string, Product>();
  
  // Combine both sources
  flowProducts.forEach(p => {
    uniqueMap.set(p.slug.toLowerCase(), p);
  });
  
  dbProducts.forEach(p => {
    uniqueMap.set(p.slug.toLowerCase(), p);
  });

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  // Return deeply serialized data to ensure no hydration or "plain object" errors
  return await serializeData(sorted);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  return await serializeData(product);
};