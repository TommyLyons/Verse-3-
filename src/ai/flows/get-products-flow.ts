'use server';
/**
 * @fileOverview A flow for fetching product information from ALL connected Printful stores.
 * - Store-Name Categorization: Automatically assigns items to 'Crude City' if the store name matches, ensuring complete inventory sync.
 * - Brand Logic: Products match brands based on both Store Name and Product Title for maximum accuracy.
 * - UK/EU Regions: GBP (£) and EUR (€) handling with shipping buffers and rounding.
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
        // Fetch ALL stores in the account
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const allStores = storesData.result || [];

        if (allStores.length === 0) return [];

        const allDetailedProducts: Product[] = [];

        for (const store of allStores) {
            const storeId = store.id;
            const storeNameUpper = store.name.toUpperCase();
            
            // Categorization logic: If the store name contains 'CRUDE' or 'CITY', it's a Crude City store.
            const isCrudeCityStore = storeNameUpper.includes('CRUDE') || storeNameUpper.includes('CITY');
            
            // Determine Region for pricing
            const isUKStore = storeNameUpper.includes('UK') || 
                            storeNameUpper.includes('UNITED KINGDOM') ||
                            storeNameUpper.includes('GBP');
            
            const region = isUKStore ? 'UK' : 'EU';
            const currencySymbol = isUKStore ? '£' : '€';
            const shippingBuffer = isUKStore ? 5.00 : 6.00;

            // Fetch products from this specific store (limit 100 per store)
            const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });
            if (!productsResponse.ok) continue;

            const data = await productsResponse.json();
            const products = data.result || [];

            const detailedProducts = await Promise.all(products.map(async (item: any) => {
                try {
                    const detailResponse = await fetch(`https://api.printful.com/sync/products/${item.id}?store_id=${storeId}`, { headers });
                    if (!detailResponse.ok) return null;
                    
                    const detailData = await detailResponse.json();
                    const syncProduct = detailData.result.sync_product;
                    const syncVariants = detailData.result.sync_variants;

                    if (!syncProduct || !syncProduct.name || !syncProduct.thumbnail_url) return null;

                    // Comprehensive Brand Logic:
                    // A product belongs to Crude City if its store is a Crude City store OR if its name mentions Crude/City.
                    const prodName = syncProduct.name.toLowerCase();
                    const belongsToCrude = isCrudeCityStore || prodName.includes('crude') || prodName.includes('city');

                    // Filter by the requested brand
                    if (brand === 'Crude City' && !belongsToCrude) return null;
                    if (brand === 'Verse 3 Merch' && belongsToCrude) return null;

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

                    if (retailPrice > 0) {
                        // Add Shipping Buffer and round to nearest multiple of 5 for professional pricing
                        retailPrice += shippingBuffer;
                        retailPrice = Math.round(retailPrice / 5) * 5;
                    }

                    const formattedPrice = retailPrice === 0 ? 'N/A' : `${currencySymbol}${retailPrice.toFixed(0)}`;
                    const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                    return {
                        id: String(syncProduct.id),
                        name: syncProduct.name,
                        slug: slug,
                        price: formattedPrice,
                        description: syncProduct.description || `Official ${brand} merchandise. Premium quality. Free shipping included.`,
                        imageUrl: syncProduct.thumbnail_url,
                        revolutLink: 'https://checkout.stripe.com/',
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

        // Return sorted alphabetically for consistent display
        return allDetailedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
