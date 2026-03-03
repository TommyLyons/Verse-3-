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
    // During build or local dev, prioritize env var to avoid Secret Manager permission warnings
    if (process.env.PRINTFUL_API_KEY) {
        return process.env.PRINTFUL_API_KEY;
    }

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
        // Only log warning if not in build process to keep logs clean
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`Failed to access secret: ${secretName}.`);
        }
        return null;
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
        // Fallback or return empty if no key
        return [];
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

        const response = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=24`, { headers });
        if (!response.ok) return [];

        const data = await response.json();
        const products = data.result;

        // Fetch details for each product to get variant information (sizes)
        const detailedProducts = await Promise.all(products.map(async (item: any) => {
            try {
                const detailResponse = await fetch(`https://api.printful.com/sync/products/${item.id}?store_id=${storeId}`, { headers });
                if (!detailResponse.ok) return null;
                
                const detailData = await detailResponse.json();
                const syncProduct = detailData.result.sync_product;
                const syncVariants = detailData.result.sync_variants;

                if (!syncProduct || !syncProduct.name || !syncProduct.thumbnail_url) return null;

                const sizes = syncVariants 
                    ? [...new Set(syncVariants.map((v: any) => v.size).filter(Boolean))] as string[] 
                    : [];
                
                const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                return {
                    id: String(syncProduct.id),
                    name: syncProduct.name,
                    slug: slug,
                    price: '€35.00', // Enforced pricing for Crude City merch
                    description: `A high-quality product: ${syncProduct.name}.`,
                    imageUrl: syncProduct.thumbnail_url,
                    revolutLink: 'https://revolut.me/test-business-studio',
                    type: 'merch',
                    brand: 'Crude City',
                    availableRegions: ['UK', 'EU'],
                    sizes: sizes.length > 0 ? sizes : undefined,
                };
            } catch (err) {
                return null;
            }
        }));

        return detailedProducts.filter((p): p is Product => p !== null);
      } catch (err) {
        return [];
      }
    }
    
    return [];
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
