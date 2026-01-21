import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export type InvoiceLineItem = { description: string; qty: number; unitPrice: number; sac?: string }
export type InvoiceParty = {
  name: string
  addressLine1: string
  addressLine2: string
  country: string
  gstin?: string
  pan?: string
  state?: string
  email?: string
}
export type InvoicePdfInput = {
  id: string
  date: string
  dueDate?: string
  plan?: string
  cycle?: string
  method?: 'upi' | 'card'
  transactionId?: string
  upiHandle?: string
  cardBrand?: string
  cardLast4?: string
  seller?: InvoiceParty
  buyer?: InvoiceParty
  lineItems: InvoiceLineItem[]
}

const fetchLogoPngBytes = async (): Promise<Uint8Array | null> => {
  try {
    const logoUrl = `${window.location.origin}/Logo.svg`
    const svgText = await fetch(logoUrl).then(r => r.text())
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const loaded: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = reject
    })
    img.src = svgUrl
    const imageEl = await loaded
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(imageEl, 0, 0, size, size)
    const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b as Blob), 'image/png'))
    const buf = await blob.arrayBuffer()
    URL.revokeObjectURL(svgUrl)
    return new Uint8Array(buf)
  } catch {
    return null
  }
}

const numberToWords = (num: number) => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const twoDigits = (n: number) => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  const threeDigits = (n: number) => {
    const h = Math.floor(n / 100)
    const r = n % 100
    return h ? ones[h] + ' hundred' + (r ? ' and ' + twoDigits(r) : '') : twoDigits(r)
  }
  let n = Math.floor(num)
  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  const hundred = n
  const parts = []
  if (crore) parts.push(threeDigits(crore) + ' crore')
  if (lakh) parts.push(threeDigits(lakh) + ' lakh')
  if (thousand) parts.push(threeDigits(thousand) + ' thousand')
  if (hundred) parts.push(threeDigits(hundred))
  const sentence = parts.join(' ')
  return sentence.replace(/\b\w/g, c => c.toUpperCase())
}

