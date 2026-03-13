'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useUploadThing } from '@/lib/uploadthing'
import { upsertMenuItem, upsertCategory } from '@/app/dashboard/menu/actions'
import { menuItemFormSchema } from '@/app/dashboard/menu/schema'
import type { MenuItemFormData } from '@/app/dashboard/menu/schema'
import type { MenuItem, MenuCategory } from '@/lib/db/schema'

const ALLERGEN_LIST = [
  'gluten', 'schaaldieren', 'eieren', 'vis', 'pindas',
  'soja', 'melk', 'noten', 'selderij', 'mosterd',
  'sesamzaad', 'zwaveldioxide', 'lupine', 'weekdieren',
]

interface MenuItemModalProps {
  item?: MenuItem | null
  categories: MenuCategory[]
  onClose: () => void
  onSaved: () => void
}

export default function MenuItemModal({
  item,
  categories,
  onClose,
  onSaved,
}: MenuItemModalProps) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '')
  const [priceInput, setPriceInput] = useState(
    item ? (item.priceCents / 100).toFixed(2) : ''
  )
  const [vatRate, setVatRate] = useState<'0.09' | '0.21' | '0.00'>(
    (item?.vatRate as '0.09' | '0.21' | '0.00') ?? '0.09'
  )
  const [allergens, setAllergens] = useState<string[]>(item?.allergens ?? [])
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true)
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '')
  const [variants, setVariants] = useState<MenuItemFormData['variants']>(
    item?.variants ?? []
  )
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { startUpload } = useUploadThing('menuItemImage')

  function toggleAllergen(a: string) {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  function addVariantGroup() {
    setVariants((prev) => [
      ...prev,
      { group: '', required: false, multiSelect: false, options: [] },
    ])
  }

  function updateVariantGroup(
    index: number,
    field: keyof MenuItemFormData['variants'][number],
    value: unknown
  ) {
    setVariants((prev) =>
      prev.map((vg, i) => (i === index ? { ...vg, [field]: value } : vg))
    )
  }

  function removeVariantGroup(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  function addVariantOption(groupIndex: number) {
    setVariants((prev) =>
      prev.map((vg, i) =>
        i === groupIndex
          ? { ...vg, options: [...vg.options, { name: '', priceOffsetCents: 0 }] }
          : vg
      )
    )
  }

  function updateVariantOption(
    groupIndex: number,
    optIndex: number,
    field: 'name' | 'priceOffsetCents',
    value: string | number
  ) {
    setVariants((prev) =>
      prev.map((vg, i) =>
        i === groupIndex
          ? {
              ...vg,
              options: vg.options.map((opt, j) =>
                j === optIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : vg
      )
    )
  }

  function removeVariantOption(groupIndex: number, optIndex: number) {
    setVariants((prev) =>
      prev.map((vg, i) =>
        i === groupIndex
          ? { ...vg, options: vg.options.filter((_, j) => j !== optIndex) }
          : vg
      )
    )
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    try {
      const result = await upsertCategory({ name: newCategoryName.trim() })
      setCategoryId(result.id)
      setShowNewCategory(false)
      setNewCategoryName('')
    } catch {
      setErrors((prev) => ({ ...prev, category: 'Kon categorie niet aanmaken' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const priceCents = Math.round(parseFloat(priceInput.replace(',', '.')) * 100)
    const data: MenuItemFormData = {
      id: item?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      priceCents,
      vatRate,
      allergens,
      isAvailable,
      variants,
      imageUrl: imageUrl.trim() || undefined,
    }

    const parsed = menuItemFormSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      await upsertMenuItem(data)
      onSaved()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Opslaan mislukt' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[#fbf9f6] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[#fbf9f6] px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-on-surface">
            {item ? 'Item bewerken' : 'Item toevoegen'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.form && (
            <div className="bg-[#fce4ec] text-[#880e4f] px-4 py-3 rounded-lg text-sm">
              {errors.form}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Naam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Bijv. Cappuccino"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Beschrijving
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Korte omschrijving..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Categorie
            </label>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Nieuwe categorie naam"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Aanmaken
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Annuleer
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Geen categorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container transition-colors whitespace-nowrap"
                >
                  + Nieuwe categorie
                </button>
              </div>
            )}
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Price + VAT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Prijs (€) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                  €
                </span>
                <input
                  type="text"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="0.00"
                />
              </div>
              {errors.priceCents && (
                <p className="text-xs text-red-500 mt-1">{errors.priceCents}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                BTW-tarief
              </label>
              <select
                value={vatRate}
                onChange={(e) =>
                  setVatRate(e.target.value as '0.09' | '0.21' | '0.00')
                }
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="0.09">9% (laag)</option>
                <option value="0.21">21% (hoog)</option>
                <option value="0.00">0% (vrijgesteld)</option>
              </select>
            </div>
          </div>

          {/* Availability toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">Beschikbaar</p>
              <p className="text-xs text-on-surface-variant">
                Zichtbaar voor gasten in het menu
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAvailable ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Allergenen
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGEN_LIST.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={allergens.includes(allergen)}
                    onChange={() => toggleAllergen(allergen)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-on-surface capitalize">
                    {allergen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Afbeelding
            </label>
            <div className="flex items-start gap-4">
              {imageUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-white text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
              <label
                className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  uploading
                    ? 'border-primary/40 bg-primary/5 cursor-wait'
                    : 'border-outline-variant hover:border-primary hover:bg-primary/5'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploading(true)
                    try {
                      const res = await startUpload([file])
                      if (res?.[0]?.url) setImageUrl(res[0].url)
                    } catch {
                      setErrors((prev) => ({ ...prev, imageUrl: 'Upload mislukt' }))
                    } finally {
                      setUploading(false)
                      e.target.value = ''
                    }
                  }}
                />
                {uploading ? (
                  <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    add_photo_alternate
                  </span>
                )}
                <span className="text-[10px] text-on-surface-variant text-center leading-tight">
                  {uploading ? 'Uploaden...' : 'Foto uploaden'}
                </span>
              </label>
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.imageUrl}</p>
            )}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-on-surface">
                Varianten
              </label>
              <button
                type="button"
                onClick={addVariantGroup}
                className="text-xs text-primary font-medium hover:underline"
              >
                + Variantgroep toevoegen
              </button>
            </div>
            <div className="space-y-4">
              {variants.map((vg, gi) => (
                <div
                  key={gi}
                  className="border border-outline-variant rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={vg.group}
                      onChange={(e) =>
                        updateVariantGroup(gi, 'group', e.target.value)
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Naam van de groep (bijv. Melksoort)"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantGroup(gi)}
                      className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vg.required}
                        onChange={(e) =>
                          updateVariantGroup(gi, 'required', e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded"
                      />
                      Verplicht
                    </label>
                    <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vg.multiSelect}
                        onChange={(e) =>
                          updateVariantGroup(gi, 'multiSelect', e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded"
                      />
                      Meervoudige keuze
                    </label>
                  </div>
                  <div className="space-y-2">
                    {vg.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) =>
                            updateVariantOption(gi, oi, 'name', e.target.value)
                          }
                          className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Optienaam"
                        />
                        <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs">
                            +€
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={(opt.priceOffsetCents / 100).toFixed(2)}
                            onChange={(e) =>
                              updateVariantOption(
                                gi,
                                oi,
                                'priceOffsetCents',
                                Math.round(parseFloat(e.target.value) * 100)
                              )
                            }
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariantOption(gi, oi)}
                          className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            remove_circle
                          </span>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addVariantOption(gi)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      + Optie toevoegen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
