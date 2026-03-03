import { MetadataRoute } from 'next';

const ICON_URL = 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260205-WA0003.jpg?alt=media&token=98291edc-2261-4cf8-9892-a10f7b00f8b0';

export const dynamic = 'force-static';

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
        src: ICON_URL,
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: ICON_URL,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  };
}