export async function downloadInvoicePdf(data: InvoicePdfInput) {
  const brandName = 'Career Routes Pvt. Ltd.'
  const brandAddressLines = [
    '53, World Business House,',
    'Shanti Sadan Society,',
    'Nr. Parimal Garden, EllisBridge,',
    'Ahmedabad, Gujarat-380006',
  ]

  const subtotal = data.lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const intraState = data.seller?.state && data.buyer?.state ? data.seller.state === data.buyer.state : true
  const taxRate = 0.18
  const totalTax = Math.round(subtotal * taxRate)
  const cgst = intraState ? Math.round(totalTax / 2) : 0
  const sgst = intraState ? Math.round(totalTax / 2) : 0
  const igst = intraState ? 0 : totalTax
  const totalDue = subtotal + totalTax
  const formatINR = (n: number) => n.toLocaleString('en-IN')

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  const marginX = 40
  const yStart = height - 40

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const logoPng = await fetchLogoPngBytes()
  if (logoPng) {
    const pngImage = await pdfDoc.embedPng(logoPng)
    page.drawImage(pngImage, { x: marginX, y: yStart - 40, width: 32, height: 32 })
  }
  page.drawText('CareerBox', { x: marginX + 40, y: yStart - 28, size: 16, font: fontBold, color: rgb(0.12, 0.12, 0.12) })

  const rightEdgeX = width - marginX
  const brandNameWidth = fontBold.widthOfTextAtSize(brandName, 12)
  page.drawText(brandName, { x: rightEdgeX - brandNameWidth, y: yStart - 18, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  brandAddressLines.forEach((line, idx) => {
    const w = font.widthOfTextAtSize(line, 10)
    page.drawText(line, { x: rightEdgeX - w, y: yStart - 36 - idx * 14, size: 10, font, color: rgb(0.35, 0.35, 0.35) })
  })

  const heading = 'Tax Invoice'
  const headingSize = 14
  const headingWidth = fontBold.widthOfTextAtSize(heading, headingSize)
  const headingY = yStart - 96
  page.drawText(heading, { x: (width - headingWidth) / 2, y: headingY, size: headingSize, font: fontBold, color: rgb(0.1, 0.1, 0.1) })

  let cursorY = yStart - 80 - brandAddressLines.length * 14

  const drawBox = (title: string, lines: string[], x: number, y: number, w: number) => {
    page.drawText(title, { x, y: y - 18, size: 10, font: fontBold, color: rgb(0.3, 0.3, 0.3) })
    lines.forEach((ln, i) => {
      page.drawText(ln, { x, y: y - 34 - i * 12, size: 10, font, color: rgb(0.2, 0.2, 0.2) })
    })
  }

  const leftBoxW = (width - marginX * 2 - 12) / 2
  const rightBoxX = marginX + leftBoxW + 12

  const sellerLines = data.seller ? [
    data.seller.name,
    data.seller.addressLine1,
    data.seller.addressLine2,
    data.seller.country,
    data.seller.gstin ? `GSTIN: ${data.seller.gstin}` : '',
    data.seller.pan ? `PAN: ${data.seller.pan}` : '',
    data.seller.email ? `Email: ${data.seller.email}` : '',
  ].filter(Boolean) : []

  const buyerLines = data.buyer ? [
    data.buyer.name,
    data.buyer.addressLine1,
    data.buyer.addressLine2,
    data.buyer.country,
    data.buyer.gstin ? `GSTIN: ${data.buyer.gstin}` : '',
    data.buyer.email ? `Email: ${data.buyer.email}` : '',
  ].filter(Boolean) : []

  if (sellerLines.length) drawBox('Billed By', sellerLines, marginX, cursorY, leftBoxW)
  if (buyerLines.length) drawBox('Billed To', buyerLines, rightBoxX, cursorY, leftBoxW)

  cursorY -= 116

  const invoiceLines = [
    `No.: ${data.id}`,
    `Invoice Date: ${new Date(data.date).toLocaleDateString()}`,
    data.dueDate ? `Due Date: ${new Date(data.dueDate).toLocaleDateString()}` : undefined,
  ].filter(Boolean) as string[]
  drawBox('Invoice', invoiceLines, marginX, cursorY, leftBoxW)

  const paymentMethod = data.method === 'upi'
    ? `UPI · ${data.upiHandle}`
    : data.cardBrand ? `Card · ${data.cardBrand} ···· ${data.cardLast4}` : undefined
  const paymentLines = [
    paymentMethod ? `Method: ${paymentMethod}` : undefined,
    data.transactionId ? `Transaction ID: ${data.transactionId}` : undefined,
    data.buyer?.state ? `Place of Supply: ${data.buyer.state}` : undefined,
    'Reverse Charge: No',
  ].filter(Boolean) as string[]
  drawBox('Payment', paymentLines, rightBoxX, cursorY, leftBoxW)

  cursorY -= 86

  const tableX = marginX
  const tableW = width - marginX * 2
  const headerH = 24
  const colXs = [tableX + 10, tableX + tableW * 0.68, tableX + tableW * 0.82]
  const unitRightX = tableX + tableW - 10
  page.drawText('Description', { x: colXs[0], y: cursorY - 10, size: 10, font: fontBold, color: rgb(0.35, 0.35, 0.35) })
  page.drawText('HSN/SAC', { x: colXs[1], y: cursorY - 10, size: 10, font: fontBold, color: rgb(0.35, 0.35, 0.35) })
  page.drawText('Qty', { x: colXs[2], y: cursorY - 10, size: 10, font: fontBold, color: rgb(0.35, 0.35, 0.35) })
  const unitHeaderW = fontBold.widthOfTextAtSize('Unit Price', 10)
  page.drawText('Unit Price', { x: unitRightX - unitHeaderW, y: cursorY - 10, size: 10, font: fontBold, color: rgb(0.35, 0.35, 0.35) })
  let rowY = cursorY - headerH - 14
  data.lineItems.forEach(item => {
    page.drawText(item.description, { x: colXs[0], y: rowY, size: 10, font })
    page.drawText(String(item.sac || ''), { x: colXs[1], y: rowY, size: 10, font })
    page.drawText(String(item.qty), { x: colXs[2], y: rowY, size: 10, font })
    const unitStr = `INR ${formatINR(item.unitPrice)}`
    const textWidth = font.widthOfTextAtSize(unitStr, 10)
    page.drawText(unitStr, { x: unitRightX - textWidth, y: rowY, size: 10, font })
    rowY -= 18
  })

  cursorY -= 180

  const summaryX = width - marginX - 240
  const drawSummaryRow = (label: string, value: string, bold = false) => {
    page.drawText(label, { x: summaryX, y: cursorY, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
    const w = (bold ? fontBold : font).widthOfTextAtSize(value, bold ? 12 : 10)
    page.drawText(value, { x: width - marginX - w, y: cursorY, size: bold ? 12 : 10, font: bold ? fontBold : font, color: rgb(0.1, 0.1, 0.1) })
    cursorY -= bold ? 18 : 14
  }
  drawSummaryRow('Subtotal', `INR ${formatINR(subtotal)}`)
  if (intraState) {
    drawSummaryRow('CGST @ 9%', `INR ${formatINR(cgst)}`)
    drawSummaryRow('SGST @ 9%', `INR ${formatINR(sgst)}`)
  } else {
    drawSummaryRow('IGST @ 18%', `INR ${formatINR(igst)}`)
  }
  drawSummaryRow('Total Due', `INR ${formatINR(totalDue)}`, true)

  cursorY -= 8
  const amtWords = numberToWords(totalDue)
  page.drawText('Amount in Words', { x: marginX, y: cursorY, size: 10, font: fontBold, color: rgb(0.3, 0.3, 0.3) })
  cursorY -= 14
  page.drawText(`INR ${amtWords} Only`, { x: marginX, y: cursorY, size: 10, font, color: rgb(0.2, 0.2, 0.2) })
  cursorY -= 18
  page.drawText('Terms & Conditions', { x: marginX, y: cursorY, size: 10, font: fontBold, color: rgb(0.3, 0.3, 0.3) })
  cursorY -= 14
  const terms = [
    'Prices are exclusive of applicable taxes unless stated otherwise. Tax charged as per GST law.',
    'Services are non-transferable and subject to the CareerBox Terms of Service.',
    'Disputes subject to Bengaluru, Karnataka jurisdiction.',
  ]
  terms.forEach(t => {
    page.drawText(t, { x: marginX, y: cursorY, size: 10, font, color: rgb(0.25, 0.25, 0.25) })
    cursorY -= 12
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Invoice_${data.id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

