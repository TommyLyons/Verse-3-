'use server';
/**
 * @fileOverview A flow for fetching product information from multiple Printful stores with accurate retail pricing.
 *
 * - getProducts - A function that fetches products from specific regional Printful stores.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Helper function to get the secret from Google Secret Manager
async function getPrintfulApiKey(): Promise<string | null> {
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
        // Silently fail during build if Secret Manager is not accessible
        return null;
    }
}

const brandStoreMap: Record<string, string[]> = {
  'Verse 3 Merch': ['V3 UK', 'V3 Europe'],
  'Crude City': ['Crude City Europe', 'Crude City UK']
};

const getProductsFlow = ai.defineFlow(
  {
    name: 'getProductsFlow',
    inputSchema: z.object({ brand: z.enum(['Verse 3 Merch', 'Crude City']) }),
    outputSchema: z.array(ProductSchema),
  },
  async ({ brand }) => {
    const apiKey = await getPrintfulApiKey();
    if (!apiKey) return [];

    const headers = { 'Authorization': `Bearer ${apiKey}` };
    const targetStores = brandStoreMap[brand] || [];

    try {
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const matchingStores = storesData.result.filter((store: any) => targetStores.includes(store.name));

        if (matchingStores.length === 0) return [];

        const allDetailedProducts: Product[] = [];

        for (const store of matchingStores) {
            const storeId = store.id;
            const region = store.name.includes('UK') ? 'UK' : 'EU';

            const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=50`, { headers });
            if (!productsResponse.ok) continue;

            const data = await productsResponse.json();
            const products = data.result;

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
                    
                    // Accurate retail price logic: Find the min price across all variants
                    let minPrice = Infinity;
                    let currencySymbol = region === 'UK' ? '£' : '€';

                    if (syncVariants && syncVariants.length > 0) {
                        syncVariants.forEach((v: any) => {
                            const p = parseFloat(v.retail_price);
                            if (!isNaN(p) && p < minPrice) {
                                minPrice = p;
                                currencySymbol = v.currency === 'GBP' ? '£' : '€';
                            }
                        });
                    }

                    const formattedPrice = minPrice === Infinity ? '€35.00' : `${currencySymbol}${minPrice.toFixed(2)}`;
                    const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                    return {
                        id: String(syncProduct.id),
                        name: syncProduct.name,
                        slug: slug,
                        price: formattedPrice,
                        description: `A high-quality product from ${brand}.`,
                        imageUrl: syncProduct.thumbnail_url,
                        revolutLink: 'https://revolut.me/test-business-studio',
                        type: 'merch',
                        brand: brand as any,
                        availableRegions: [region as any],
                        sizes: sizes.length > 0 ? sizes : undefined,
                    };
                } catch (err) {
                    return null;
                }
            }));

            allDetailedProducts.push(...detailedProducts.filter((p): p is Product => p !== null));
        }

        return allDetailedProducts;
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
