import { BackButton } from '@/components/ui/back-button';

export default function StorePage() {
  return (
    <div className="container max-w-7xl py-12 md:py-24">
      <BackButton />
       <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-1">Store</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Browse our collection of merchandise, vinyls, and more.</p>
       </div>
      {/* Placeholder for product grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Products will be mapped here */}
       </div>
    </div>
  );
}
