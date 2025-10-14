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
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><Label>NAAC Grade</Label><Input value={getPath(['accreditation','naac','grade'],'')} onChange={(e)=> setPath(['accreditation','naac','grade'], e.target.value)} /></div>
          <div><Label>NAAC Category</Label><Input value={getPath(['accreditation','naac','category'],'')} onChange={(e)=> setPath(['accreditation','naac','category'], e.target.value)} /></div>
          <div><Label>NAAC CGPA</Label><Input value={getPath(['accreditation','naac','cgpa'],'')} onChange={(e)=> setPath(['accreditation','naac','cgpa'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>NAAC Cycle</Label><Input value={getPath(['accreditation','naac','cycleNumber'],'')} onChange={(e)=> setPath(['accreditation','naac','cycleNumber'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div className="md:col-span-2"><Label>NAAC Valid Until</Label><Input value={getPath(['accreditation','naac','validUntil'],'')} onChange={(e)=> setPath(['accreditation','naac','validUntil'], e.target.value)} /></div>
          <div><Label>NIRF Overall Rank</Label><Input value={getPath(['accreditation','nirf','overallRank'],'')} onChange={(e)=> setPath(['accreditation','nirf','overallRank'], e.target.value)} /></div>
          <div><Label>NIRF University Rank</Label><Input value={getPath(['accreditation','nirf','universityRank'],'')} onChange={(e)=> setPath(['accreditation','nirf','universityRank'], e.target.value)} /></div>
          <div><Label>NIRF Management Rank</Label><Input value={getPath(['accreditation','nirf','managementRank'],'')} onChange={(e)=> setPath(['accreditation','nirf','managementRank'], e.target.value)} /></div>
          <div><Label>NIRF Year</Label><Input value={getPath(['accreditation','nirf','year'],'')} onChange={(e)=> setPath(['accreditation','nirf','year'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div className="md:col-span-4"><Label>UGC Recognition</Label><Input value={getPath(['accreditation','ugc','recognition'],'')} onChange={(e)=> setPath(['accreditation','ugc','recognition'], e.target.value)} /></div>
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
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><Label>Description</Label><Input value={getPath(['overview','description'],'')} onChange={(e)=> setPath(['overview','description'], e.target.value)} /></div>
          <div><Label>Vision</Label><Input value={getPath(['overview','vision'],'')} onChange={(e)=> setPath(['overview','vision'], e.target.value)} /></div>
          <div><Label>Mission</Label><Input value={getPath(['overview','mission'],'')} onChange={(e)=> setPath(['overview','mission'], e.target.value)} /></div>
          <div><Label>Motto</Label><Input value={getPath(['overview','motto'],'')} onChange={(e)=> setPath(['overview','motto'], e.target.value)} /></div>
          <div><Label>Founder</Label><Input value={getPath(['overview','founder'],'')} onChange={(e)=> setPath(['overview','founder'], e.target.value)} /></div>
          <div><Label>Chancellor</Label><Input value={getPath(['overview','chancellor'],'')} onChange={(e)=> setPath(['overview','chancellor'], e.target.value)} /></div>
          <div><Label>Vice Chancellor</Label><Input value={getPath(['overview','viceChancellor'],'')} onChange={(e)=> setPath(['overview','viceChancellor'], e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Campus Details */}
      <Card>
        <CardHeader><CardTitle>Campus Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Campus Type</Label><Input value={getPath(['campusDetails','campusType'],'')} onChange={(e)=> setPath(['campusDetails','campusType'], e.target.value)} /></div>
          <div><Label>Environment</Label><Input value={getPath(['campusDetails','environment'],'')} onChange={(e)=> setPath(['campusDetails','environment'], e.target.value)} /></div>
          <div className="md:col-span-3"><StringList label="Academic Facilities" values={getPath(['campusDetails','facilities','academic'], [])} onChange={(v)=> setPath(['campusDetails','facilities','academic'], v)} placeholder="Library, Labs, ..."/></div>
          <div className="md:col-span-3"><StringList label="Residential Facilities" values={getPath(['campusDetails','facilities','residential'], [])} onChange={(v)=> setPath(['campusDetails','facilities','residential'], v)} placeholder="Hostel, Mess, ..."/></div>
          <div className="md:col-span-3"><StringList label="Recreational Facilities" values={getPath(['campusDetails','facilities','recreational'], [])} onChange={(v)=> setPath(['campusDetails','facilities','recreational'], v)} placeholder="Sports, Gym, ..."/></div>
          <div className="md:col-span-3"><StringList label="Support Facilities" values={getPath(['campusDetails','facilities','support'], [])} onChange={(v)=> setPath(['campusDetails','facilities','support'], v)} placeholder="Wi-Fi, Bank, ..."/></div>
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
        </CardContent>
      </Card>

      {/* Admissions & Placements */}
      <Card>
        <CardHeader><CardTitle>Admissions & Placements</CardTitle></CardHeader>
        <CardContent className="space-y-6">
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
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>National Rankings</Label>
            <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['rankings','national'], [...(getPath(['rankings','national'], []) as any[]), { agency: '', category: '', rank: '', year: new Date().getFullYear() }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-3">
            {(getPath(['rankings','national'], []) as any[]).map((r: any, idx: number) => (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                <div><Label>Agency</Label><Input value={r.agency||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national'], []) as any[])]; arr[idx] = { ...arr[idx], agency: e.target.value }; setPath(['rankings','national'], arr) }} /></div>
                <div><Label>Category</Label><Input value={r.category||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national'], []) as any[])]; arr[idx] = { ...arr[idx], category: e.target.value }; setPath(['rankings','national'], arr) }} /></div>
                <div><Label>Rank</Label><Input value={r.rank||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national'], []) as any[])]; arr[idx] = { ...arr[idx], rank: e.target.value }; setPath(['rankings','national'], arr) }} /></div>
                <div><Label>Year</Label><Input value={r.year||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national'], []) as any[])]; arr[idx] = { ...arr[idx], year: e.target.value }; setPath(['rankings','national'], arr) }} /></div>
                <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> { const arr=[...(getPath(['rankings','national'], []) as any[])]; arr.splice(idx,1); setPath(['rankings','national'], arr) }}><Trash2 className="w-4 h-4"/></Button></div>
              </div>
            ))}
          </div>
          <div>
            <Label>Rankings Description</Label>
            <Input value={getPath(['rankings','rankingsDescription'],'')} onChange={(e)=> setPath(['rankings','rankingsDescription'], e.target.value)} />
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

      {/* Programmes (new structure) */}
      <Card>
        <CardHeader><CardTitle>Programmes (New Structure)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Programme List</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPath(['programmes'], [...(getPath(['programmes'], []) as any[]), { name: '', eligibilityExams: [], course: [] }])}
            >
              <Plus className="w-4 h-4 mr-1"/>Add Programme
            </Button>
          </div>
          <div className="space-y-4">
            {(getPath(['programmes'], []) as any[]).map((p: any, pIdx: number) => (
              <div key={pIdx} className="space-y-3 border rounded-md p-3">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div><Label>ID</Label><Input value={p.id||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[pIdx] = { ...arr[pIdx], id: e.target.value }; setPath(['programmes'], arr) }} /></div>
                  <div className="md:col-span-2"><Label>Name</Label><Input value={p.name||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[pIdx] = { ...arr[pIdx], name: e.target.value }; setPath(['programmes'], arr) }} /></div>
                  <div><Label>Course Count</Label><Input value={p.courseCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[pIdx] = { ...arr[pIdx], courseCount: e.target.value }; setPath(['programmes'], arr) }} /></div>
                  <div><Label>Placement Rating</Label><Input value={p.placementRating??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[pIdx] = { ...arr[pIdx], placementRating: e.target.value }; setPath(['programmes'], arr) }} /></div>
                  <div className="md:col-span-2">
                    <StringList label="Eligibility Exams" values={p.eligibilityExams||[]} onChange={(v)=> {
                      const arr=[...(getPath(['programmes'], []) as any[])];
                      arr[pIdx] = { ...arr[pIdx], eligibilityExams: v };
                      setPath(['programmes'], arr)
                    }} placeholder="CAT"/>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Programme Courses</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={()=> {
                      const arr=[...(getPath(['programmes'], []) as any[])];
                      const cur = { ...(arr[pIdx]||{}) };
                      const list = [...(cur.course||[])];
                      list.push({ name: '', recognition: [], eligibilityExams: [], placementRecruiters: [] });
                      cur.course = list; arr[pIdx] = cur; setPath(['programmes'], arr)
                    }}><Plus className="w-4 h-4 mr-1"/>Add Course</Button>
                    <Button type="button" variant="destructive" size="sm" onClick={()=> {
                      const arr=[...(getPath(['programmes'], []) as any[])];
                      arr.splice(pIdx,1); setPath(['programmes'], arr)
                    }}><Trash2 className="w-4 h-4 mr-1"/>Remove Programme</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {(p.course||[]).map((c: any, cIdx: number) => (
                    <div key={cIdx} className="space-y-2 border rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <div><Label>ID</Label><Input value={c.id||''} onChange={(e)=> {
                          const arr=[...(getPath(['programmes'], []) as any[])];
                          const cur = { ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], id: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr)
                        }} /></div>
                        <div className="md:col-span-2"><Label>Name</Label><Input value={c.name||''} onChange={(e)=> {
                          const arr=[...(getPath(['programmes'], []) as any[])];
                          const cur = { ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], name: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr)
                        }} /></div>
                        <div><Label>Degree</Label><Input value={c.degree||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], degree: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>School</Label><Input value={c.school||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], school: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Duration</Label><Input value={c.duration||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], duration: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Level</Label><Input value={c.level||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], level: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Category</Label><Input value={c.category||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], category: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Total Seats</Label><Input value={c.totalSeats??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], totalSeats: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Review Count</Label><Input value={c.reviewCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], reviewCount: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Questions Count</Label><Input value={c.questionsCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], questionsCount: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Tuition Fee</Label><Input value={c.tuitionFee??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], tuitionFee: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Total Fee</Label><Input value={c.totalFee??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], totalFee: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Currency</Label><Input value={c.currency||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], currency: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div className="md:col-span-2"><Label>Brochure URL</Label><Input value={c.brochureUrl||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], brochureUrl: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Brochure Year</Label><Input value={c.brochureYear??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], brochureYear: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div className="md:col-span-2"><Label>SEO URL</Label><Input value={c.seoUrl||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], seoUrl: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>State</Label><Input value={c.state||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], state: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>City</Label><Input value={c.city||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], city: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Locality</Label><Input value={c.locality||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], locality: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Education Type</Label><Input value={c.educationType||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], educationType: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Delivery Method</Label><Input value={c.deliveryMethod||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], deliveryMethod: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Course Level</Label><Input value={c.courseLevel||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], courseLevel: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div className="md:col-span-2"><Label>Affiliated University</Label><Input value={c.affiliatedUniversity||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], affiliatedUniversity: e.target.value }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div className="md:col-span-3"><StringList label="Recognition" values={c.recognition||[]} onChange={(v)=> {
                          const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], recognition: v }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr)
                        }} placeholder="INC"/></div>
                        <div className="md:col-span-3"><StringList label="Eligibility Exams" values={c.eligibilityExams||[]} onChange={(v)=> {
                          const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list[cIdx] = { ...list[cIdx], eligibilityExams: v }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr)
                        }} placeholder="CAT"/></div>
                        <div><Label>Average Package</Label><Input value={c.avgPackage??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; const plc={ ...(list[cIdx].placements||{}) }; plc.averagePackage = e.target.value; list[cIdx] = { ...list[cIdx], avgPackage: e.target.value, placements: plc }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Highest Package</Label><Input value={c.highestPackage??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; const plc={ ...(list[cIdx].placements||{}) }; plc.highestPackage = e.target.value; list[cIdx] = { ...list[cIdx], highestPackage: e.target.value, placements: plc }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div><Label>Placement Rate</Label><Input value={c.placementRate??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; const plc={ ...(list[cIdx].placements||{}) }; plc.placementRate = e.target.value; list[cIdx] = { ...list[cIdx], placementRate: e.target.value, placements: plc }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr) }} /></div>
                        <div className="md:col-span-3"><StringList label="Placement Recruiters" values={c.placementRecruiters||[]} onChange={(v)=> {
                          const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; const plc={ ...(list[cIdx].placements||{}) }; plc.topRecruiters = v; list[cIdx] = { ...list[cIdx], placementRecruiters: v, placements: plc }; cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr)
                        }} placeholder="Company"/></div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={()=> {
                          const arr=[...(getPath(['programmes'], []) as any[])]; const cur={ ...(arr[pIdx]||{}) }; const list=[...(cur.course||[])]; list.splice(cIdx,1); cur.course=list; arr[pIdx]=cur; setPath(['programmes'], arr)
                        }}><Trash2 className="w-4 h-4 mr-1"/>Remove Course</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      <Card>
        <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Course List</Label>
            <Button type="button" variant="secondary" size="sm" onClick={()=> setPath(['courses'], [...(getPath(['courses'], []) as any[]), { id: '', name: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-4">
            {(getPath(['courses'], []) as any[]).map((c: any, idx: number) => (
              <div className="space-y-2 border rounded-md p-3" key={idx}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div><Label>ID</Label><Input value={c.id||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], id: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div className="md:col-span-2"><Label>Name</Label><Input value={c.name||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], name: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Degree</Label><Input value={c.degree||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], degree: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>School</Label><Input value={c.school||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], school: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Duration</Label><Input value={c.duration||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], duration: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Level</Label><Input value={c.level||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], level: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Category</Label><Input value={c.category||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], category: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Total Seats</Label><Input value={c.totalSeats??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], totalSeats: e.target.value ? Number(e.target.value) : undefined }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Review Count</Label><Input value={c.reviewCount??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], reviewCount: e.target.value ? Number(e.target.value) : undefined }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Questions Count</Label><Input value={c.questionsCount??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], questionsCount: e.target.value ? Number(e.target.value) : undefined }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Tuition Fee</Label><Input value={c.fees?.tuitionFee??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const fees = { ...(arr[idx].fees||{}) }; fees.tuitionFee = e.target.value ? Number(e.target.value) : undefined; arr[idx] = { ...arr[idx], fees }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Total Fee</Label><Input value={c.fees?.totalFee??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const fees = { ...(arr[idx].fees||{}) }; fees.totalFee = e.target.value ? Number(e.target.value) : undefined; arr[idx] = { ...arr[idx], fees }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Currency</Label><Input value={c.fees?.currency||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const fees = { ...(arr[idx].fees||{}) }; fees.currency = e.target.value; arr[idx] = { ...arr[idx], fees }; setPath(['courses'], arr) }} /></div>
                  <div className="md:col-span-2"><Label>Brochure URL</Label><Input value={c.brochure?.url||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const brochure = { ...(arr[idx].brochure||{}) }; brochure.url = e.target.value; arr[idx] = { ...arr[idx], brochure }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Brochure Year</Label><Input value={c.brochure?.year??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const brochure = { ...(arr[idx].brochure||{}) }; brochure.year = e.target.value ? Number(e.target.value) : undefined; arr[idx] = { ...arr[idx], brochure }; setPath(['courses'], arr) }} /></div>
                  <div className="md:col-span-2"><Label>SEO URL</Label><Input value={c.seoUrl||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], seoUrl: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>State</Label><Input value={c.location?.state||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const location = { ...(arr[idx].location||{}) }; location.state = e.target.value; arr[idx] = { ...arr[idx], location }; setPath(['courses'], arr) }} /></div>
                  <div><Label>City</Label><Input value={c.location?.city||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const location = { ...(arr[idx].location||{}) }; location.city = e.target.value; arr[idx] = { ...arr[idx], location }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Locality</Label><Input value={c.location?.locality||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const location = { ...(arr[idx].location||{}) }; location.locality = e.target.value; arr[idx] = { ...arr[idx], location }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Education Type</Label><Input value={c.educationType||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], educationType: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Delivery Method</Label><Input value={c.deliveryMethod||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], deliveryMethod: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Course Level</Label><Input value={c.courseLevel||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], courseLevel: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div className="md:col-span-2"><Label>Affiliated University</Label><Input value={c.affiliatedUniversity||''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], affiliatedUniversity: e.target.value }; setPath(['courses'], arr) }} /></div>
                  <div className="md:col-span-3"><StringList label="Recognition" values={c.recognition||[]} onChange={(v)=> { const arr=[...(getPath(['courses'], []) as any[])]; arr[idx] = { ...arr[idx], recognition: v }; setPath(['courses'], arr) }} placeholder="INC"/></div>
                  <div><Label>Average Package</Label><Input value={c.placements?.averagePackage??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const placements={ ...(arr[idx].placements||{}) }; placements.averagePackage = e.target.value ? Number(e.target.value) : undefined; arr[idx] = { ...arr[idx], placements }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Highest Package</Label><Input value={c.placements?.highestPackage??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const placements={ ...(arr[idx].placements||{}) }; placements.highestPackage = e.target.value ? Number(e.target.value) : undefined; arr[idx] = { ...arr[idx], placements }; setPath(['courses'], arr) }} /></div>
                  <div><Label>Placement Rate</Label><Input value={c.placements?.placementRate??''} onChange={(e)=> { const arr=[...(getPath(['courses'], []) as any[])]; const placements={ ...(arr[idx].placements||{}) }; placements.placementRate = e.target.value ? Number(e.target.value) : undefined; arr[idx] = { ...arr[idx], placements }; setPath(['courses'], arr) }} /></div>
                  <div className="md:col-span-3"><StringList label="Top Recruiters" values={c.placements?.topRecruiters||[]} onChange={(v)=> { const arr=[...(getPath(['courses'], []) as any[])]; const placements={ ...(arr[idx].placements||{}) }; placements.topRecruiters = v; arr[idx] = { ...arr[idx], placements }; setPath(['courses'], arr) }} placeholder="Company"/></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> { const arr=[...(getPath(['courses'], []) as any[])]; arr.splice(idx,1); setPath(['courses'], arr) }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
