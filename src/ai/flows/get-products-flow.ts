'use server';
/**
 * @fileOverview A flow for fetching product information from multiple Printful stores with accurate retail pricing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

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
    const targetStores = (brandStoreMap[brand] || []).map(s => s.toLowerCase().trim());

    try {
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const matchingStores = storesData.result.filter((store: any) => 
            targetStores.includes(store.name.toLowerCase().trim())
        );

        if (matchingStores.length === 0) return [];

        const allDetailedProducts: Product[] = [];

        for (const store of matchingStores) {
            const storeId = store.id;
            const region = store.name.toUpperCase().includes('UK') ? 'UK' : 'EU';

            const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });
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
                    
                    // ACCURATE RETAIL PRICE EXTRACTION
                    let retailPrice = 0;
                    let currencyCode = region === 'UK' ? 'GBP' : 'EUR';

                    if (syncVariants && syncVariants.length > 0) {
                        const prices = syncVariants.map((v: any) => {
                            const p = parseFloat(v.retail_price);
                            return !isNaN(p) ? p : 0;
                        }).filter((p: number) => p > 0);

                        if (prices.length > 0) {
                            // Use max variant price for consistent premium branding (e.g. Backpack at €75)
                            retailPrice = Math.max(...prices);
                        }
                        
                        if (syncVariants[0].currency) {
                            currencyCode = syncVariants[0].currency;
                        }
                    }

                    const currencySymbol = currencyCode === 'GBP' ? '£' : (currencyCode === 'EUR' ? '€' : '$');
                    const formattedPrice = retailPrice === 0 ? 'N/A' : `${currencySymbol}${retailPrice.toFixed(2)}`;
                    const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                    return {
                        id: String(syncProduct.id),
                        name: syncProduct.name,
                        slug: slug,
                        price: formattedPrice,
                        description: syncProduct.name.includes('Backpack') 
                            ? `Premium official ${brand} utility gear. Built for durability and style.`
                            : `Official ${brand} merchandise. Premium quality.`,
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
