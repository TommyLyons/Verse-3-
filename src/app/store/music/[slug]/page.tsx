
import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MusicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch fresh products and strictly find by slug and type
  const allProducts = await getAllProducts();
  
  // Implement case-insensitive lookup to fix "Unstoppable" vs "unstoppable" routing issues
  const product = allProducts.find(p => 
    p.slug.toLowerCase() === slug.toLowerCase() && 
    p.type === 'music'
  );
  
  if (!product) {
    notFound();
  }
  
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
