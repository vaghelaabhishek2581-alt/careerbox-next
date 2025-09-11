export interface Lead {
  id: string
  userId: string
  type: 'business' | 'institute'
  status: 'pending' | 'contacted' | 'converted' | 'rejected'
  businessData?: BusinessLeadData
  instituteData?: InstituteLeadData
  contactHistory: ContactRecord[]
  createdAt: Date
  updatedAt: Date
}

export interface BusinessLeadData {
  companyName: string
  industry: string
  size: string
  website?: string
  description: string
  contactPerson: {
    name: string
    position: string
    email: string
    phone: string
  }
}

export interface InstituteLeadData {
  instituteName: string
  type: string
  accreditation: string[]
  website?: string
  description: string
  contactPerson: {
    name: string
    position: string
    email: string
    phone: string
  }
}

export interface ContactRecord {
  id: string
  type: 'email' | 'phone' | 'meeting' | 'note'
  content: string
  timestamp: Date
  adminId: string
  adminName: string
}

export interface CreateLeadRequest {
  type: 'business' | 'institute'
  businessData?: BusinessLeadData
  instituteData?: InstituteLeadData
}

export interface UpdateLeadStatusRequest {
  leadId: string
  status: 'contacted' | 'converted' | 'rejected'
  notes?: string
}

export interface ConvertLeadRequest {
  leadId: string
  subscriptionPlan: string
  paymentDetails?: any
}
