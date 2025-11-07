import mongoose, { Schema, Document } from 'mongoose'

export interface ISearchSuggestion extends Document {
  name: string
  type: 'institute' | 'program' | 'course'
  publicId: string // Reference to original document
  slug?: string
  metadata?: {
    instituteName?: string
    instituteSlug?: string
    programName?: string
    logo?: string
    city?: string
    state?: string
    description?: string
  }
  searchText: string // Lowercase normalized text for fast searching
  createdAt: Date
  updatedAt: Date
}

const SearchSuggestionSchema = new Schema<ISearchSuggestion>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['institute', 'program', 'course'], required: true },
    publicId: { type: String, required: true },
    slug: String,
    metadata: {
      instituteName: String,
      instituteSlug: String,
      programName: String,
      logo: String,
      city: String,
      state: String,
      description: String,
    },
    searchText: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

// Indexes for fast searching
SearchSuggestionSchema.index({ name: 1 }) // For prefix search
SearchSuggestionSchema.index({ type: 1 })
SearchSuggestionSchema.index({ publicId: 1 })
SearchSuggestionSchema.index({ type: 1, name: 1 }) // Compound index for sorted prefix search

export default mongoose.models.SearchSuggestion || mongoose.model<ISearchSuggestion>('SearchSuggestion', SearchSuggestionSchema)
