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
function serializeData(data: any): any {
  if (data === null || data === undefined) return data;

  // Handle Firestore Timestamps
  if (typeof data === 'object' && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  
  // Handle objects that look like Timestamps ({seconds, nanoseconds})
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
    console.warn("Firestore products fetch failed.");
  }

  try {
    const results = await getFlowProducts();
    flowProducts = results || [];
  } catch (error) {
    console.warn("External product synchronization failed.");
  }

  const uniqueMap = new Map<string, Product>();
  
  // Combine both sources, prioritizing local DB entries for custom overrides
  flowProducts.forEach(p => {
    uniqueMap.set(p.slug.toLowerCase(), p);
  });
  
  dbProducts.forEach(p => {
    uniqueMap.set(p.slug.toLowerCase(), p);
  });

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  return serializeData(sorted);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  return serializeData(product);
};
