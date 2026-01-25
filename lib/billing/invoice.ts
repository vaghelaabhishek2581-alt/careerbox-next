type SellerDetails = {
  name: string
  addressLine1: string
  addressLine2: string
  country: string
  gstin?: string
  pan?: string
  state?: string
  email?: string
}

type LineItem = {
  description: string
  qty: number
  unitPrice: number
  sac?: string
}

const pickEnv = (publicKey: string, serverKey: string, fallback: string) =>
  process.env[publicKey] || process.env[serverKey] || fallback

export const SELLER_DETAILS: SellerDetails = {
  name: pickEnv('NEXT_PUBLIC_SELLER_NAME', 'SELLER_NAME', 'CareerBox'),
  addressLine1: pickEnv(
    'NEXT_PUBLIC_SELLER_ADDRESS_LINE1',
    'SELLER_ADDRESS_LINE1',
    '2nd Floor, MG Road'
  ),
  addressLine2: pickEnv(
    'NEXT_PUBLIC_SELLER_ADDRESS_LINE2',
    'SELLER_ADDRESS_LINE2',
    'Bengaluru, Karnataka 560001'
  ),
  country: pickEnv('NEXT_PUBLIC_SELLER_COUNTRY', 'SELLER_COUNTRY', 'India'),
  gstin: pickEnv('NEXT_PUBLIC_SELLER_GSTIN', 'SELLER_GSTIN', ''),
  pan: pickEnv('NEXT_PUBLIC_SELLER_PAN', 'SELLER_PAN', ''),
  state: pickEnv('NEXT_PUBLIC_SELLER_STATE', 'SELLER_STATE', 'Karnataka'),
  email: pickEnv(
    'NEXT_PUBLIC_SELLER_EMAIL',
    'SELLER_EMAIL',
    'billing@careerbox.in'
  )
}

export const calculateSubtotal = (items: LineItem[]) =>
  items.reduce(
    (sum, item) => sum + Number(item.qty) * Number(item.unitPrice),
    0
  )

export const calculateTaxBreakup = (
  subtotal: number,
  sellerState?: string,
  buyerState?: string
) => {
  const rate = 0.18
  const sameState =
    sellerState &&
    buyerState &&
    sellerState.toLowerCase().trim() === buyerState.toLowerCase().trim()
  if (sameState) {
    const half = Math.round(subtotal * (rate / 2))
    return { cgst: half, sgst: half, igst: 0 }
  }
  return { cgst: 0, sgst: 0, igst: Math.round(subtotal * rate) }
}

export const generateInvoiceId = (date = new Date()) => {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `INV-${y}${m}${d}-${rand}`
}

export const getDueDate = (date: Date, days: number) => {
  const due = new Date(date)
  due.setDate(due.getDate() + days)
  return due
}
