import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Verse3 Records',
    short_name: 'Verse3',
    description: 'Electronic music label, Streetwear merch & Live events',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/favicon.ico?alt=media&token=23b7208f-24e8-4f3b-aab8-8bfd2ed9ca74',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260204-WA0001~2.jpg?alt=media&token=45b80a78-89ad-40ca-a55a-e185c9447432',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  };
}
