"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { redirect, useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/src/hooks/use-toast';
import { Save, RefreshCw, Trash2, Plus, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'core';
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
        cur[key] = cur[key] ? { ...cur[key] } : {}
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
    <div className="space-y-6 min-h-screen">
        {/* Header with Title and Actions - Sticky */}
        <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-6 -mx-6 mb-6 flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-slate-200 transition-all duration-200">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Institute Profile</h1>
                <p className="hidden md:block text-sm text-gray-500 mt-1">Manage your institute's public profile and information</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchProfile} disabled={isLoading} className="bg-white border-slate-200 text-gray-600">
                    <RefreshCw className={cn("h-4 w-4 md:mr-2", isLoading && "animate-spin")}/>
                    <span className="hidden md:inline">Refresh</span>
                </Button>
                <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4"/>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>

        <div className="space-y-6">
            {/* Core Details */}
            {activeTab === 'core' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Core Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><Label className="text-sm font-medium text-gray-700">ID</Label><Input className="mt-1.5 h-10 rounded-lg bg-gray-50 border-slate-200" value={profile?.id || ''} readOnly disabled /></div>
                    <div className="md:col-span-2"><Label className="text-sm font-medium text-gray-700">Name</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.name || ''} onChange={(e)=> setPath(['name'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Short Name</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.shortName || ''} onChange={(e)=> setPath(['shortName'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Slug</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.slug || ''} onChange={(e)=> setPath(['slug'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Established Year</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.establishedYear ?? ''} onChange={(e)=> setPath(['establishedYear'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Type</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.type || ''} onChange={(e)=> setPath(['type'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Status</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.status || ''} onChange={(e)=> setPath(['status'], e.target.value)} /></div>
                    <div className="md:col-span-2"><Label className="text-sm font-medium text-gray-700">Logo URL</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.logo || ''} onChange={(e)=> setPath(['logo'], e.target.value)} /></div>
                    <div className="md:col-span-3"><Label className="text-sm font-medium text-gray-700">Cover Image URL</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.coverImage || ''} onChange={(e)=> setPath(['coverImage'], e.target.value)} /></div>
                    <div className="md:col-span-3"><Label className="text-sm font-medium text-gray-700">Website</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={profile?.website || ''} onChange={(e)=> setPath(['website'], e.target.value)} /></div>
                    </CardContent>
                </Card>
            )}

            {/* Accreditation */}
            {activeTab === 'accreditation' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Accreditation</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div><Label className="text-sm font-medium text-gray-700">NAAC Grade</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['accreditation','naac','grade'],'')} onChange={(e)=> setPath(['accreditation','naac','grade'], e.target.value)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">NAAC Category</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['accreditation','naac','category'],'')} onChange={(e)=> setPath(['accreditation','naac','category'], e.target.value)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">NAAC CGPA</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['accreditation','naac','cgpa'],'')} onChange={(e)=> setPath(['accreditation','naac','cgpa'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">NAAC Cycle</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['accreditation','naac','cycleNumber'],'')} onChange={(e)=> setPath(['accreditation','naac','cycleNumber'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                        <div className="md:col-span-2"><Label className="text-sm font-medium text-gray-700">NAAC Valid Until</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['accreditation','naac','validUntil'],'')} onChange={(e)=> setPath(['accreditation','naac','validUntil'], e.target.value)} /></div>
                        <div className="md:col-span-4"><Label className="text-sm font-medium text-gray-700">UGC Recognition</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['accreditation','ugc','recognition'],'')} onChange={(e)=> setPath(['accreditation','ugc','recognition'], e.target.value)} /></div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">NIRF Rankings (key-value pairs)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['accreditation','nirf'], { ...(getPath(['accreditation','nirf'], {}) as any), '': '' })} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {Object.entries(getPath(['accreditation','nirf'], {} as Record<string,string>)).map(([k, v]: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" key={`${k}-${idx}`}>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Category</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={k} onChange={(e)=> {
                                const obj: any = { ...(getPath(['accreditation','nirf'], {}) as any) }; const val = obj[k]; delete obj[k]; obj[e.target.value] = val; setPath(['accreditation','nirf'], obj)
                            }} placeholder="Pharmacy, Innovation, University..."/></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Rank/Value</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={v} onChange={(e)=> {
                                const obj: any = { ...(getPath(['accreditation','nirf'], {}) as any) }; obj[k] = e.target.value; setPath(['accreditation','nirf'], obj)
                            }} placeholder="41, 11-50..."/></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                const obj: any = { ...(getPath(['accreditation','nirf'], {}) as any) }; delete obj[k]; setPath(['accreditation','nirf'], obj)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Location & Contact */}
            {activeTab === 'location' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Location & Contact</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3"><Label className="text-sm font-medium text-gray-700">Address</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','address'],'')} onChange={(e)=> setPath(['location','address'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">City</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','city'],'')} onChange={(e)=> setPath(['location','city'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">State</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','state'],'')} onChange={(e)=> setPath(['location','state'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Pincode</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','pincode'],'')} onChange={(e)=> setPath(['location','pincode'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Country</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','country'],'')} onChange={(e)=> setPath(['location','country'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Latitude</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','coordinates','latitude'],'')} onChange={(e)=> setPath(['location','coordinates','latitude'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Longitude</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['location','coordinates','longitude'],'')} onChange={(e)=> setPath(['location','coordinates','longitude'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div className="md:col-span-3"><StringList label="Nearby Landmarks" values={getPath(['location','nearbyLandmarks'], [])} onChange={(v)=> setPath(['location','nearbyLandmarks'], v)} placeholder="Landmark"/></div>
                    <div className="md:col-span-3"><StringList label="Phones" values={getPath(['contact','phone'], [])} onChange={(v)=> setPath(['contact','phone'], v)} placeholder="Phone"/></div>
                    <div><Label className="text-sm font-medium text-gray-700">Contact Email</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['contact','email'],'')} onChange={(e)=> setPath(['contact','email'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Contact Website</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['contact','website'],'')} onChange={(e)=> setPath(['contact','website'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Admissions Email</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['contact','admissionsEmail'],'')} onChange={(e)=> setPath(['contact','admissionsEmail'], e.target.value)} /></div>
                    </CardContent>
                </Card>
            )}

            {/* Overview */}
            {activeTab === 'overview' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Overview (Key-Value Pairs)</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Overview Items</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPath(['overview'], [...(getPath(['overview'], []) as any[]), { key: '', value: '' }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                    </div>
                    <div className="space-y-3">
                        {(getPath(['overview'], []) as any[]).map((item: any, idx: number) => (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3" key={idx}>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Key</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.key||''} onChange={(e)=> {
                            const arr = [...(getPath(['overview'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['overview'], arr)
                            }} placeholder="Establishment year, Campus size..."/></div>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Value</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.value||''} onChange={(e)=> {
                            const arr = [...(getPath(['overview'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['overview'], arr)
                            }} /></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                            const arr = [...(getPath(['overview'], []) as any[])]; arr.splice(idx,1); setPath(['overview'], arr)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Campus Details */}
            {activeTab === 'campus' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Campus Details</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label className="text-sm font-medium text-gray-700">Campus Type</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['campusDetails','campusType'],'')} onChange={(e)=> setPath(['campusDetails','campusType'], e.target.value)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">Environment</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['campusDetails','environment'],'')} onChange={(e)=> setPath(['campusDetails','environment'], e.target.value)} /></div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Facilities (key-value pairs)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPath(['campusDetails','facilities'], [...(getPath(['campusDetails','facilities'], []) as any[]), { key: '', value: '' }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {(getPath(['campusDetails','facilities'], []) as any[]).map((facility: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3" key={idx}>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Facility Name</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={facility.key||''} onChange={(e)=> {
                                const arr = [...(getPath(['campusDetails','facilities'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['campusDetails','facilities'], arr)
                            }} placeholder="Library, Gym, Hostel..."/></div>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Description</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={facility.value||''} onChange={(e)=> {
                                const arr = [...(getPath(['campusDetails','facilities'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['campusDetails','facilities'], arr)
                            }} placeholder="Optional description"/></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                const arr = [...(getPath(['campusDetails','facilities'], []) as any[])]; arr.splice(idx,1); setPath(['campusDetails','facilities'], arr)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>
                    
                    <div>
                        <StringList label="Facilities Array (Simple List)" values={getPath(['campusDetails','facilities_arr'], [])} onChange={(v)=> setPath(['campusDetails','facilities_arr'], v)} placeholder="Library, Gym, Hostel..."/>
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Academics */}
            {activeTab === 'academics' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Academics</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div><Label className="text-sm font-medium text-gray-700">Total Students</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['academics','totalStudents'],'')} onChange={(e)=> setPath(['academics','totalStudents'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">Total Faculty</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['academics','totalFaculty'],'')} onChange={(e)=> setPath(['academics','totalFaculty'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">Student:Faculty Ratio</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['academics','studentFacultyRatio'],'')} onChange={(e)=> setPath(['academics','studentFacultyRatio'], e.target.value)} placeholder="15:1"/></div>
                        <div><Label className="text-sm font-medium text-gray-700">International Students</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['academics','internationalStudents'],'')} onChange={(e)=> setPath(['academics','internationalStudents'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                        <div><Label className="text-sm font-medium text-gray-700">Total Programs</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['academics','totalPrograms'],'')} onChange={(e)=> setPath(['academics','totalPrograms'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Schools</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPath(['academics','schools'], [...(getPath(['academics','schools'], []) as any[]), { name: '', established: undefined, programs: [] }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {(getPath(['academics','schools'], []) as any[]).map((s: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3" key={idx}>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Name</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={s.name||''} onChange={(e)=> {
                                const arr = [...(getPath(['academics','schools'], []) as any[])]; arr[idx] = { ...arr[idx], name: e.target.value }; setPath(['academics','schools'], arr)
                            }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Established</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={s.established||''} onChange={(e)=> {
                                const arr = [...(getPath(['academics','schools'], []) as any[])]; arr[idx] = { ...arr[idx], established: e.target.value }; setPath(['academics','schools'], arr)
                            }} /></div>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Programs (comma separated)</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={(s.programs||[]).join(', ')} onChange={(e)=> {
                                const arr = [...(getPath(['academics','schools'], []) as any[])]; arr[idx] = { ...arr[idx], programs: e.target.value.split(',').map((x:string)=> x.trim()).filter(Boolean) }; setPath(['academics','schools'], arr)
                            }} /></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                const arr = [...(getPath(['academics','schools'], []) as any[])]; arr.splice(idx,1); setPath(['academics','schools'], arr)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Program Overviews (key-value pairs)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPath(['academics','programOverviews'], [...(getPath(['academics','programOverviews'], []) as any[]), { key: '', value: '' }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {(getPath(['academics','programOverviews'], []) as any[]).map((item: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3" key={idx}>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Key</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.key||''} onChange={(e)=> {
                                const arr = [...(getPath(['academics','programOverviews'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['academics','programOverviews'], arr)
                            }} placeholder="UG Programs, PG Programs..."/></div>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Value</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.value||''} onChange={(e)=> {
                                const arr = [...(getPath(['academics','programOverviews'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['academics','programOverviews'], arr)
                            }} /></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                const arr = [...(getPath(['academics','programOverviews'], []) as any[])]; arr.splice(idx,1); setPath(['academics','programOverviews'], arr)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Faculty & Student Data */}
            {activeTab === 'faculty' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Faculty & Student Data</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Faculty Details (key-value pairs)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPath(['faculty_student_ratio','faculties'], [...(getPath(['faculty_student_ratio','faculties'], []) as any[]), { key: '', value: '' }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {(getPath(['faculty_student_ratio','faculties'], []) as any[]).map((item: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3" key={idx}>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Key</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.key||''} onChange={(e)=> {
                                const arr = [...(getPath(['faculty_student_ratio','faculties'], []) as any[])]; arr[idx] = { ...arr[idx], key: e.target.value }; setPath(['faculty_student_ratio','faculties'], arr)
                            }} placeholder="Total Faculties, PhD holders..."/></div>
                            <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Value</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.value||''} onChange={(e)=> {
                                const arr = [...(getPath(['faculty_student_ratio','faculties'], []) as any[])]; arr[idx] = { ...arr[idx], value: e.target.value }; setPath(['faculty_student_ratio','faculties'], arr)
                            }} /></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                const arr = [...(getPath(['faculty_student_ratio','faculties'], []) as any[])]; arr.splice(idx,1); setPath(['faculty_student_ratio','faculties'], arr)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Student Admission Reports</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPath(['faculty_student_ratio','students'], [...(getPath(['faculty_student_ratio','students'], []) as any[]), { title: '', data: [] }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add Section</Button>
                        </div>
                        <div className="space-y-4">
                        {(getPath(['faculty_student_ratio','students'], []) as any[]).map((section: any, sectionIdx: number) => (
                            <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-gray-50/50" key={sectionIdx}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><Label className="text-sm font-medium text-gray-700">Section Title</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={section.title||''} onChange={(e)=> {
                                const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; arr[sectionIdx] = { ...arr[sectionIdx], title: e.target.value }; setPath(['faculty_student_ratio','students'], arr)
                                }} placeholder="UG - 4 years student admission"/></div>
                                <div className="flex items-end"><Button type="button" variant="ghost" size="sm" onClick={()=> {
                                const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; arr.splice(sectionIdx,1); setPath(['faculty_student_ratio','students'], arr)
                                }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1"/>Remove Section</Button></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">Data Items</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                    const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...(arr[sectionIdx].data||[])]; data.push({ key: '', value: '' }); arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                                }} className="bg-white border-slate-200 text-gray-600 text-xs"><Plus className="w-3 h-3 mr-1"/>Add Item</Button>
                                </div>
                                {(section.data||[]).map((item: any, itemIdx: number) => (
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3" key={itemIdx}>
                                    <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Key</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.key||''} onChange={(e)=> {
                                    const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...arr[sectionIdx].data]; data[itemIdx] = { ...data[itemIdx], key: e.target.value }; arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                                    }} placeholder="Total students"/></div>
                                    <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Value</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={item.value||''} onChange={(e)=> {
                                    const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...arr[sectionIdx].data]; data[itemIdx] = { ...data[itemIdx], value: e.target.value }; arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                                    }} /></div>
                                    <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                    const arr = [...(getPath(['faculty_student_ratio','students'], []) as any[])]; const data = [...arr[sectionIdx].data]; data.splice(itemIdx,1); arr[sectionIdx] = { ...arr[sectionIdx], data }; setPath(['faculty_student_ratio','students'], arr)
                                    }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                                </div>
                                ))}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Admissions & Placements */}
            {activeTab === 'admissions' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Admissions & Placements</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div><Label className="text-sm font-medium text-gray-700">Application Fee</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['admissions','applicationFee'],'')} onChange={(e)=> setPath(['admissions','applicationFee'], e.target.value)} placeholder="1000 INR or any format"/></div>
                    <StringList label="Admission Process Steps" values={getPath(['admissions','admissionProcess'], [])} onChange={(v)=> setPath(['admissions','admissionProcess'], v)} placeholder="Step"/>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Reservation Policy (key-value)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['admissions','reservationPolicy'], { ...(getPath(['admissions','reservationPolicy'], {}) as any), '': '' })} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {Object.entries(getPath(['admissions','reservationPolicy'], {} as Record<string,string>)).map(([k, v]: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" key={`${k}-${idx}`}>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Key</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={k} onChange={(e)=> {
                                const obj: any = { ...(getPath(['admissions','reservationPolicy'], {}) as any) }; const val = obj[k]; delete obj[k]; obj[e.target.value] = val; setPath(['admissions','reservationPolicy'], obj)
                            }} placeholder="sc, st, obc..."/></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Value</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={v} onChange={(e)=> {
                                const obj: any = { ...(getPath(['admissions','reservationPolicy'], {}) as any) }; obj[k] = e.target.value; setPath(['admissions','reservationPolicy'], obj)
                            }} placeholder="15%"/></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                const obj: any = { ...(getPath(['admissions','reservationPolicy'], {}) as any) }; delete obj[k]; setPath(['admissions','reservationPolicy'], obj)
                            }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <StringList label="Top Recruiters" values={getPath(['placements','topRecruiters'], [])} onChange={(v)=> setPath(['placements','topRecruiters'], v)} placeholder="Company"/>
                    <StringList label="Sectors" values={getPath(['placements','sectors'], [])} onChange={(v)=> setPath(['placements','sectors'], v)} placeholder="IT & Software - 40%"/>
                    </CardContent>
                </Card>
            )}

            {/* Rankings */}
            {activeTab === 'rankings' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Rankings</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div><Label className="text-sm font-medium text-gray-700">Rankings Title</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['rankings','title'],'')} onChange={(e)=> setPath(['rankings','title'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Rankings Description</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['rankings','description'],'')} onChange={(e)=> setPath(['rankings','description'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Rankings Detail Description</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['rankings','rankingsDescription'],'')} onChange={(e)=> setPath(['rankings','rankingsDescription'], e.target.value)} /></div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">National Rankings</Label>
                        <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['rankings','national','national'], [...(getPath(['rankings','national','national'], []) as any[]), { agency: '', category: '', rank: '', year: new Date().getFullYear() }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                        </div>
                        <div className="space-y-3">
                        {(getPath(['rankings','national','national'], []) as any[]).filter(r => r !== null && r !== undefined).map((r: any, idx: number) => (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3" key={idx}>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Agency</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={r?.agency||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], agency: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Category</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={r?.category||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], category: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Rank</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={r?.rank||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], rank: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Year</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={r?.year||''} onChange={(e)=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr[idx] = { ...arr[idx], year: e.target.value }; setPath(['rankings','national','national'], arr) }} /></div>
                            <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> { const arr=[...(getPath(['rankings','national','national'], []) as any[])]; arr.splice(idx,1); setPath(['rankings','national','national'], arr) }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Publisher Rankings</Label>
                        <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['rankings','data'], [...(getPath(['rankings','data'], []) as any[]), { publisherName: '', publisherLogo: '', entityName: '', rankData: [] }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add Publisher</Button>
                        </div>
                        <div className="space-y-4">
                        {(getPath(['rankings','data'], []) as any[]).map((publisher: any, pubIdx: number) => (
                            <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-gray-50/50" key={pubIdx}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div><Label className="text-sm font-medium text-gray-700">Publisher Name</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={publisher.publisherName||''} onChange={(e)=> {
                                const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], publisherName: e.target.value }; setPath(['rankings','data'], arr)
                                }} placeholder="NIRF, Outlook..."/></div>
                                <div><Label className="text-sm font-medium text-gray-700">Publisher Logo URL</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={publisher.publisherLogo||''} onChange={(e)=> {
                                const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], publisherLogo: e.target.value }; setPath(['rankings','data'], arr)
                                }} /></div>
                                <div><Label className="text-sm font-medium text-gray-700">Entity Name</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={publisher.entityName||''} onChange={(e)=> {
                                const arr = [...(getPath(['rankings','data'], []) as any[])]; arr[pubIdx] = { ...arr[pubIdx], entityName: e.target.value }; setPath(['rankings','data'], arr)
                                }} placeholder="Pharmacy, BCA..."/></div>
                                <div className="flex items-end"><Button type="button" variant="ghost" size="sm" onClick={()=> {
                                const arr = [...(getPath(['rankings','data'], []) as any[])]; arr.splice(pubIdx,1); setPath(['rankings','data'], arr)
                                }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1"/>Remove</Button></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">Year-wise Ranks</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                    const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...(publisher.rankData||[])]; rankData.push({ year: new Date().getFullYear(), rank: '' }); arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                                }} className="bg-white border-slate-200 text-gray-600 text-xs"><Plus className="w-3 h-3 mr-1"/>Add Year</Button>
                                </div>
                                {(publisher.rankData||[]).map((rd: any, rdIdx: number) => (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3" key={rdIdx}>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Year</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={rd.year||''} onChange={(e)=> {
                                    const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData[rdIdx] = { ...rankData[rdIdx], year: e.target.value ? Number(e.target.value) : new Date().getFullYear() }; arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                                    }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Rank</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={rd.rank||''} onChange={(e)=> {
                                    const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData[rdIdx] = { ...rankData[rdIdx], rank: e.target.value }; arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                                    }} /></div>
                                    <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> {
                                    const arr = [...(getPath(['rankings','data'], []) as any[])]; const rankData = [...arr[pubIdx].rankData]; rankData.splice(rdIdx,1); arr[pubIdx] = { ...arr[pubIdx], rankData }; setPath(['rankings','data'], arr)
                                    }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                                </div>
                                ))}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Research & Alumni */}
            {activeTab === 'research' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Research & Alumni</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div><Label className="text-sm font-medium text-gray-700">Research Centers</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','researchCenters'],'')} onChange={(e)=> setPath(['researchAndInnovation','researchCenters'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Patents Filed</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','patentsFiled'],'')} onChange={(e)=> setPath(['researchAndInnovation','patentsFiled'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Research Funding</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','researchFunding'],'')} onChange={(e)=> setPath(['researchAndInnovation','researchFunding'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">PhD Scholars</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','phdScholars'],'')} onChange={(e)=> setPath(['researchAndInnovation','phdScholars'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Incubation Name</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','incubationCenter','name'],'')} onChange={(e)=> setPath(['researchAndInnovation','incubationCenter','name'], e.target.value)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Startups Funded</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','incubationCenter','startupsFunded'],'')} onChange={(e)=> setPath(['researchAndInnovation','incubationCenter','startupsFunded'], e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><Label className="text-sm font-medium text-gray-700">Total Funding</Label><Input className="mt-1.5 h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={getPath(['researchAndInnovation','incubationCenter','totalFunding'],'')} onChange={(e)=> setPath(['researchAndInnovation','incubationCenter','totalFunding'], e.target.value)} /></div>
                    <div className="md:col-span-4"><StringList label="Collaborations" values={getPath(['researchAndInnovation','collaborations'], [])} onChange={(v)=> setPath(['researchAndInnovation','collaborations'], v)} placeholder="Partner"/></div>
                    </CardContent>
                </Card>
            )}

            {/* Awards & Media */}
        {activeTab === 'awards' && (
            <Card className="rounded-2xl border shadow-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Awards & Media</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                <StringList label="Awards (titles)" values={getPath(['awards'], [])} onChange={(v)=> setPath(['awards'], v)} placeholder="Award title"/>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">Photo Categories</Label>
                    <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['mediaGallery','photos'], { ...(getPath(['mediaGallery','photos'], {}) as any), '': [] })} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                    </div>
                    {Object.entries(getPath(['mediaGallery','photos'], {} as Record<string,string[]>)).map(([category, urls]: any, idx: number) => (
                    <div className="space-y-3 border p-4 rounded-xl" key={`${category}-${idx}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label className="text-xs text-gray-500 mb-1 block">Category Name</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={category} onChange={(e)=> {
                            const obj:any = { ...(getPath(['mediaGallery','photos'], {}) as any) }; const val = obj[category]; delete obj[category]; obj[e.target.value] = val; setPath(['mediaGallery','photos'], obj)
                        }} /></div>
                        <div className="md:col-span-2"><StringList label="Photo URLs" values={urls} onChange={(v)=> { const obj:any = { ...(getPath(['mediaGallery','photos'], {}) as any) }; obj[category] = v; setPath(['mediaGallery','photos'], obj) }} placeholder="https://..."/></div>
                        </div>
                        <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={()=> { const obj:any = { ...(getPath(['mediaGallery','photos'], {}) as any) }; delete obj[category]; setPath(['mediaGallery','photos'], obj) }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1"/>Remove Category</Button>
                        </div>
                    </div>
                    ))}
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">Videos</Label>
                    <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['mediaGallery','videos'], [...(getPath(['mediaGallery','videos'], []) as any[]), { url: '', title: '', thumbnail: '' }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                    </div>
                    <div className="space-y-3">
                    {(getPath(['mediaGallery','videos'], []) as any[]).map((v: any, idx: number) => (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3" key={idx}>
                        <div><Label className="text-xs text-gray-500 mb-1 block">URL</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={v.url||''} onChange={(e)=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr[idx] = { ...arr[idx], url: e.target.value }; setPath(['mediaGallery','videos'], arr) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">Title</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={v.title||''} onChange={(e)=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr[idx] = { ...arr[idx], title: e.target.value }; setPath(['mediaGallery','videos'], arr) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">Thumbnail</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={v.thumbnail||''} onChange={(e)=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr[idx] = { ...arr[idx], thumbnail: e.target.value }; setPath(['mediaGallery','videos'], arr) }} /></div>
                        <div className="flex items-end"><Button type="button" variant="ghost" size="icon" onClick={()=> { const arr=[...(getPath(['mediaGallery','videos'], []) as any[])]; arr.splice(idx,1); setPath(['mediaGallery','videos'], arr) }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                        </div>
                    ))}
                    </div>
                </div>
                </CardContent>
            </Card>
        )}

            {/* Programmes */}
            {activeTab === 'programmes' && (
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader><CardTitle className="text-lg font-bold text-gray-900">Programmes</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Programme List</Label>
                        <Button type="button" variant="outline" size="sm" onClick={()=> setPath(['programmes'], [...(getPath(['programmes'], []) as any[]), { id: '', name: '', courseCount: 0, placementRating: 0, eligibilityExams: [], course: [] }])} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                    </div>
                    <div className="space-y-6">
                        {(getPath(['programmes'], []) as any[]).map((prog: any, progIdx: number) => (
                        <div className="space-y-4 border p-4 rounded-xl" key={progIdx}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div><Label className="text-xs text-gray-500 mb-1 block">Programme ID</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={prog.id||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], id: e.target.value }; setPath(['programmes'], arr) }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Programme Name</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={prog.name||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], name: e.target.value }; setPath(['programmes'], arr) }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Course Count</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={prog.courseCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], courseCount: e.target.value ? Number(e.target.value) : 0 }; setPath(['programmes'], arr) }} /></div>
                            <div><Label className="text-xs text-gray-500 mb-1 block">Placement Rating</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={prog.placementRating??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], placementRating: e.target.value ? Number(e.target.value) : 0 }; setPath(['programmes'], arr) }} /></div>
                            </div>
                            
                            <div className="space-y-2">
                            <StringList label="Eligibility Exams" values={prog.eligibilityExams||[]} onChange={(v)=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr[progIdx] = { ...arr[progIdx], eligibilityExams: v }; setPath(['programmes'], arr) }} placeholder="GMAT, CAT, XAT"/>
                            </div>
                            
                            <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">Courses in Programme</Label>
                                <Button type="button" variant="outline" size="sm" onClick={()=> {
                                const arr=[...(getPath(['programmes'], []) as any[])]; 
                                const courses = [...(arr[progIdx].course||[])]; 
                                courses.push({ id: '', name: '', degree: '', school: '', duration: '', level: '', category: '', totalSeats: 0, fees: { tuitionFee: 0, totalFee: 0, currency: 'INR' }, brochure: { url: '', year: new Date().getFullYear() }, seoUrl: '', affiliatedUniversity: '', location: { state: '', city: '' }, educationType: '', deliveryMethod: '', courseLevel: '', eligibilityExams: [], placements: { averagePackage: 0, highestPackage: 0, placementRate: 0, topRecruiters: [] } }); 
                                arr[progIdx] = { ...arr[progIdx], course: courses }; 
                                setPath(['programmes'], arr)
                                }} className="bg-white border-slate-200 text-gray-600"><Plus className="w-4 h-4 mr-1"/>Add Course</Button>
                            </div>
                            <div className="space-y-3">
                                {(prog.course||[]).map((course: any, courseIdx: number) => (
                                <div className="space-y-3 border rounded-xl p-4 bg-gray-50/50" key={courseIdx}>
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Course ID</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.id||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], id: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">Course Name</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.name||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], name: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Degree</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.degree||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], degree: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">School</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.school||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], school: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Duration</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.duration||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], duration: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Level</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.level||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], level: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Category</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.category||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], category: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Total Seats</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.totalSeats??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], totalSeats: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Review Count</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.reviewCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], reviewCount: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Questions Count</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.questionsCount??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], questionsCount: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">SEO URL</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.seoUrl||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], seoUrl: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Tuition Fee</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.fees?.tuitionFee??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.tuitionFee = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Total Fee</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.fees?.totalFee??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.totalFee = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Currency</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.fees?.currency||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.currency = e.target.value; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Affiliated University</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.affiliatedUniversity||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], affiliatedUniversity: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Brochure URL</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.brochure?.url||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const brochure = { ...(courses[courseIdx].brochure||{}) }; brochure.url = e.target.value; courses[courseIdx] = { ...courses[courseIdx], brochure }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Brochure Year</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.brochure?.year??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const brochure = { ...(courses[courseIdx].brochure||{}) }; brochure.year = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], brochure }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Education Type</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.educationType||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], educationType: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Delivery Method</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.deliveryMethod||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], deliveryMethod: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Course Level</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.courseLevel||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses[courseIdx] = { ...courses[courseIdx], courseLevel: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">State</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.location?.state||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const location = { ...(courses[courseIdx].location||{}) }; location.state = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">City</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.location?.city||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const location = { ...(courses[courseIdx].location||{}) }; location.city = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Locality</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.location?.locality||''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const location = { ...(courses[courseIdx].location||{}) }; location.locality = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Avg Package</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.placements?.averagePackage??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.averagePackage = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    <div><Label className="text-xs text-gray-500 mb-1 block">Highest Package</Label><Input className="h-10 rounded-lg border-slate-200 focus:ring-1 focus:ring-blue-600" value={course.placements?.highestPackage??''} onChange={(e)=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.highestPackage = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} /></div>
                                    </div>
                                    <div className="flex justify-end">
                                    <Button type="button" variant="ghost" size="sm" onClick={()=> { const arr=[...(getPath(['programmes'], []) as any[])]; const courses=[...arr[progIdx].course]; courses.splice(courseIdx,1); arr[progIdx] = { ...arr[progIdx], course: courses }; setPath(['programmes'], arr) }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1"/>Remove Course</Button>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                            
                            <div className="flex justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={()=> { const arr=[...(getPath(['programmes'], []) as any[])]; arr.splice(progIdx,1); setPath(['programmes'], arr) }} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1"/>Remove Programme</Button>
                            </div>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
