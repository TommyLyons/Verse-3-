'use server';
/**
 * @fileOverview A flow for fetching product information from Printful.
 *
 * - getProducts - A function that fetches a list of products from a specific Printful store.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Helper function to get the secret from Google Secret Manager
async function getPrintfulApiKey(): Promise<string | null> {
    const secretName = 'projects/studio-6967403383-a8bb0/secrets/PRINTFUL_API_KEY/versions/latest';

    try {
        const client = new SecretManagerServiceClient();
        const [version] = await client.accessSecretVersion({
            name: secretName,
        });

        const payload = version.payload?.data?.toString();
        if (payload) {
            return payload;
        }
        return null;
    } catch (error) {
        console.warn(`Failed to access secret: ${secretName}. Falling back to env.`);
        return process.env.PRINTFUL_API_KEY || null;
    }
}


const getProductsFlow = ai.defineFlow(
  {
    name: 'getProductsFlow',
    inputSchema: z.object({ brand: z.enum(['Verse 3 Merch', 'Crude City']) }),
    outputSchema: z.array(ProductSchema),
  },
  async ({ brand }) => {
    if (brand === 'Crude City') {
      const apiKey = await getPrintfulApiKey();
      if (!apiKey) {
        throw new Error('Printful API key is not available.');
      }

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
      };

      try {
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const crudeCityStore = storesData.result.find((store: any) => store.name === 'Crude City EU');

        if (!crudeCityStore) return [];
        const storeId = crudeCityStore.id;

        const response = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });
        if (!response.ok) return [];

        const data = await response.json();
        return data.result.map((item: any): Product | null => {
            if (!item.name || !item.thumbnail_url) return null;
            
            const slug = item.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const sizes = item.sync_variants ? [...new Set(item.sync_variants.map((v: any) => v.size).filter(Boolean))] as string[] : [];
            
            return {
                id: String(item.id),
                name: item.name,
                slug: slug,
                price: '€35.00',
                description: `A high-quality product: ${item.name}.`,
                imageUrl: item.thumbnail_url,
                revolutLink: 'https://revolut.me/test-business-studio',
                type: 'merch',
                brand: 'Crude City',
                availableRegions: ['UK', 'EU'],
                sizes: sizes.length > 0 ? sizes : undefined,
            };
        }).filter((p): p is Product => p !== null);
      } catch (err) {
        console.error("Printful fetch failed", err);
        return [];
      }
    }
    
    return [];
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
