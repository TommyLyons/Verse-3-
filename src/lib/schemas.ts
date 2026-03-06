
import {z} from 'genkit';

export const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  slug: z.string(),
  price: z.string(),
  description: z.string(),
  image: z.object({
    id: z.string().optional(),
    description: z.string(),
    imageUrl: z.string(),
    imageHint: z.string(),
  }).optional(),
  imageUrl: z.string().optional(),
  revolutLink: z.string().url(),
  type: z.enum(['merch', 'music']),
  brand: z.enum(['Verse 3 Merch', 'Crude City']).optional(),
  digital: z.boolean().optional(),
  isAlbum: z.boolean().optional(),
  tracks: z.array(z.object({
    title: z.string(),
    audioUrl: z.string().url()
  })).optional(),
  downloadUrl: z.string().url().optional(),
  availableRegions: z.array(z.enum(['UK', 'EU'])).optional(),
  sizes: z.array(z.string()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;
