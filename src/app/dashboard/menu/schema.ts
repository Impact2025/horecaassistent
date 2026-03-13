import { z } from 'zod'

const variantOptionSchema = z.object({
  name: z.string().min(1),
  priceOffsetCents: z.number().int().min(0),
})

const variantGroupSchema = z.object({
  group: z.string().min(1),
  required: z.boolean(),
  multiSelect: z.boolean(),
  options: z.array(variantOptionSchema),
})

export const menuItemFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Naam is verplicht'),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  priceCents: z.number().int().positive('Prijs is verplicht'),
  vatRate: z.enum(['0.09', '0.21', '0.00']),
  allergens: z.array(z.string()),
  isAvailable: z.boolean(),
  variants: z.array(variantGroupSchema),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export type MenuItemFormData = z.infer<typeof menuItemFormSchema>
