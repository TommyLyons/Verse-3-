import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    const musicProducts = products.filter((p) => p.type === 'music' && p.slug);
    
    if (musicProducts.length === 0) {
      return [{ slug: 'quiet-steps' }];
    }
    
    return musicProducts.map((p) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for music:", error);
    return [{ slug: 'quiet-steps' }];
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
