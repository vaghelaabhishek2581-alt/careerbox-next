"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Upload, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/src/hooks/use-toast'

interface AdminInstituteItem {
  _id?: string
  id?: string
  name: string
  slug: string
  type?: string
  status?: string
  website?: string
  location?: { city?: string; state?: string }
  updatedAt?: string
}

export default function AdminInstitutesPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [items, setItems] = useState<AdminInstituteItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  // Single create form
  const [form, setForm] = useState<AdminInstituteItem>({ name: '', slug: '' })

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<AdminInstituteItem | null>(null)

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    p.set('page', String(page))
    p.set('limit', String(limit))
    if (q.trim()) p.set('q', q.trim())
    return p.toString()
  }, [page, limit, q])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/institutes?${queryString}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
    } catch (e: any) {
      toast({ title: 'Failed to load', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString])

  async function createSingle() {
    try {
      if (!form.name || !form.slug) {
        toast({ title: 'Validation', description: 'Name and slug are required', variant: 'destructive' })
        return
      }
      const res = await fetch('/api/admin/institutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Created', description: `${form.name} added` })
      setForm({ name: '', slug: '' })
      load()
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
    }
  }

  async function bulkUploadFromFile(file: File) {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const payload = Array.isArray(json) ? json : [json]
      const res = await fetch('/api/admin/institutes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Bulk upload complete' })
      load()
    } catch (e: any) {
      toast({ title: 'Bulk upload failed', description: e.message, variant: 'destructive' })
    }
  }

  async function deleteItem(slug: string) {
    if (!confirm('Delete this institute?')) return
    try {
      const res = await fetch(`/api/admin/institutes/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Deleted' })
      load()
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
    }
  }

  async function saveEdit() {
    if (!editData) return
    try {
      const res = await fetch(`/api/admin/institutes/${encodeURIComponent(editData.slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Updated' })
      setEditOpen(false)
      setEditData(null)
      load()
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Building2 className="w-6 h-6"/>Institutes</h1>
        <Button variant="outline" onClick={() => load()} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2"/>
          Refresh
        </Button>
      </div>

      

      <Card>
        <CardHeader>
          <CardTitle>Browse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
              <Input placeholder="Search name, slug, city, state" className="pl-8" value={q} onChange={(e)=> setQ(e.target.value)} />
            </div>
            <Input type="number" className="w-24" value={limit} onChange={(e)=> setLimit(Math.max(1, Math.min(100, Number(e.target.value)||20)))} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.slug} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/admin/institutes/${encodeURIComponent(it.slug)}`)}>
                    <td className="py-2 pr-4 text-red-700 underline" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/admin/institutes/${encodeURIComponent(it.slug)}`) }}>{it.name}</td>
                    <td className="py-2 pr-4">{it.slug}</td>
                    <td className="py-2 pr-4">{it.type || '-'}</td>
                    <td className="py-2 pr-4">{it.status || '-'}</td>
                    <td className="py-2 pr-4">{it.location?.city || '-'}</td>
                    <td className="py-2 pr-4">{it.location?.state || '-'}</td>
                    <td className="py-2 pr-4">
                      <Button variant="destructive" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); deleteItem(it.slug) }}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={7}>{loading ? 'Loading...' : 'No results'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Total: {total}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page<=1} onClick={()=> setPage(p=> Math.max(1, p-1))}>Prev</Button>
              <div className="text-sm">Page {page}</div>
              <Button variant="outline" disabled={page*limit>=total} onClick={()=> setPage(p=> p+1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
