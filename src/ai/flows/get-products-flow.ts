'use server';
/**
 * @fileOverview A robust flow for fetching and categorizing products from ALL connected Printful stores.
 * - Global De-duplication: Uses product slugs as unique identifiers across all stores.
 * - Brand Categorization: Detects 'Crude City' vs 'Verse 3' based on store name and product title.
 * - Region Detection: Automatically assigns UK (GBP) or EU (EUR) based on store currency/name.
 * - Robust Error Handling: Ensures the flow returns a clean list even if individual store calls fail.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function getPrintfulApiKey(): Promise<string | null> {
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

    try {
        // 1. Fetch all connected stores
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const allStores = storesData.result || [];
        if (allStores.length === 0) return [];

        // Map to prevent duplicates globally by slug
        const globalProductsMap = new Map<string, Product>();

        // 2. Iterate through each store
        for (const store of allStores) {
            const storeId = store.id;
            const storeNameUpper = store.name.toUpperCase();
            
            // Determine brand affiliation for the entire store as a hint
            const isCrudeCityStore = storeNameUpper.includes('CRUDE') || storeNameUpper.includes('CITY');
            
            // Determine region and currency
            const isUKStore = storeNameUpper.includes('UK') || storeNameUpper.includes('GBP');
            const region = isUKStore ? 'UK' : 'EU';
            const currencySymbol = isUKStore ? '£' : '€';
            const shippingBuffer = isUKStore ? 5.00 : 6.00;

            // 3. Fetch sync products for this store
            const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=50`, { headers });
            if (!productsResponse.ok) continue;

            const data = await productsResponse.json();
            const products = data.result || [];

            for (const item of products) {
                try {
                    // Normalize identifying info
                    const prodName = item.name.toLowerCase();
                    const slug = item.name.toLowerCase()
                        .replace(/ /g, '-')
                        .replace(/[^\w-]+/g, '')
                        .trim();

                    // Determine if this specific product belongs to the requested brand
                    const belongsToCrude = isCrudeCityStore || prodName.includes('crude') || prodName.includes('city');
                    const targetBrand = belongsToCrude ? 'Crude City' : 'Verse 3 Merch';

                    // Only process if it matches the requested brand
                    if (targetBrand !== brand) continue;

                    // Fetch detail for price and variants if not already in global map
                    if (!globalProductsMap.has(slug)) {
                        const detailResponse = await fetch(`https://api.printful.com/sync/products/${item.id}?store_id=${storeId}`, { headers });
                        if (!detailResponse.ok) continue;
                        
                        const detailData = await detailResponse.json();
                        const syncProduct = detailData.result.sync_product;
                        const syncVariants = detailData.result.sync_variants;

                        if (!syncProduct || !syncProduct.name) continue;

                        const sizes = syncVariants 
                            ? [...new Set(syncVariants.map((v: any) => v.size).filter(Boolean))] as string[] 
                            : [];
                        
                        let retailPrice = 0;
                        if (syncVariants && syncVariants.length > 0) {
                            const validPrices = syncVariants
                                .map((v: any) => parseFloat(v.retail_price))
                                .filter((p: number) => !isNaN(p) && p > 0);
                            
                            if (validPrices.length > 0) {
                                retailPrice = Math.min(...validPrices);
                            }
                        }

                        // Apply standard retail rounding logic
                        if (retailPrice > 0) {
                            retailPrice += shippingBuffer;
                            retailPrice = Math.round(retailPrice / 5) * 5;
                        }

                        const formattedPrice = retailPrice === 0 ? 'N/A' : `${currencySymbol}${retailPrice.toFixed(0)}`;

                        globalProductsMap.set(slug, {
                            id: String(syncProduct.id),
                            name: syncProduct.name,
                            slug: slug,
                            price: formattedPrice,
                            description: syncProduct.description || `Official ${brand} merchandise. Premium quality. Free shipping included.`,
                            imageUrl: syncProduct.thumbnail_url || item.thumbnail_url,
                            revolutLink: 'https://checkout.stripe.com/',
                            type: 'merch',
                            brand: brand as any,
                            availableRegions: [region as any],
                            sizes: sizes.length > 0 ? sizes : undefined,
                        });
                    }
                } catch (err) {
                    continue; // Skip individual product failures
                }
            }
        }

        return Array.from(globalProductsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
