"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useToast } from '@/src/hooks/use-toast';
import { Save, RefreshCw, Trash2, Plus } from 'lucide-react';

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

export default function InstituteProfilePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  function setPath(path: string[], value: any) {
    setProfile((prev: any) => {
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
    let cur: any = profile
    for (const key of path) {
      cur = cur?.[key]
      if (cur === undefined) return fallback
    }
    return cur ?? fallback
  }

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/institute/profile');
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setProfile(data);
    } catch (e: any) {
      toast({ title: 'Failed to load profile', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function onSave() {
    try {
      if (!profile?.id) {
        toast({ title: 'Missing ID', description: 'Institute ID is missing', variant: 'destructive' });
        return;
      }
      setIsSaving(true);
      const res = await fetch(`/api/institute/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Saved' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Institute Profile: {profile?.name}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchProfile} disabled={isLoading}><RefreshCw className="w-4 h-4 mr-2"/>Refresh</Button>
          <Button onClick={onSave} disabled={isSaving}><Save className="w-4 h-4 mr-2"/>Save</Button>
        </div>
      </div>

      {/* Core details */}
      <Card>
        <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>ID</Label><Input value={profile?.id || ''} readOnly disabled /></div>
          <div className="md:col-span-2"><Label>Name</Label><Input value={profile?.name || ''} onChange={(e)=> setPath(['name'], e.target.value)} /></div>
          <div><Label>Short Name</Label><Input value={profile?.shortName || ''} onChange={(e)=> setPath(['shortName'], e.target.value)} /></div>
          <div><Label>Slug</Label><Input value={profile?.slug || ''} onChange={(e)=> setPath(['slug'], e.target.value)} /></div>
          <div><Label>Established Year</Label><Input value={profile?.establishedYear ?? ''} onChange={(e)=> setPath(['establishedYear'], e.target.value ? Number(e.target.value) : undefined)} /></div>
          <div><Label>Type</Label><Input value={profile?.type || ''} onChange={(e)=> setPath(['type'], e.target.value)} /></div>
          <div><Label>Status</Label><Input value={profile?.status || ''} onChange={(e)=> setPath(['status'], e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Logo URL</Label><Input value={profile?.logo || ''} onChange={(e)=> setPath(['logo'], e.target.value)} /></div>
          <div className="md:col-span-3"><Label>Cover Image URL</Label><Input value={profile?.coverImage || ''} onChange={(e)=> setPath(['coverImage'], e.target.value)} /></div>
          <div className="md:col-span-3"><Label>Website</Label><Input value={profile?.website || ''} onChange={(e)=> setPath(['website'], e.target.value)} /></div>
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
                    <div className="md:col-span-2"><Label>Publisher Logo URL</Label><Input value={publisher.publisherLogo||''} onChange={(e)=> {
                      const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], publisherLogo: e.target.value }; setPath(['rankings','data'], arr)
                    }} /></div>
                    <div className="flex items-end"><Button type="button" variant="destructive" size="sm" onClick={()=> { const arr = [...(getPath(['rankings','data'], []) as any[])]; arr.splice(pubIdx,1); setPath(['rankings','data'], arr) }}><Trash2 className="w-4 h-4 mr-1"/>Remove Publisher</Button></div>
                  </div>
                  <div><Label>Entity Name</Label><Input value={publisher.entityName||''} onChange={(e)=> {
                    const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], entityName: e.target.value }; setPath(['rankings','data'], arr)
                  }} placeholder="Overall, Engineering..."/></div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Rank Data</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...(publisher.rankData||[])]; rankData.push({ year: new Date().getFullYear(), rank: '' }); arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                      }}><Plus className="w-3 h-3 mr-1"/>Add Rank</Button>
                    </div>
                    {(publisher.rankData||[]).map((item: any, itemIdx: number) => (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2" key={itemIdx}>
                        <div><Label>Year</Label><Input value={item.year||''} onChange={(e)=> {
                          const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData[itemIdx] = { ...rankData[itemIdx], year: e.target.value }; arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                        }} /></div>
                        <div><Label>Rank</Label><Input value={item.rank||''} onChange={(e)=> {
                          const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData[itemIdx] = { ...rankData[itemIdx], rank: e.target.value }; arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                        }} /></div>
                        <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> {
                          const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData.splice(itemIdx,1); arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
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
    </div>
  );
}
