import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

// Prevent build-time static generation failures
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MusicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const allProducts = await getAllProducts();
  
  const product = allProducts.find(p => 
    p.slug.toLowerCase() === slug.toLowerCase() && 
    p.type === 'music'
  );
  
  if (!product) {
    notFound();
  }
  
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
