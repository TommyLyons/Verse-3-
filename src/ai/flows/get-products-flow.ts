'use server';
/**
 * @fileOverview A flow for fetching product information.
 * This acts as a secure backend placeholder for fetching products from a third-party API.
 *
 * - getProducts - A function that fetches a list of products.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  slug: z.string(),
  price: z.string(),
  description: z.string(),
  image: z.object({
    id: z.string().optional(),
    description: z.string(),
    imageUrl: z.string(),
    imageHint: z.string(),
  }).optional(),
  imageUrl: z.string().optional(),
  revolutLink: z.string().url(),
  type: z.enum(['merch', 'music']),
  brand: z.enum(['Verse 3 Merch', 'Crude City']).optional(),
  digital: z.boolean().optional(),
  downloadUrl: z.string().url().optional(),
  availableRegions: z.array(z.enum(['UK', 'EU'])).optional(),
  sizes: z.array(z.string()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;


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
        availableRegions: ['EU'],
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
    //
    // DEVELOPER NOTE: THIS IS WHERE THE SECURE API INTEGRATION HAPPENS.
    //
    // 1.  LOAD THE SECRET KEY: The Printful API key must be stored in a secure
    //     secret manager (like Google Secret Manager or Firebase Secret Manager), NOT here in the code.
    //     A developer would write code here to fetch the key from that service.
    //
    //     Example (conceptual):
    //     const printfulApiKey = await accessSecretManager('printful-api-key');
    //
    // 2.  CALL THE API: Make the call to the Printful API using the fetched key.
    //
    //     Example (conceptual):
    //     const response = await fetch('https://api.printful.com/store/products', {
    //       headers: { Authorization: `Bearer ${printfulApiKey}` }
    //     });
    //     const data = await response.json();
    //
    // 3.  TRANSFORM & RETURN DATA: Map the data from the Printful API to match our ProductSchema.
    //     return transformedData;
    //

    console.log(`Fetching products for brand: ${brand}`);
    if (brand === 'Crude City') {
      // For now, we return sample data. A developer would replace this with the real API call.
      return sampleCrudeCityProducts;
    }
    return [];
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
