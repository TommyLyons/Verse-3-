import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';
import type { Product } from '@/lib/products';

// In Next.js 15, params is a Promise that must be awaited.
export default async function MerchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch all data on the server.
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }
  
  // Render the client component and pass the fetched data as props.
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
