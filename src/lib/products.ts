import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export type { Product };

/**
 * Robust recursive serialization for Firestore data.
 * Converts Timestamps to ISO strings and ensures plain objects for Client Components.
 */
function serializeData(data: any): any {
  if (data === null || data === undefined) return data;

  // Handle Firestore Timestamps (both from SDK and plain objects with seconds/nanoseconds)
  if (typeof data === 'object' && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  if (typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000).toISOString();
  }

  // Handle JS Dates
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  // Handle Objects
  if (typeof data === 'object' && data.constructor === Object) {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeData(data[key]);
      }
    }
    return serialized;
  }

  return data;
}

function getServerFirestore() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export const getAllProducts = async (): Promise<Product[]> => {
  let dbProducts: Product[] = [];
  let flowProducts: Product[] = [];

  try {
    const db = getServerFirestore();
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    
    dbProducts = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...serializeData(data), id: doc.id } as Product;
    });
  } catch (error) {
    console.warn("Firestore products fetch failed or collection is empty.");
  }

  try {
    const results = await getFlowProducts();
    flowProducts = results || [];
  } catch (error) {
    console.warn("External product synchronization failed.");
  }

  const uniqueMap = new Map<string, Product>();
  
  flowProducts.forEach(p => {
    const serialized = serializeData(p);
    uniqueMap.set(serialized.slug.toLowerCase(), serialized);
  });
  
  dbProducts.forEach(p => {
    const serialized = serializeData(p);
    uniqueMap.set(serialized.slug.toLowerCase(), serialized);
  });

  return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  const allProducts = await getAllProducts();
  return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
};
