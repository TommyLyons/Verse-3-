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

    // In a deployed App Hosting environment, authentication is handled automatically.
    try {
        const client = new SecretManagerServiceClient();
        const [version] = await client.accessSecretVersion({
            name: secretName,
        });

        const payload = version.payload?.data?.toString();
        if (payload) {
            return payload;
        }
        console.warn(`Secret payload for ${secretName} is empty.`);
        return null;
    } catch (error) {
        console.error(`Failed to access secret: ${secretName}.`, error);
        // Fallback for local development if secret is not available.
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
        throw new Error('Printful API key is not available. Please ensure the PRINTFUL_API_KEY secret is set in Google Secret Manager.');
      }

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
      };

      // Step 1: Fetch all stores to find the ID for "Crude City Eu"
      const storesResponse = await fetch('https://api.printful.com/stores', { headers });
      if (!storesResponse.ok) {
          if (storesResponse.status === 401) {
             throw new Error('Printful API authentication failed (401). Please double-check that the PRINTFUL_API_KEY in Google Secret Manager is correct and has store access permissions.');
          }
          throw new Error(`Printful API error when fetching stores: ${storesResponse.status}.`);
      }
      const storesData = await storesResponse.json();
      const crudeCityStore = storesData.result.find((store: any) => store.name === 'Crude City Eu');

      if (!crudeCityStore) {
          const availableStores = storesData.result.map((s: any) => s.name).join(', ');
          throw new Error(`Could not find a Printful store named "Crude City Eu". Available stores: [${availableStores}].`);
      }
      const storeId = crudeCityStore.id;

      // Step 2: Fetch products only from the specified store that are synced.
      const response = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Printful API error fetching products: ${response.status} ${response.statusText}. Response: ${errorBody}.`);
      }

      const data = await response.json();
      const products = data.result.map((item: any): Product | null => {
          if (!item.name || !item.thumbnail_url) {
              console.warn(`Skipping product with missing name or thumbnail. ID: ${item.id}`);
              return null;
          }
          const slug = item.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          const sizes = item.sync_variants ? [...new Set(item.sync_variants.map((v: any) => v.size).filter(Boolean))] as string[] : [];
          
          const firstVariant = item.sync_variants?.[0];
          let price = '£0.00'; // Default price
          if (firstVariant) {
              const retailPrice = firstVariant.retail_price || '0.00';
              const currencySymbol = firstVariant.currency === 'EUR' ? '€' : (firstVariant.currency === 'GBP' ? '£' : '$');
              price = `${currencySymbol}${retailPrice}`;
          }

          return {
              id: item.id,
              name: item.name,
              slug: slug,
              price: price,
              description: `A high-quality product: ${item.name}. More details coming soon.`, // Placeholder
              imageUrl: item.thumbnail_url,
              revolutLink: 'https://revolut.me/test-business-studio', // Placeholder
              type: 'merch',
              brand: 'Crude City',
              availableRegions: ['UK', 'EU'],
              sizes: sizes.length > 0 ? sizes : undefined,
          };
      }).filter((p): p is Product => p !== null);
      
      if (products.length === 0) {
          console.warn(`Printful API returned 0 products for store "Crude City Eu". Check if products have 'synced' status.`);
      }

      return products;
    }
    
    return [];
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
