export default function ArtistsPage() {
  return (
    <div className="container max-w-7xl py-12 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Artists</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Meet the talent behind the music.</p>
      </div>
      {/* Placeholder for artist grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Artist cards will be mapped here */}
      </div>
    </div>
  );
}
