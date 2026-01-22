
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
      const apiKey = await getPrintfulApiKey();

      if (!apiKey) {
          console.warn("Could not retrieve PRINTFUL_API_KEY from Secret Manager. Returning sample data as a fallback.");
          return sampleCrudeCityProducts;
      }

      try {
          const headers = { Authorization: `Bearer ${apiKey}` };
          // Fetch up to 100 products to handle pagination.
          const response = await fetch('https://api.printful.com/sync/products?limit=100', { headers });
          
          if (!response.ok) {
              const errorBody = await response.text();
              console.error(`Printful API error: ${response.status} ${response.statusText}`, errorBody);
              throw new Error(`Printful API request failed with status ${response.status}`);
          }
          
          const responseData = await response.json();
          const syncProducts = responseData.result;

          if (!Array.isArray(syncProducts)) {
             console.error("Unexpected response from Printful API. Expected 'result' to be an array. Got:", responseData);
             return [];
          }
          
          console.log(`Successfully fetched ${syncProducts.length} products from Printful.`);

          // Map Printful products to our app's Product schema
          const products: Product[] = syncProducts.map((p: any) => {
               if (!p.name) {
                  console.warn("Skipping a product from Printful because it has no name.", p);
                  return null; // Skip products without a name
               }
               return {
                   id: p.id,
                   name: p.name,
                   slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                   price: '$29.99', // Placeholder price
                   description: `A high-quality product from Crude City: ${p.name}.`, // Placeholder description
                   image: {
                      id: String(p.id),
                      imageUrl: p.thumbnail_url,
                      description: p.name,
                      imageHint: 'merchandise apparel'
                   },
                   revolutLink: 'https://revolut.me/your-business/0', // Placeholder
                   type: 'merch',
                   brand: 'Crude City',
                   digital: false,
                   sizes: ['S', 'M', 'L', 'XL'], // Placeholder sizes
                   availableRegions: ['UK', 'EU'],
              };
          }).filter((p): p is Product => p !== null); // Filter out any null products

          console.log(`Mapped ${products.length} products successfully.`);
          return products;

      } catch (error) {
          console.error("Failed to fetch products from Printful, falling back to sample data:", error);
          return sampleCrudeCityProducts;
      }
    }
    
    return [];
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
