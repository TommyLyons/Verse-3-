import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export type { Product };

/**
 * Robust recursive serialization for Firestore data.
 * Converts Timestamps to strings and ensures plain objects for Client Components.
 */
function serializeData(data: any): any {
  if (data === null || data === undefined) return data;

  // Handle Firestore Timestamps specifically
  if (typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000).toISOString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  if (typeof data === 'object') {
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
    console.warn("Firestore products fetch failure.");
  }

  try {
    flowProducts = await getFlowProducts().catch((e) => {
      console.warn("Printful Sync Failure:", e.message);
      return [];
    });
  } catch (error) {
    console.warn("External product synchronization failure.");
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
