import mongoose, { Schema, Document } from 'mongoose'

// Facility Hours Schema
const FacilityHoursSchema = new Schema({
  monday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
  tuesday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
  wednesday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
  thursday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
  friday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
  saturday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
  sunday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: true } }
}, { _id: false })

// Equipment Schema
const EquipmentSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  condition: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'out-of-order'],
    default: 'good'
  },
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date }
}, { _id: false })

// Facility Schema
const FacilitySchema = new Schema({
  instituteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  type: { 
    type: String, 
    enum: [
      'library', 'laboratory', 'classroom', 'auditorium', 'sports-complex',
      'cafeteria', 'hostel', 'medical-center', 'computer-center', 'workshop',
      'seminar-hall', 'conference-room', 'parking', 'playground', 'gymnasium',
      'swimming-pool', 'research-center', 'innovation-lab', 'incubation-center',
      'placement-cell', 'counseling-center', 'bank', 'atm', 'transport',
      'security', 'maintenance', 'other'
    ],
    required: true
  },
  category: { 
    type: String, 
    enum: ['academic', 'recreational', 'residential', 'support', 'administrative'],
    required: true
  },
  description: { 
    type: String, 
    maxlength: 1000
  },
  
  // Location Information
  location: {
    building: { type: String },
    floor: { type: String },
    roomNumber: { type: String },
    area: { type: String }, // e.g., "Main Campus", "Hostel Block A"
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Capacity and Size
  capacity: { type: Number }, // number of people it can accommodate
  area: { type: Number }, // in square feet/meters
  areaUnit: { 
    type: String, 
    enum: ['sqft', 'sqm'],
    default: 'sqft'
  },
  
  // Equipment and Resources
  equipment: [EquipmentSchema],
  features: [{ type: String }], // e.g., "Air Conditioned", "Wi-Fi", "Projector"
  
  // Operational Information
  operatingHours: FacilityHoursSchema,
  isAccessible: { type: Boolean, default: true }, // wheelchair accessible
  requiresBooking: { type: Boolean, default: false },
  bookingContact: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  
  // Staff Information
  inchargeStaff: [{
    name: { type: String, required: true },
    designation: { type: String },
    phone: { type: String },
    email: { type: String }
  }],
  
  // Media
  images: [{ type: String }],
  virtualTourUrl: { type: String },
  
  // Maintenance
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
  maintenanceNotes: { type: String },
  
  // Usage Statistics
  utilizationRate: { type: Number, default: 0 }, // percentage
  monthlyUsage: { type: Number, default: 0 },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'under-maintenance', 'under-construction'],
    default: 'active'
  },
  isPublic: { type: Boolean, default: true }, // visible to public/students
  
  // Ratings and Reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for facility ID
FacilitySchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Virtual for full location
FacilitySchema.virtual('fullLocation').get(function() {
  const { building, floor, roomNumber, area } = this.location
  let location = ''
  if (roomNumber) location += roomNumber
  if (floor) location += (location ? ', ' : '') + floor
  if (building) location += (location ? ', ' : '') + building
  if (area) location += (location ? ', ' : '') + area
  return location || 'Location not specified'
})

// Virtual for current operational status
FacilitySchema.virtual('isCurrentlyOpen').get(function() {
  if (this.status !== 'active') return false
  
  const now = new Date()
  const currentDay = now.toLocaleLowerCase().substring(0, 3) // mon, tue, etc.
  const currentTime = now.toTimeString().substring(0, 5) // HH:MM format
  
  const daySchedule = this.operatingHours?.[currentDay]
  if (!daySchedule || daySchedule.closed) return false
  
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close
})

// Indexes
FacilitySchema.index({ instituteId: 1 })
FacilitySchema.index({ type: 1 })
FacilitySchema.index({ category: 1 })
FacilitySchema.index({ status: 1 })
FacilitySchema.index({ isPublic: 1 })
FacilitySchema.index({ 'location.building': 1 })
FacilitySchema.index({ 'location.area': 1 })
FacilitySchema.index({ rating: -1 })

// Text search index
FacilitySchema.index({
  name: 'text',
  description: 'text',
  'location.building': 'text',
  'location.area': 'text',
  features: 'text'
})

// Pre-save middleware
FacilitySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Facility document
export interface IFacility extends Document {
  _id: mongoose.Types.ObjectId
  instituteId: mongoose.Types.ObjectId
  name: string
  type: 'library' | 'laboratory' | 'classroom' | 'auditorium' | 'sports-complex' | 
        'cafeteria' | 'hostel' | 'medical-center' | 'computer-center' | 'workshop' |
        'seminar-hall' | 'conference-room' | 'parking' | 'playground' | 'gymnasium' |
        'swimming-pool' | 'research-center' | 'innovation-lab' | 'incubation-center' |
        'placement-cell' | 'counseling-center' | 'bank' | 'atm' | 'transport' |
        'security' | 'maintenance' | 'other'
  category: 'academic' | 'recreational' | 'residential' | 'support' | 'administrative'
  description?: string
  location: {
    building?: string
    floor?: string
    roomNumber?: string
    area?: string
    coordinates?: {
      latitude?: number
      longitude?: number
    }
  }
  capacity?: number
  area?: number
  areaUnit: 'sqft' | 'sqm'
  equipment: {
    name: string
    quantity: number
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'out-of-order'
    lastMaintenance?: Date
    nextMaintenance?: Date
  }[]
  features: string[]
  operatingHours: {
    monday: { open?: string, close?: string, closed: boolean }
    tuesday: { open?: string, close?: string, closed: boolean }
    wednesday: { open?: string, close?: string, closed: boolean }
    thursday: { open?: string, close?: string, closed: boolean }
    friday: { open?: string, close?: string, closed: boolean }
    saturday: { open?: string, close?: string, closed: boolean }
    sunday: { open?: string, close?: string, closed: boolean }
  }
  isAccessible: boolean
  requiresBooking: boolean
  bookingContact?: {
    name?: string
    phone?: string
    email?: string
  }
  inchargeStaff: {
    name: string
    designation?: string
    phone?: string
    email?: string
  }[]
  images: string[]
  virtualTourUrl?: string
  lastMaintenance?: Date
  nextMaintenance?: Date
  maintenanceNotes?: string
  utilizationRate: number
  monthlyUsage: number
  status: 'active' | 'inactive' | 'under-maintenance' | 'under-construction'
  isPublic: boolean
  rating: number
  reviewCount: number
  fullLocation: string
  isCurrentlyOpen: boolean
  createdAt: Date
  updatedAt: Date
}

export { IFacility }
export default mongoose.models.Facility || mongoose.model<IFacility>('Facility', FacilitySchema)
