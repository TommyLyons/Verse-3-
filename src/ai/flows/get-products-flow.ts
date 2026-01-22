'use server';
/**
 * @fileOverview A flow for fetching product information.
 * This acts as a secure backend placeholder for fetching products from a third-party API.
 *
 * - getProducts - A function that fetches a list of products.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Helper function to get the secret from Google Secret Manager
async function getPrintfulApiKey(): Promise<string | null> {
    const secretName = 'projects/studio-6967403383-a8bb0/secrets/PRINTFUL_API_KEY/versions/latest';

    // In a deployed App Hosting environment, authentication is handled automatically.
    // For local development, you may need to run `gcloud auth application-default login`.
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
        console.error(`Failed to access secret: ${secretName}. Ensure the secret exists, the Secret Manager API is enabled, and the service account has the 'Secret Manager Secret Accessor' role.`, error);
        // Fallback for local development if secret is not available.
        return process.env.PRINTFUL_API_KEY || null;
    }
}


// This is a placeholder. In a real application, you would make a secure call
// to the Printful/Printify API from within this flow on the server-side.
// The API key would be stored securely as a secret, not in the code.
const sampleCrudeCityProducts: Product[] = [
    {
        id: 101,
        name: 'Crude City Graffiti Tee',
        slug: 'crude-city-graffiti-tee',
        price: '$34.99',
        description: 'A premium cotton t-shirt featuring a bold graffiti design from the heart of Crude City. Limited edition.',
        image: {
            id: 'crude-city-tee',
            description: 'A black t-shirt with a colorful graffiti logo for Crude City.',
            imageUrl: 'https://picsum.photos/seed/101/600/600',
            imageHint: 'graffiti tshirt'
        },
        revolutLink: 'https://revolut.me/test-business-studio/35',
        type: 'merch',
        brand: 'Crude City',
        availableRegions: ['UK', 'EU'],
    },
    {
        id: 102,
        name: 'Crude City Beanie',
        slug: 'crude-city-beanie',
        price: '$22.99',
        description: 'Keep your head warm with the official Crude City beanie. Embroidered logo, one size fits all.',
        image: {
            id: 'crude-city-beanie',
            description: 'A black beanie with the Crude City logo embroidered.',
            imageUrl: 'https://picsum.photos/seed/102/600/600',
            imageHint: 'black beanie'
        },
        revolutLink: 'https://revolut.me/test-business-studio/23',
        type: 'merch',
        brand: 'Crude City',
        availableRegions: ['UK', 'EU'],
    },
    {
        id: 103,
        name: 'WEED T',
        slug: 'weed-t',
        price: '$45.00',
        description: 'High-quality tee with a bold statement. Made from 100% organic cotton.',
        image: {
            id: 'weed-t-shirt',
            description: 'A stylish t-shirt with a "WEED" graphic.',
            imageUrl: 'https://picsum.photos/seed/103/600/600',
            imageHint: 'graphic t-shirt'
        },
        revolutLink: 'https://revolut.me/test-business-studio/45',
        type: 'merch',
        brand: 'Crude City',
        availableRegions: ['UK', 'EU'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'],
    },
];


const getProductsFlow = ai.defineFlow(
  {
    name: 'getProductsFlow',
    inputSchema: z.object({ brand: z.enum(['Verse 3 Merch', 'Crude City']) }),
    outputSchema: z.array(ProductSchema),
  },
  async ({ brand }) => {
    if (brand === 'Crude City') {
      try {
        const apiKey = await getPrintfulApiKey();
        if (!apiKey) {
          console.log('Printful API key is not available. Falling back to sample data.');
          return sampleCrudeCityProducts;
        }

        const headers = {
          'Authorization': `Bearer ${apiKey}`,
        };
        const response = await fetch('https://api.printful.com/store/products?limit=100', { headers });

        if (!response.ok) {
          console.error(`Printful API error: ${response.status} ${response.statusText}. Falling back to sample data.`);
          return sampleCrudeCityProducts;
        }

        const data = await response.json();
        const products = data.result.map((item: any): Product | null => {
            if (!item.name || !item.thumbnail_url) {
                console.warn(`Skipping product with missing name or thumbnail. ID: ${item.id}`);
                return null;
            }
            const slug = item.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const sizes = item.variants ? [...new Set(item.variants.map((v: any) => v.size).filter(Boolean))] as string[] : [];
            
            const firstVariant = item.variants?.[0];
            let price = '$0.00'; // Default price
            if (firstVariant) {
                const retailPrice = firstVariant.retail_price || '0.00';
                // Simple currency mapping for now.
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

        return products;

      } catch (error) {
        console.error('Failed to fetch products from Printful, falling back to sample data.', error);
        return sampleCrudeCityProducts;
      }
    }
    
    return [];
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
