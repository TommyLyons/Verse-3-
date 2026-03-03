import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

// Force static export to strictly require generateStaticParams
export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    // Filter for music products with slugs
    const params = products
      .filter((p) => p.type === 'music' && p.slug)
      .map((p) => ({
        slug: p.slug,
      }));
    
    // Ensure we return at least one param for the build process
    return params.length > 0 ? params : [{ slug: 'placeholder-slug' }];
  } catch (error) {
    console.error("Error in generateStaticParams for music:", error);
    return [];
  }
}

export default async function MusicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }
  
  return <ProductClientPage product={product} allProducts={allProducts} />;
}