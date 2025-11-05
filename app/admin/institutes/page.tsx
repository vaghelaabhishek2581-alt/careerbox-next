"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Upload, Search, Pencil, Trash2, RefreshCw, ChevronDown, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/src/hooks/use-toast'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

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
  const [rebuildingIndex, setRebuildingIndex] = useState(false)

  // Bulk selection
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

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
    setSelectedSlugs(new Set())
    setIsAllSelected(false)
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

  async function bulkDelete() {
    if (selectedSlugs.size === 0) {
      toast({ title: 'No selection', description: 'Please select institutes to delete', variant: 'destructive' })
      return
    }
    
    if (!confirm(`Delete ${selectedSlugs.size} institute(s)?`)) return
    
    try {
      const promises = Array.from(selectedSlugs).map(slug =>
        fetch(`/api/admin/institutes/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      )
      await Promise.all(promises)
      toast({ title: 'Success', description: `Deleted ${selectedSlugs.size} institute(s)` })
      setSelectedSlugs(new Set())
      setIsAllSelected(false)
      load()
    } catch (e: any) {
      toast({ title: 'Bulk delete failed', description: e.message, variant: 'destructive' })
    }
  }

  async function deleteAllInstitutes() {
    const confirmText = `DELETE ALL ${total} INSTITUTES`
    const userInput = prompt(`This will delete ALL ${total} institutes from the database!\n\nType "${confirmText}" to confirm:`)
    
    if (userInput !== confirmText) {
      if (userInput !== null) {
        toast({ title: 'Cancelled', description: 'Confirmation text did not match', variant: 'destructive' })
      }
      return
    }
    
    try {
      setLoading(true)
      // Fetch all institutes
      const res = await fetch(`/api/admin/institutes?limit=1000`)
      if (!res.ok) throw new Error('Failed to fetch institutes')
      const data = await res.json()
      const allSlugs = data.items.map((it: AdminInstituteItem) => it.slug)
      
      // Delete all
      const promises = allSlugs.map((slug: string) =>
        fetch(`/api/admin/institutes/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      )
      await Promise.all(promises)
      
      toast({ title: 'Success', description: `Deleted all ${allSlugs.length} institutes` })
      setSelectedSlugs(new Set())
      setIsAllSelected(false)
      load()
    } catch (e: any) {
      toast({ title: 'Delete all failed', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedSlugs(new Set())
      setIsAllSelected(false)
    } else {
      setSelectedSlugs(new Set(items.map(it => it.slug)))
      setIsAllSelected(true)
    }
  }

  function toggleSelect(slug: string) {
    const newSelected = new Set(selectedSlugs)
    if (newSelected.has(slug)) {
      newSelected.delete(slug)
    } else {
      newSelected.add(slug)
    }
    setSelectedSlugs(newSelected)
    setIsAllSelected(newSelected.size === items.length && items.length > 0)
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

  async function rebuildSearchIndex() {
    if (!confirm(`Rebuild search index for all ${total} institutes?\n\nThis will clear and recreate all search suggestions.`)) return
    
    try {
      setRebuildingIndex(true)
      const res = await fetch('/api/admin/rebuild-suggestions', { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      toast({ 
        title: 'Index Rebuilt', 
        description: `Created ${data.stats?.suggestionsCreated} suggestions from ${data.stats?.institutesProcessed} institutes` 
      })
    } catch (e: any) {
      toast({ title: 'Rebuild failed', description: e.message, variant: 'destructive' })
    } finally {
      setRebuildingIndex(false)
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedSlugs.size > 0 ? `Actions (${selectedSlugs.size})` : 'Actions'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {selectedSlugs.size > 0 && (
                  <>
                    <DropdownMenuItem onClick={bulkDelete} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedSlugs.size})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={deleteAllInstitutes} className="text-red-600 font-bold">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All ({total})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="secondary" 
              onClick={rebuildSearchIndex} 
              disabled={rebuildingIndex || loading}
            >
              <Zap className="w-4 h-4 mr-2" />
              {rebuildingIndex ? 'Rebuilding...' : 'Rebuild Search Index'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4 w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
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
                  <tr key={it.slug} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedSlugs.has(it.slug)}
                        onCheckedChange={() => toggleSelect(it.slug)}
                        aria-label={`Select ${it.name}`}
                      />
                    </td>
                    <td className="py-2 pr-4 text-blue-600 underline cursor-pointer" onClick={() => router.push(`/admin/institutes/${encodeURIComponent(it.slug)}`)}>{it.name}</td>
                    <td className="py-2 pr-4">{it.slug}</td>
                    <td className="py-2 pr-4">{it.type || '-'}</td>
                    <td className="py-2 pr-4">{it.status || '-'}</td>
                    <td className="py-2 pr-4">{it.location?.city || '-'}</td>
                    <td className="py-2 pr-4">{it.location?.state || '-'}</td>
                    <td className="py-2 pr-4">
                      <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); deleteItem(it.slug) }}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={8}>{loading ? 'Loading...' : 'No results'}</td>
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
