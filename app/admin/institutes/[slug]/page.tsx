"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/src/hooks/use-toast'
import { Save, RefreshCw, Trash2, Plus } from 'lucide-react'

function StringList({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (next: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...(values||[]), ''])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
      </div>
      <div className="space-y-2">
        {(values||[]).map((v, idx) => (
          <div className="flex gap-2" key={idx}>
            <Input value={v} placeholder={placeholder} onChange={(e)=> {
              const next = [...values]
              next[idx] = e.target.value
              onChange(next)
            }} />
            <Button type="button" variant="destructive" size="icon" onClick={()=> {
              const next = [...values]
              next.splice(idx,1)
              onChange(next)
            }}><Trash2 className="w-4 h-4"/></Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminInstituteDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = useMemo(()=> decodeURIComponent(String(params?.slug||'')), [params])
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state mirrors AdminInstitute fields
  const [form, setForm] = useState<any>({})
  // JSON import dialog state
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonBusy, setJsonBusy] = useState(false)
  const [jsonText, setJsonText] = useState('')

  useEffect(() => {
    async function load() {
      try {
        if (!slug) return
        setLoading(true)
        const res = await fetch(`/api/admin/institutes/${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setForm(data)
      } catch (e: any) {
        toast({ title: 'Failed to load', description: e.message, variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function setPath(path: string[], value: any) {
    setForm((prev: any) => {
      const next = { ...prev }
      let cur: any = next
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]
        cur[key] = cur[key] ?? {}
        cur = cur[key]
      }
      cur[path[path.length - 1]] = value
      return next
    })
  }

  function getPath(path: string[], fallback: any = ''): any {
    let cur: any = form
    for (const key of path) {
      cur = cur?.[key]
      if (cur === undefined) return fallback
    }
    return cur ?? fallback
  }

  async function onSave() {
    try {
      if (!form?.slug) {
        toast({ title: 'Missing slug', description: 'Institute slug is required', variant: 'destructive' })
        return
      }
      setSaving(true)
      const res = await fetch(`/api/admin/institutes/${encodeURIComponent(form.slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Saved' })
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Import JSON into current form (merge)
  async function onImportSubmit() {
    try {
      setJsonBusy(true)
      const parsed = JSON.parse(jsonText || '{}')
      setForm((prev: any) => ({ ...prev, ...(parsed || {}) }))
      toast({ title: 'Imported JSON into form' })
      setJsonOpen(false)
      setJsonText('')
    } catch (e: any) {
      toast({ title: 'Import failed', description: e?.message || String(e), variant: 'destructive' })
    } finally {
      setJsonBusy(false)
    }
  }

  if (!form) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Institute: {form?.name || slug}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={()=> router.refresh()} disabled={loading}><RefreshCw className="w-4 h-4 mr-2"/>Refresh</Button>
          <Button onClick={onSave} disabled={saving}><Save className="w-4 h-4 mr-2"/>Save</Button>
        </div>
      </div>

      {/* Core details */}
      <Card>
        <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>ID</Label><Input value={form?.id || ''} onChange={(e)=> setPath(['id'], e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Name</Label><Input value={form?.name || ''} onChange={(e)=> setPath(['name'], e.target.value)} /></div>
          <div><Label>Short Name</Label><Input value={form?.shortName || ''} onChange={(e)=> setPath(['shortName'], e.target.value)} /></div>
          <div><Label>Slug</Label><Input value={form?.slug || ''} onChange={(e)=> setPath(['slug'], e.target.value)} /></div>
          <div><Label>Established Year</Label><Input value={form?.establishedYear ?? ''} onChange={(e)=> setPath(['establishedYear'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Type</Label><Input value={form?.type || ''} onChange={(e)=> setPath(['type'], e.target.value)} /></div>
          <div><Label>Status</Label><Input value={form?.status || ''} onChange={(e)=> setPath(['status'], e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Logo URL</Label><Input value={form?.logo || ''} onChange={(e)=> setPath(['logo'], e.target.value)} /></div>
          <div className="md:col-span-3"><Label>Cover Image URL</Label><Input value={form?.coverImage || ''} onChange={(e)=> setPath(['coverImage'], e.target.value)} /></div>
          <div className="md:col-span-3"><Label>Website</Label><Input value={form?.website || ''} onChange={(e)=> setPath(['website'], e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Accreditation */}
      <Card>
        <CardHeader><CardTitle>Accreditation</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><Label>NAAC Grade</Label><Input value={getPath(['accreditation','naac','grade'],'')} onChange={(e)=> setPath(['accreditation','naac','grade'], e.target.value)} /></div>
            <div><Label>NAAC Category</Label><Input value={getPath(['accreditation','naac','category'],'')} onChange={(e)=> setPath(['accreditation','naac','category'], e.target.value)} /></div>
            <div><Label>NAAC CGPA</Label><Input value={getPath(['accreditation','naac','cgpa'],'')} onChange={(e)=> setPath(['accreditation','naac','cgpa'], e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div><Label>NAAC Cycle</Label><Input value={getPath(['accreditation','naac','cycleNumber'],'')} onChange={(e)=> setPath(['accreditation','naac','cycleNumber'], e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div className="md:col-span-2"><Label>NAAC Valid Until</Label><Input value={getPath(['accreditation','naac','validUntil'],'')} onChange={(e)=> setPath(['accreditation','naac','validUntil'], e.target.value)} /></div>
            <div className="md:col-span-4"><Label>UGC Recognition</Label><Input value={getPath(['accreditation','ugc','recognition'],'')} onChange={(e)=> setPath(['accreditation','ugc','recognition'], e.target.value)} /></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>NIRF Rankings (key-value pairs)</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['accreditation','nirf'], { ...(getPath(['accreditation','nirf'], {}) as any), '': '' })}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-2">
              {Object.entries(getPath(['accreditation','nirf'], {} as Record<string,string>)).map(([k, v]: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2" key={`${k}-${idx}`}>
                  <div><Label>Category</Label><Input value={k} onChange={(e)=> {
                    const obj: any = { ...(getPath(['accreditation','nirf'], {}) as any) }; const val = obj[k]; delete obj[k]; obj[e.target.value] = val; setPath(['accreditation','nirf'], obj)
                  }} placeholder="Pharmacy, Innovation, University..."/></div>
                  <div><Label>Rank/Value</Label><Input value={v} onChange={(e)=> {
                    const obj: any = { ...(getPath(['accreditation','nirf'], {}) as any) }; obj[k] = e.target.value; setPath(['accreditation','nirf'], obj)
                  }} placeholder="41, 11-50..."/></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                    const obj: any = { ...(getPath(['accreditation','nirf'], {}) as any) }; delete obj[k]; setPath(['accreditation','nirf'], obj)
                  }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Contact */}
      <Card>
        <CardHeader><CardTitle>Location & Contact</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><Label>Address</Label><Input value={getPath(['location','address'],'')} onChange={(e)=> setPath(['location','address'], e.target.value)} /></div>
          <div><Label>City</Label><Input value={getPath(['location','city'],'')} onChange={(e)=> setPath(['location','city'], e.target.value)} /></div>
          <div><Label>State</Label><Input value={getPath(['location','state'],'')} onChange={(e)=> setPath(['location','state'], e.target.value)} /></div>
          <div><Label>Pincode</Label><Input value={getPath(['location','pincode'],'')} onChange={(e)=> setPath(['location','pincode'], e.target.value)} /></div>
          <div><Label>Country</Label><Input value={getPath(['location','country'],'')} onChange={(e)=> setPath(['location','country'], e.target.value)} /></div>
          <div><Label>Latitude</Label><Input value={getPath(['location','coordinates','latitude'],'')} onChange={(e)=> setPath(['location','coordinates','latitude'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Longitude</Label><Input value={getPath(['location','coordinates','longitude'],'')} onChange={(e)=> setPath(['location','coordinates','longitude'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div className="md:col-span-3"><StringList label="Nearby Landmarks" values={getPath(['location','nearbyLandmarks'], [])} onChange={(v)=> setPath(['location','nearbyLandmarks'], v)} placeholder="Landmark"/></div>
          <div className="md:col-span-3"><StringList label="Phones" values={getPath(['contact','phone'], [])} onChange={(v)=> setPath(['contact','phone'], v)} placeholder="Phone"/></div>
          <div><Label>Contact Email</Label><Input value={getPath(['contact','email'],'')} onChange={(e)=> setPath(['contact','email'], e.target.value)} /></div>
          <div><Label>Contact Website</Label><Input value={getPath(['contact','website'],'')} onChange={(e)=> setPath(['contact','website'], e.target.value)} /></div>
          <div><Label>Admissions Email</Label><Input value={getPath(['contact','admissionsEmail'],'')} onChange={(e)=> setPath(['contact','admissionsEmail'], e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader><CardTitle>Overview (Key-Value Pairs)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Overview Items</Label>
            <Button type="button" variant="secondary" size="sm" onClick={() => setPath(['overview'], [...(getPath(['overview'], []) as any[]), { key: '', value: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-3">
            {(getPath(['overview'], []) as any[]).map((item: any, idx: number) => (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                <div className="md:col-span-2"><Label>Key</Label><Input value={item.key||''} onChange={(e)=> {
                  const arr = [...(getPath(['overview'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['overview'], arr)
                }} placeholder="Establishment year, Campus size..."/></div>
                <div className="md:col-span-2"><Label>Value</Label><Input value={item.value||''} onChange={(e)=> {
                  const arr = [...(getPath(['overview'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['overview'], arr)
                }} /></div>
                <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                  const arr = [...(getPath(['overview'], []) as any[])]; arr.splice(idx,1); setPath(['overview'], arr)
                }}><Trash2 className="w-4 h-4"/></Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campus Details */}
      <Card>
        <CardHeader><CardTitle>Campus Details</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Campus Type</Label><Input value={getPath(['campusDetails','campusType'],'')} onChange={(e)=> setPath(['campusDetails','campusType'], e.target.value)} /></div>
            <div><Label>Environment</Label><Input value={getPath(['campusDetails','environment'],'')} onChange={(e)=> setPath(['campusDetails','environment'], e.target.value)} /></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Facilities (key-value pairs)</Label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPath(['campusDetails','facilities'], [...(getPath(['campusDetails','facilities'], []) as any[]), { key: '', value: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {(getPath(['campusDetails','facilities'], []) as any[]).map((facility: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                  <div className="md:col-span-2"><Label>Facility Name</Label><Input value={facility.key||''} onChange={(e)=> {
                    const arr = [...(getPath(['campusDetails','facilities'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['campusDetails','facilities'], arr)
                  }} placeholder="Library, Gym, Hostel..."/></div>
                  <div className="md:col-span-2"><Label>Description</Label><Input value={facility.value||''} onChange={(e)=> {
                    const arr = [...(getPath(['campusDetails','facilities'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['campusDetails','facilities'], arr)
                  }} placeholder="Optional description"/></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                    const arr = [...(getPath(['campusDetails','facilities'], []) as any[])]; arr.splice(idx,1); setPath(['campusDetails','facilities'], arr)
                  }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <StringList label="Facilities Array (Simple List)" values={getPath(['campusDetails','facilities_arr'], [])} onChange={(v)=> setPath(['campusDetails','facilities_arr'], v)} placeholder="Library, Gym, Hostel..."/>
          </div>
        </CardContent>
      </Card>

      {/* Academics */}
      <Card>
        <CardHeader><CardTitle>Academics</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div><Label>Total Students</Label><Input value={getPath(['academics','totalStudents'],'')} onChange={(e)=> setPath(['academics','totalStudents'], e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div><Label>Total Faculty</Label><Input value={getPath(['academics','totalFaculty'],'')} onChange={(e)=> setPath(['academics','totalFaculty'], e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div><Label>Student:Faculty Ratio</Label><Input value={getPath(['academics','studentFacultyRatio'],'')} onChange={(e)=> setPath(['academics','studentFacultyRatio'], e.target.value)} placeholder="15:1"/></div>
            <div><Label>International Students</Label><Input value={getPath(['academics','internationalStudents'],'')} onChange={(e)=> setPath(['academics','internationalStudents'], e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div><Label>Total Programs</Label><Input value={getPath(['academics','totalPrograms'],'')} onChange={(e)=> setPath(['academics','totalPrograms'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Schools</Label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPath(['academics','schools'], [...(getPath(['academics','schools'], []) as any[]), { name: '', established: undefined, programs: [] }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {(getPath(['academics','schools'], []) as any[]).map((s: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2" key={idx}>
                  <div className="md:col-span-2"><Label>Name</Label><Input value={s.name||''} onChange={(e)=> {
                    const arr = [...(getPath(['academics','schools'], []) as any[])]; arr[idx] = { ...arr[idx], name: e.target.value }; setPath(['academics','schools'], arr)
                  }} /></div>
                  <div><Label>Established</Label><Input value={s.established||''} onChange={(e)=> {
                    const arr = [...(getPath(['academics','schools'], []) as any[])]; arr[idx] = { ...arr[idx], established: e.target.value }; setPath(['academics','schools'], arr)
                  }} /></div>
                  <div className="md:col-span-2"><Label>Programs (comma separated)</Label><Input value={(s.programs||[]).join(', ')} onChange={(e)=> {
                    const arr = [...(getPath(['academics','schools'], []) as any[])]; arr[idx] = { ...arr[idx], programs: e.target.value.split(',').map((x:string)=> x.trim()).filter(Boolean) }; setPath(['academics','schools'], arr)
                  }} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                    const arr = [...(getPath(['academics','schools'], []) as any[])]; arr.splice(idx,1); setPath(['academics','schools'], arr)
                  }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Program Overviews (key-value pairs)</Label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPath(['academics','programOverviews'], [...(getPath(['academics','programOverviews'], []) as any[]), { key: '', value: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {(getPath(['academics','programOverviews'], []) as any[]).map((item: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                  <div className="md:col-span-2"><Label>Key</Label><Input value={item.key||''} onChange={(e)=> {
                    const arr = [...(getPath(['academics','programOverviews'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['academics','programOverviews'], arr)
                  }} placeholder="UG Programs, PG Programs..."/></div>
                  <div className="md:col-span-2"><Label>Value</Label><Input value={item.value||''} onChange={(e)=> {
                    const arr = [...(getPath(['academics','programOverviews'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['academics','programOverviews'], arr)
                  }} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                    const arr = [...(getPath(['academics','programOverviews'], []) as any[])]; arr.splice(idx,1); setPath(['academics','programOverviews'], arr)
                  }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty/Student Ratio */}
      <Card>
        <CardHeader><CardTitle>Faculty & Student Data</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Faculty Details (key-value pairs)</Label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPath(['faculty_student_ratio','faculties'], [...(getPath(['faculty_student_ratio','faculties'], []) as any[]), { key: '', value: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {(getPath(['faculty_student_ratio','faculties'], []) as any[]).map((item: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                  <div className="md:col-span-2"><Label>Key</Label><Input value={item.key||''} onChange={(e)=> {
                    const arr = [...(getPath(['faculty_student_ratio','faculties'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['faculty_student_ratio','faculties'], arr)
                  }} placeholder="Total Faculties, PhD holders..."/></div>
                  <div className="md:col-span-2"><Label>Value</Label><Input value={item.value||''} onChange={(e)=> {
                    const arr = [...(getPath(['faculty_student_ratio','faculties'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['faculty_student_ratio','faculties'], arr)
                  }} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                    const arr = [...(getPath(['faculty_student_ratio','faculties'], []) as any[])]; arr.splice(idx,1); setPath(['faculty_student_ratio','faculties'], arr)
                  }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Student Admission Reports</Label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPath(['faculty_student_ratio','students'], [...(getPath(['faculty_student_ratio','students'], []) as any[]), { title: '', data: [] }])}><Plus className="w-4 h-4 mr-1"/>Add Section</Button>
            </div>
            <div className="space-y-4">
              {(getPath(['faculty_student_ratio','students'], []) as any[]).map((section: any, sectionIdx: number) => (
                <div className="border rounded p-4 space-y-3" key={sectionIdx}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><Label>Section Title</Label><Input value={section.title||''} onChange={(e)=> {
                      const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; arr[sectionIdx] = { ...arr[sectionIdx], title: e.target.value }; setPath(['faculty_student_ratio','students'], arr)
                    }} placeholder="UG - 4 years student admission"/></div>
                    <div className="flex items-end"><Button type="button" variant="destructive" size="sm" onClick={()=> {
                      const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; arr.splice(sectionIdx,1); setPath(['faculty_student_ratio','students'], arr)
                    }}><Trash2 className="w-4 h-4 mr-1"/>Remove Section</Button></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Data Items</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...(arr[sectionIdx].data||[])]; data.push({ key: '', value: '' }); arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                      }}><Plus className="w-3 h-3 mr-1"/>Add Item</Button>
                    </div>
                    {(section.data||[]).map((item: any, itemIdx: number) => (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={itemIdx}>
                        <div className="md:col-span-2"><Label>Key</Label><Input value={item.key||''} onChange={(e)=> {
                          const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...arr[sectionIdx].data]; data[itemIdx] = { ...data[itemIdx], key: e.target.value }; arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                        }} placeholder="Total students"/></div>
                        <div className="md:col-span-2"><Label>Value</Label><Input value={item.value||''} onChange={(e)=> {
                          const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...arr[sectionIdx].data]; data[itemIdx] = { ...data[itemIdx], value: e.target.value }; arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                        }} /></div>
                        <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                          const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...arr[sectionIdx].data]; data.splice(itemIdx,1); arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                        }}><Trash2 className="w-4 h-4"/></Button></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admissions & Placements */}
      <Card>
        <CardHeader><CardTitle>Admissions & Placements</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div><Label>Application Fee</Label><Input value={getPath(['admissions','applicationFee'],'')} onChange={(e)=> setPath(['admissions','applicationFee'], e.target.value)} placeholder="1000 INR or any format"/></div>
          <StringList label="Admission Process Steps" values={getPath(['admissions','admissionProcess'], [])} onChange={(v)=> setPath(['admissions','admissionProcess'], v)} placeholder="Step"/>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Reservation Policy (key-value)</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['admissions','reservationPolicy'], { ...(getPath(['admissions','reservationPolicy'], {}) as any), '': '' })}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-2">
              {Object.entries(getPath(['admissions','reservationPolicy'], {} as Record<string,string>)).map(([k, v]: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2" key={`${k}-${idx}`}>
                  <div><Label>Key</Label><Input value={k} onChange={(e)=> {
                    const obj: any = { ...(getPath(['admissions','reservationPolicy'], {}) as any) }; const val = obj[k]; delete obj[k]; obj[e.target.value] = val; setPath(['admissions','reservationPolicy'], obj)
                  }} placeholder="sc, st, obc..."/></div>
                  <div><Label>Value</Label><Input value={v} onChange={(e)=> {
                    const obj: any = { ...(getPath(['admissions','reservationPolicy'], {}) as any) }; obj[k] = e.target.value; setPath(['admissions','reservationPolicy'], obj)
                  }} placeholder="15%"/></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                    const obj: any = { ...(getPath(['admissions','reservationPolicy'], {}) as any) }; delete obj[k]; setPath(['admissions','reservationPolicy'], obj)
                  }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>

          <StringList label="Top Recruiters" values={getPath(['placements','topRecruiters'], [])} onChange={(v)=> setPath(['placements','topRecruiters'], v)} placeholder="Company"/>
          <StringList label="Sectors" values={getPath(['placements','sectors'], [])} onChange={(v)=> setPath(['placements','sectors'], v)} placeholder="IT & Software - 40%"/>
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card>
        <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div><Label>Rankings Title</Label><Input value={getPath(['rankings','title'],'')} onChange={(e)=> setPath(['rankings','title'], e.target.value)} /></div>
          <div><Label>Rankings Description</Label><Input value={getPath(['rankings','description'],'')} onChange={(e)=> setPath(['rankings','description'], e.target.value)} /></div>
          <div><Label>Rankings Detail Description</Label><Input value={getPath(['rankings','rankingsDescription'],'')} onChange={(e)=> setPath(['rankings','rankingsDescription'], e.target.value)} /></div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>National Rankings</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['rankings','national','national'], [...(getPath(['rankings','national','national'], []) as any[]), { agency: '', category: '', rank: '', year: new Date().getFullYear() }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {(getPath(['rankings','national','national'], []) as any[]).filter(r => r !== null && r !== undefined).map((r: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                  <div><Label>Agency</Label><Input value={r?.agency||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], agency: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                  <div><Label>Category</Label><Input value={r?.category||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], category: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                  <div><Label>Rank</Label><Input value={r?.rank||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], rank: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                  <div><Label>Year</Label><Input value={r?.year||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], year: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr.splice(idx,1); setPath(['rankings','national','national'], arr) }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Publisher Rankings</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['rankings','data'], [...(getPath(['rankings','data'], []) as any[]), { publisherName: '', publisherLogo: '', entityName: '', rankData: [] }])}><Plus className="w-4 h-4 mr-1"/>Add Publisher</Button>
            </div>
            <div className="space-y-4">
              {(getPath(['rankings','data'], []) as any[]).map((publisher: any, pubIdx: number) => (
                <div className="border rounded p-4 space-y-3" key={pubIdx}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div><Label>Publisher Name</Label><Input value={publisher.publisherName||''} onChange={(e)=> {
                      const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], publisherName: e.target.value }; setPath(['rankings','data'], arr)
                    }} placeholder="NIRF, Outlook..."/></div>
                    <div><Label>Publisher Logo URL</Label><Input value={publisher.publisherLogo||''} onChange={(e)=> {
                      const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], publisherLogo: e.target.value }; setPath(['rankings','data'], arr)
                    }} /></div>
                    <div><Label>Entity Name</Label><Input value={publisher.entityName||''} onChange={(e)=> {
                      const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], entityName: e.target.value }; setPath(['rankings','data'], arr)
                    }} placeholder="Pharmacy, BCA..."/></div>
                    <div className="flex items-end"><Button type="button" variant="destructive" size="sm" onClick={()=> {
                      const arr = [...(getPath(['rankings','data'], []) as any[])]; arr.splice(pubIdx,1); setPath(['rankings','data'], arr)
                    }}><Trash2 className="w-4 h-4 mr-1"/>Remove</Button></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Year-wise Ranks</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...(arr[pubIdx].rankData||[])]; rankData.push({ year: new Date().getFullYear(), rank: '' }); arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                      }}><Plus className="w-3 h-3 mr-1"/>Add Year</Button>
                    </div>
                    {(publisher.rankData||[]).map((rd: any, rdIdx: number) => (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2" key={rdIdx}>
                        <div><Label>Year</Label><Input value={rd.year||''} onChange={(e)=> {
                          const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData[rdIdx] = { ...rankData[rdIdx], year: e.target.value ? Number(e.target.value) : new Date().getFullYear() }; arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                        }} /></div>
                        <div><Label>Rank</Label><Input value={rd.rank||''} onChange={(e)=> {
                          const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData[rdIdx] = { ...rankData[rdIdx], rank: e.target.value }; arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                        }} /></div>
                        <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                          const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData.splice(rdIdx,1); arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                        }}><Trash2 className="w-4 h-4"/></Button></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research & Alumni */}
      <Card>
        <CardHeader><CardTitle>Research & Alumni</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><Label>Research Centers</Label><Input value={getPath(['researchAndInnovation','researchCenters'],'')} onChange={(e)=> setPath(['researchAndInnovation','researchCenters'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Patents Filed</Label><Input value={getPath(['researchAndInnovation','patentsFiled'],'')} onChange={(e)=> setPath(['researchAndInnovation','patentsFiled'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Publications / Year</Label><Input value={getPath(['researchAndInnovation','publicationsPerYear'],'')} onChange={(e)=> setPath(['researchAndInnovation','publicationsPerYear'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Research Funding</Label><Input value={getPath(['researchAndInnovation','researchFunding'],'')} onChange={(e)=> setPath(['researchAndInnovation','researchFunding'], e.target.value)} /></div>
          <div><Label>PhD Scholars</Label><Input value={getPath(['researchAndInnovation','phdScholars'],'')} onChange={(e)=> setPath(['researchAndInnovation','phdScholars'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Incubation Name</Label><Input value={getPath(['researchAndInnovation','incubationCenter','name'],'')} onChange={(e)=> setPath(['researchAndInnovation','incubationCenter','name'], e.target.value)} /></div>
          <div><Label>Startups Funded</Label><Input value={getPath(['researchAndInnovation','incubationCenter','startupsFunded'],'')} onChange={(e)=> setPath(['researchAndInnovation','incubationCenter','startupsFunded'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Total Funding</Label><Input value={getPath(['researchAndInnovation','incubationCenter','totalFunding'],'')} onChange={(e)=> setPath(['researchAndInnovation','incubationCenter','totalFunding'], e.target.value)} /></div>
          <div className="md:col-span-4"><StringList label="Collaborations" values={getPath(['researchAndInnovation','collaborations'], [])} onChange={(v)=> setPath(['researchAndInnovation','collaborations'], v)} placeholder="Partner"/></div>
        </CardContent>
      </Card>

      {/* Awards & Media */}
      <Card>
        <CardHeader><CardTitle>Awards & Media</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <StringList label="Awards (titles)" values={getPath(['awards'], [])} onChange={(v)=> setPath(['awards'], v)} placeholder="Award title"/>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Photo Categories</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['mediaGallery','photos'], { ...(getPath(['mediaGallery','photos'], {}) as any), '': [] })}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            {Object.entries(getPath(['mediaGallery','photos'], {} as Record<string,string[]>)).map(([category, urls]: any, idx: number) => (
              <div className="space-y-2" key={`${category}-${idx}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div><Label>Category</Label><Input value={category} onChange={(e)=> {
                    const obj:any = { ...(getPath(['mediaGallery','photos'], {}) as any) }; const val = obj[category]; delete obj[category]; obj[e.target.value] = val; setPath(['mediaGallery','photos'], obj)
                  }} /></div>
                  <div className="md:col-span-2"><StringList label="URLs" values={urls} onChange={(v)=> { const obj:any = { ...(getPath(['mediaGallery','photos'], {}) as any) }; obj[category] = v; setPath(['mediaGallery','photos'], obj) }} placeholder="https://..."/></div>
                </div>
                <div>
                  <Button type="button" variant="destructive" size="sm" onClick={()=> { const obj:any = { ...(getPath(['mediaGallery','photos'], {}) as any) }; delete obj[category]; setPath(['mediaGallery','photos'], obj) }}><Trash2 className="w-4 h-4 mr-1"/>Remove Category</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Videos</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['mediaGallery','videos'], [...(getPath(['mediaGallery','videos'], []) as any[]), { url: '', title: '', thumbnail: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {(getPath(['mediaGallery','videos'], []) as any[]).map((v: any, idx: number) => (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2" key={idx}>
                  <div><Label>URL</Label><Input value={v.url||''} onChange={(e)=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr[idx] = { ...arr[idx], url: e.target.value }; setPath(['mediaGallery','videos'], arr) }} /></div>
                  <div><Label>Title</Label><Input value={v.title||''} onChange={(e)=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr[idx] = { ...arr[idx], title: e.target.value }; setPath(['mediaGallery','videos'], arr) }} /></div>
                  <div><Label>Thumbnail</Label><Input value={v.thumbnail||''} onChange={(e)=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr[idx] = { ...arr[idx], thumbnail: e.target.value }; setPath(['mediaGallery','videos'], arr) }} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr.splice(idx,1); setPath(['mediaGallery','videos'], arr) }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programmes */}
      <Card>
        <CardHeader><CardTitle>Programmes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Programme List</Label>
            <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['programmes'], [...(getPath(['programmes'], []) as any[]), { id: '', name: '', courseCount: 0, placementRating: 0, eligibilityExams: [], course: [] }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-6">
            {(getPath(['programmes'], []) as any[]).map((prog: any, progIdx: number) => (
              <div className="space-y-4 border rounded-md p-4" key={progIdx}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div><Label>Programme ID</Label><Input value={prog.id||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], id: e.target.value }; setPath(['programmes'], arr) }} /></div>
                  <div><Label>Programme Name</Label><Input value={prog.name||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], name: e.target.value }; setPath(['programmes'], arr) }} /></div>
                  <div><Label>Course Count</Label><Input value={prog.courseCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], courseCount: e.target.value ? Number(e.target.value) : 0 }; setPath(['programmes'], arr) }} /></div>
                  <div><Label>Placement Rating</Label><Input value={prog.placementRating??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], placementRating: e.target.value ? Number(e.target.value) : 0 }; setPath(['programmes'], arr) }} /></div>
                </div>
                
                <div className="space-y-2">
                  <StringList label="Eligibility Exams" values={prog.eligibilityExams||[]} onChange={(v)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], eligibilityExams: v }; setPath(['programmes'], arr) }} placeholder="GMAT, CAT, XAT"/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Courses in Programme</Label>
                    <Button type="button" variant="secondary" size="sm" onClick={()=> {
                      const arr=[...(getPath(['programmes'], []) as any[])]; 
                      const courses = [...(arr[progIdx].course||[])]; 
                      courses.push({ id: '', name: '', degree: '', school: '', duration: '', level: '', category: '', totalSeats: 0, fees: { tuitionFee: 0, totalFee: 0, currency: 'INR' }, brochure: { url: '', year: new Date().getFullYear() }, seoUrl: '', affiliatedUniversity: '', location: { state: '', city: '' }, educationType: '', deliveryMethod: '', courseLevel: '', eligibilityExams: [], placements: { averagePackage: 0, highestPackage: 0, placementRate: 0, topRecruiters: [] } }); 
                      arr[progIdx] = { ...arr[progIdx], course: courses }; 
                      setPath(['programmes'], arr)
                    }}><Plus className="w-4 h-4 mr-1"/>Add Course</Button>
                  </div>
                  <div className="space-y-4">
                    {(prog.course||[]).map((course: any, courseIdx: number) => (
                      <div className="space-y-3 border rounded-md p-4 bg-gray-50" key={courseIdx}>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                          <div><Label>Course ID</Label><Input value={course.id||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], id: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div className="md:col-span-2"><Label>Course Name</Label><Input value={course.name||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], name: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Degree</Label><Input value={course.degree||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], degree: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>School</Label><Input value={course.school||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], school: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Duration</Label><Input value={course.duration||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], duration: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                          <div><Label>Level</Label><Input value={course.level||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], level: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Category</Label><Input value={course.category||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], category: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Total Seats</Label><Input value={course.totalSeats??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], totalSeats: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Review Count</Label><Input value={course.reviewCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], reviewCount: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Questions Count</Label><Input value={course.questionsCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], questionsCount: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>SEO URL</Label><Input value={course.seoUrl||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], seoUrl: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Tuition Fee</Label><Input value={course.fees?.tuitionFee??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.tuitionFee = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Total Fee</Label><Input value={course.fees?.totalFee??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.totalFee = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Currency</Label><Input value={course.fees?.currency||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.currency = e.target.value; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Affiliated University</Label><Input value={course.affiliatedUniversity||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], affiliatedUniversity: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Brochure URL</Label><Input value={course.brochure?.url||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const brochure = { ...(courses[courseIdx].brochure||{}) }; brochure.url = e.target.value; courses[courseIdx] = { ...courses[courseIdx], brochure }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Brochure Year</Label><Input value={course.brochure?.year??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const brochure = { ...(courses[courseIdx].brochure||{}) }; brochure.year = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], brochure }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Education Type</Label><Input value={course.educationType||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], educationType: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Delivery Method</Label><Input value={course.deliveryMethod||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], deliveryMethod: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Course Level</Label><Input value={course.courseLevel||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], courseLevel: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>State</Label><Input value={course.location?.state||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const location = { ...(courses[courseIdx].location||{}) }; location.state = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>City</Label><Input value={course.location?.city||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const location = { ...(courses[courseIdx].location||{}) }; location.city = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Locality</Label><Input value={course.location?.locality||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const location = { ...(courses[courseIdx].location||{}) }; location.locality = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Avg Package</Label><Input value={course.placements?.averagePackage??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.averagePackage = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Highest Package</Label><Input value={course.placements?.highestPackage??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.highestPackage = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div><Label>Placement Rate</Label><Input value={course.placements?.placementRate??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.placementRate = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                          <div className="flex items-end"><Button type="button" variant="destructive" size="sm" onClick={()=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses.splice(courseIdx,1); arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }}><Trash2 className="w-4 h-4 mr-1"/>Remove</Button></div>
                        </div>
                        <div className="md:col-span-4">
                          <StringList label="Recognition" values={course.recognition||[]} onChange={(v)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], recognition: v }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} placeholder="INC, AICTE"/>
                        </div>
                        <div className="md:col-span-4">
                          <StringList label="Eligibility Exams" values={course.eligibilityExams||[]} onChange={(v)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], eligibilityExams: v }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} placeholder="GMAT, CAT"/>
                        </div>
                        <div className="md:col-span-4">
                          <StringList label="Top Recruiters" values={course.placements?.topRecruiters||[]} onChange={(v)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.topRecruiters = v; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} placeholder="Company Name"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="button" variant="destructive" size="sm" onClick={()=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr.splice(progIdx,1); setPath(['programmes'], arr) }}><Trash2 className="w-4 h-4 mr-1"/>Remove Programme</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
