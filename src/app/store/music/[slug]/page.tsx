
import { getAllProducts, type Product } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

// This is the main server component for the product page.
export default async function MusicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch all data on the server.
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }
  
  // Render the client component and pass the fetched data as props.
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
