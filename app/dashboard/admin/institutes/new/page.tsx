"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/src/hooks/use-toast'
import { Plus, Trash2, Save, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Simple helper components for arrays of strings and arrays of objects
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

export default function AdminInstituteNewPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [submitting, setSubmitting] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkFileName, setBulkFileName] = useState('')
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Root fields
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [slug, setSlug] = useState('')
  const [establishedYear, setEstablishedYear] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [logo, setLogo] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [website, setWebsite] = useState('')

  // accreditation
  const [naacGrade, setNaacGrade] = useState('')
  const [naacCategory, setNaacCategory] = useState('')
  const [naacCgpa, setNaacCgpa] = useState('')
  const [naacValidUntil, setNaacValidUntil] = useState('')
  const [naacCycle, setNaacCycle] = useState('')

  const [nirfOverallRank, setNirfOverallRank] = useState('')
  const [nirfUniversityRank, setNirfUniversityRank] = useState('')
  const [nirfManagementRank, setNirfManagementRank] = useState('')
  const [nirfYear, setNirfYear] = useState('')

  const [ugcRecognition, setUgcRecognition] = useState('')

  // location
  const [locAddress, setLocAddress] = useState('')
  const [locCity, setLocCity] = useState('')
  const [locState, setLocState] = useState('')
  const [locPincode, setLocPincode] = useState('')
  const [locCountry, setLocCountry] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [nearbyLandmarks, setNearbyLandmarks] = useState<string[]>([])

  // contact
  const [phones, setPhones] = useState<string[]>([])
  const [contactEmail, setContactEmail] = useState('')
  const [contactWebsite, setContactWebsite] = useState('')
  const [admissionsEmail, setAdmissionsEmail] = useState('')

  // overview
  const [overviewDescription, setOverviewDescription] = useState('')
  const [overviewVision, setOverviewVision] = useState('')
  const [overviewMission, setOverviewMission] = useState('')
  const [overviewMotto, setOverviewMotto] = useState('')
  const [overviewFounder, setOverviewFounder] = useState('')
  const [overviewChancellor, setOverviewChancellor] = useState('')
  const [overviewViceChancellor, setOverviewViceChancellor] = useState('')

  // campusDetails
  const [campusType, setCampusType] = useState('')
  const [environment, setEnvironment] = useState('')
  const [facAcademic, setFacAcademic] = useState<string[]>([])
  const [facResidential, setFacResidential] = useState<string[]>([])
  const [facRecreational, setFacRecreational] = useState<string[]>([])
  const [facSupport, setFacSupport] = useState<string[]>([])

  // academics
  const [totalStudents, setTotalStudents] = useState('')
  const [totalFaculty, setTotalFaculty] = useState('')
  const [studentFacultyRatio, setStudentFacultyRatio] = useState('')
  const [internationalStudents, setInternationalStudents] = useState('')
  const [totalPrograms, setTotalPrograms] = useState('')
  const [schools, setSchools] = useState<Array<{ name: string; established?: string; programs: string[] }>>([])

  // admissions
  const [admissionProcess, setAdmissionProcess] = useState<string[]>([])
  const [reservationPolicyEntries, setReservationPolicyEntries] = useState<Array<{ key: string; value: string }>>([])

  // placements
  const [topRecruiters, setTopRecruiters] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])

  // rankings
  const [rankingsNational, setRankingsNational] = useState<Array<{ agency: string; category: string; rank: string; year: string }>>([])
  const [rankingsDescription, setRankingsDescription] = useState('')

  // research
  const [researchCenters, setResearchCenters] = useState('')
  const [patentsFiled, setPatentsFiled] = useState('')
  const [publicationsPerYear, setPublicationsPerYear] = useState('')
  const [researchFunding, setResearchFunding] = useState('')
  const [phdScholars, setPhdScholars] = useState('')
  const [incubationName, setIncubationName] = useState('')
  const [incubationStartupsFunded, setIncubationStartupsFunded] = useState('')
  const [incubationTotalFunding, setIncubationTotalFunding] = useState('')
  const [collaborations, setCollaborations] = useState<string[]>([])

  // alumni
  const [totalAlumni, setTotalAlumni] = useState('')
  const [notableAlumni, setNotableAlumni] = useState<string[]>([])
  const [alumniInFortune500, setAlumniInFortune500] = useState('')
  const [entrepreneursCreated, setEntrepreneursCreated] = useState('')

  // awards
  const [awards, setAwards] = useState<string[]>([])

  // mediaGallery
  const [photosCategories, setPhotosCategories] = useState<Array<{ category: string; urls: string[] }>>([])
  const [videos, setVideos] = useState<Array<{ url: string; title?: string; thumbnail?: string }>>([])


  // stats
  const [stats, setStats] = useState<Array<{ title: string; description: string }>>([])

  // programmes
  const [programmes, setProgrammes] = useState<Array<{
    id: string; name: string; courseCount?: number; placementRating?: number; eligibilityExams?: string[]; course?: Array<{
      id: string; name: string; degree?: string; school?: string; duration?: string; level?: string; category?: string; totalSeats?: number; reviewCount?: number; questionsCount?: number; fees?: { tuitionFee?: number; totalFee?: number; currency?: string }; brochure?: { url?: string; year?: number }; seoUrl?: string; affiliatedUniversity?: string; location?: { state?: string; city?: string; locality?: string }; educationType?: string; deliveryMethod?: string; courseLevel?: string; eligibilityExams?: string[]; recognition?: Array<{ name: string }>; placements?: { averagePackage?: number; highestPackage?: number; placementRate?: number; topRecruiters?: string[] };
    }>;
  }>>([])

  // Helpers to manage nested arrays of objects
  function addSchool() {
    setSchools([...(schools||[]), { name: '', established: '', programs: [] }])
  }
  function updateSchool(idx: number, next: Partial<{ name: string; established?: string; programs: string[] }>) {
    const arr = [...schools]
    arr[idx] = { ...arr[idx], ...next }
    setSchools(arr)
  }
  function removeSchool(idx: number) { const arr = [...schools]; arr.splice(idx,1); setSchools(arr) }

  function addRanking() { setRankingsNational([...(rankingsNational||[]), { agency: '', category: '', rank: '', year: '' }]) }
  function updateRanking(idx: number, next: Partial<{ agency: string; category: string; rank: string; year: string }>) { const arr=[...rankingsNational]; arr[idx]={...arr[idx],...next}; setRankingsNational(arr) }
  function removeRanking(idx: number) { const arr=[...rankingsNational]; arr.splice(idx,1); setRankingsNational(arr) }

  function addStat() { setStats([...(stats||[]), { title: '', description: '' }]) }
  function updateStat(idx: number, next: Partial<{ title: string; description: string }>) { const arr=[...stats]; arr[idx] = { ...arr[idx], ...next }; setStats(arr) }
  function removeStat(idx: number) { const arr=[...stats]; arr.splice(idx,1); setStats(arr) }

  function addProgramme() { setProgrammes([...(programmes||[]), { id: '', name: '', courseCount: 0, placementRating: 0, eligibilityExams: [], course: [] }]) }
  function updateProgramme(idx: number, next: any) { const arr=[...programmes]; arr[idx] = { ...arr[idx], ...next }; setProgrammes(arr) }
  function removeProgramme(idx: number) { const arr=[...programmes]; arr.splice(idx,1); setProgrammes(arr) }

  function onBulkFileSelected(file: File | undefined) {
    if (!file) return
    setBulkFile(file)
    setBulkFileName(file.name)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!dragActive) setDragActive(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) onBulkFileSelected(file)
  }

  async function onBulkSubmit() {
    if (!bulkFile) return
    try {
      setBulkBusy(true)
      const text = await bulkFile.text()
      const json = JSON.parse(text)
      const payload = Array.isArray(json) ? json : [json]
      const res = await fetch('/api/admin/institutes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Bulk upload complete', description: `${payload.length} record(s) processed` })
      setBulkOpen(false)
    } catch (e: any) {
      toast({ title: 'Bulk upload failed', description: e.message, variant: 'destructive' })
    } finally {
      setBulkBusy(false)
      setBulkFileName('')
      setBulkFile(null)
    }
  }

  async function onSubmit() {
    try {
      if (!name || !slug) {
        toast({ title: 'Validation', description: 'Name and slug are required', variant: 'destructive' })
        return
      }
      setSubmitting(true)

      const payload: any = {
        ...(id ? { id } : {}),
        name,
        ...(shortName ? { shortName } : {}),
        slug,
        ...(establishedYear ? { establishedYear: Number(establishedYear) } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(logo ? { logo } : {}),
        ...(coverImage ? { coverImage } : {}),
        ...(website ? { website } : {}),
        accreditation: {
          ...(naacGrade || naacCategory || naacCgpa || naacValidUntil || naacCycle ? { naac: {
            ...(naacGrade ? { grade: naacGrade } : {}),
            ...(naacCategory ? { category: naacCategory } : {}),
            ...(naacCgpa ? { cgpa: Number(naacCgpa) } : {}),
            ...(naacValidUntil ? { validUntil: naacValidUntil } : {}),
            ...(naacCycle ? { cycleNumber: Number(naacCycle) } : {}),
          } } : {}),
          ...(nirfOverallRank || nirfUniversityRank || nirfManagementRank || nirfYear ? { nirf: {
            ...(nirfOverallRank ? { overallRank: nirfOverallRank } : {}),
            ...(nirfUniversityRank ? { universityRank: nirfUniversityRank } : {}),
            ...(nirfManagementRank ? { managementRank: nirfManagementRank } : {}),
            ...(nirfYear ? { year: Number(nirfYear) } : {}),
          } } : {}),
          ...(ugcRecognition ? { ugc: { recognition: ugcRecognition } } : {}),
        },
        location: {
          ...(locAddress ? { address: locAddress } : {}),
          ...(locCity ? { city: locCity } : {}),
          ...(locState ? { state: locState } : {}),
          ...(locPincode ? { pincode: locPincode } : {}),
          ...(locCountry ? { country: locCountry } : {}),
          coordinates: {
            ...(latitude ? { latitude: Number(latitude) } : {}),
            ...(longitude ? { longitude: Number(longitude) } : {}),
          },
          ...(nearbyLandmarks.length ? { nearbyLandmarks } : {}),
        },
        contact: {
          ...(phones.length ? { phone: phones } : {}),
          ...(contactEmail ? { email: contactEmail } : {}),
          ...(contactWebsite ? { website: contactWebsite } : {}),
          ...(admissionsEmail ? { admissionsEmail } : {}),
        },
        overview: {
          ...(overviewDescription ? { description: overviewDescription } : {}),
          ...(overviewVision ? { vision: overviewVision } : {}),
          ...(overviewMission ? { mission: overviewMission } : {}),
          ...(overviewMotto ? { motto: overviewMotto } : {}),
          ...(overviewFounder ? { founder: overviewFounder } : {}),
          ...(overviewChancellor ? { chancellor: overviewChancellor } : {}),
          ...(overviewViceChancellor ? { viceChancellor: overviewViceChancellor } : {}),
          ...(stats.length ? { stats } : {}),
        },
        campusDetails: {
          ...(campusType ? { campusType } : {}),
          ...(environment ? { environment } : {}),
          facilities: {
            ...(facAcademic.length ? { academic: facAcademic } : {}),
            ...(facResidential.length ? { residential: facResidential } : {}),
            ...(facRecreational.length ? { recreational: facRecreational } : {}),
            ...(facSupport.length ? { support: facSupport } : {}),
          }
        },
        academics: {
          ...(totalStudents ? { totalStudents: Number(totalStudents) } : {}),
          ...(totalFaculty ? { totalFaculty: Number(totalFaculty) } : {}),
          ...(studentFacultyRatio ? { studentFacultyRatio } : {}),
          ...(internationalStudents ? { internationalStudents: Number(internationalStudents) } : {}),
          ...(totalPrograms ? { totalPrograms: Number(totalPrograms) } : {}),
          ...(schools.length ? { schools: schools.map(s => ({ name: s.name, ...(s.established ? { established: Number(s.established) } : {}), programs: s.programs||[] })) } : {}),
        },
        admissions: {
          ...(admissionProcess.length ? { admissionProcess } : {}),
          ...(reservationPolicyEntries.length ? { reservationPolicy: reservationPolicyEntries.reduce((acc, cur)=> { acc[cur.key] = cur.value; return acc }, {} as any) } : {}),
        },
        placements: {
          ...(topRecruiters.length ? { topRecruiters } : {}),
          ...(sectors.length ? { sectors } : {}),
        },
        rankings: {
          ...(rankingsNational.length ? { national: rankingsNational.map(r => ({ agency: r.agency, category: r.category, rank: r.rank, year: Number(r.year) })) } : {}),
          ...(rankingsDescription ? { rankingsDescription } : {}),
        },
        researchAndInnovation: {
          ...(researchCenters ? { researchCenters: Number(researchCenters) } : {}),
          ...(patentsFiled ? { patentsFiled: Number(patentsFiled) } : {}),
          ...(publicationsPerYear ? { publicationsPerYear: Number(publicationsPerYear) } : {}),
          ...(researchFunding ? { researchFunding } : {}),
          ...(phdScholars ? { phdScholars: Number(phdScholars) } : {}),
          incubationCenter: {
            ...(incubationName ? { name: incubationName } : {}),
            ...(incubationStartupsFunded ? { startupsFunded: Number(incubationStartupsFunded) } : {}),
            ...(incubationTotalFunding ? { totalFunding: incubationTotalFunding } : {}),
          },
          ...(collaborations.length ? { collaborations } : {}),
        },
        alumniNetwork: {
          ...(totalAlumni ? { totalAlumni: Number(totalAlumni) } : {}),
          ...(notableAlumni.length ? { notableAlumni } : {}),
          ...(alumniInFortune500 ? { alumniInFortune500: Number(alumniInFortune500) } : {}),
          ...(entrepreneursCreated ? { entrepreneursCreated: Number(entrepreneursCreated) } : {}),
        },
        ...(awards.length ? { awards } : {}),
        mediaGallery: {
          ...(photosCategories.length ? { photos: photosCategories.reduce((acc, cur)=> { acc[cur.category] = cur.urls; return acc }, {} as any) } : {}),
          ...(videos.length ? { videos } : {}),
        },
        ...(programmes.length ? { programmes: programmes.map(p => ({
          id: p.id,
          name: p.name,
          ...(p.courseCount ? { courseCount: p.courseCount } : {}),
          ...(p.placementRating ? { placementRating: p.placementRating } : {}),
          ...(p.eligibilityExams && p.eligibilityExams.length ? { eligibilityExams: p.eligibilityExams } : {}),
          ...(p.course && p.course.length ? { courses: p.course.map(c => ({
            id: c.id,
            name: c.name,
            ...(c.degree ? { degree: c.degree } : {}),
            ...(c.school ? { school: c.school } : {}),
            ...(c.duration ? { duration: c.duration } : {}),
            ...(c.level ? { level: c.level } : {}),
            ...(c.category ? { category: c.category } : {}),
            ...(c.totalSeats ? { totalSeats: c.totalSeats } : {}),
            ...(c.fees ? { fees: c.fees } : {}),
            ...(c.brochure ? { brochure: c.brochure } : {}),
            ...(c.seoUrl ? { seoUrl: c.seoUrl } : {}),
            ...(c.affiliatedUniversity ? { affiliatedUniversity: c.affiliatedUniversity } : {}),
            ...(c.location ? { location: c.location } : {}),
            ...(c.educationType ? { educationType: c.educationType } : {}),
            ...(c.deliveryMethod ? { deliveryMethod: c.deliveryMethod } : {}),
            ...(c.courseLevel ? { courseLevel: c.courseLevel } : {}),
            ...(c.eligibilityExams && c.eligibilityExams.length ? { eligibilityExams: c.eligibilityExams } : {}),
            ...(c.placements ? { placements: c.placements } : {}),
          })) } : {}),
        })) } : {}),
      }

      const res = await fetch('/api/admin/institutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Institute created' })
      router.push('/dashboard/admin/institutes')
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Admin Institute</h1>
        <div className="flex items-center gap-2">
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary"><Upload className="w-4 h-4 mr-2"/>Bulk Upload</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Institutes (JSON file)</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="bulkFile">Choose JSON File</Label>
                <input
                  id="bulkFile"
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e)=> onBulkFileSelected(e.target.files?.[0])}
                />
                <div
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer select-none transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('bulkFile')?.click()}
                >
                  <div className="text-sm">Drag & drop your .json file here, or click to browse</div>
                  <div className="text-xs text-gray-500 mt-1">Only JSON files are accepted</div>
                </div>
                {bulkFileName && <div className="text-sm text-gray-600">Selected: {bulkFileName}</div>}
                <div className="text-xs text-gray-500">
                  Upload a JSON file containing either a single institute object or an array of institute objects. Each should match the AdminInstitute schema (e.g., includes name and slug).
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={onBulkSubmit} disabled={bulkBusy || !bulkFile}><Upload className="w-4 h-4 mr-2"/>Save</Button>
                <Button type="button" variant="ghost" onClick={()=> setBulkOpen(false)} disabled={bulkBusy}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={onSubmit} disabled={submitting}><Save className="w-4 h-4 mr-2"/>Save</Button>
        </div>
      </div>

      {/* Core details */}
      <Card>
        <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>ID</Label><Input value={id} onChange={(e)=> setId(e.target.value)} placeholder="gujarat-university"/></div>
          <div className="md:col-span-2"><Label>Name</Label><Input value={name} onChange={(e)=> setName(e.target.value)} placeholder="Gujarat University"/></div>
          <div><Label>Short Name</Label><Input value={shortName} onChange={(e)=> setShortName(e.target.value)} placeholder="GU"/></div>
          <div><Label>Slug</Label><Input value={slug} onChange={(e)=> setSlug(e.target.value)} placeholder="gujarat-university"/></div>
          <div><Label>Established Year</Label><Input value={establishedYear} onChange={(e)=> setEstablishedYear(e.target.value)} placeholder="1950"/></div>
          <div><Label>Type</Label><Input value={type} onChange={(e)=> setType(e.target.value)} placeholder="Public/Government"/></div>
          <div><Label>Status</Label><Input value={status} onChange={(e)=> setStatus(e.target.value)} placeholder="Active"/></div>
          <div className="md:col-span-2"><Label>Logo URL</Label><Input value={logo} onChange={(e)=> setLogo(e.target.value)} placeholder="https://..."/></div>
          <div className="md:col-span-3"><Label>Cover Image URL</Label><Input value={coverImage} onChange={(e)=> setCoverImage(e.target.value)} placeholder="https://..."/></div>
          <div className="md:col-span-3"><Label>Website</Label><Input value={website} onChange={(e)=> setWebsite(e.target.value)} placeholder="https://www.example.edu"/></div>
        </CardContent>
      </Card>

      {/* Accreditation */}
      <Card>
        <CardHeader><CardTitle>Accreditation</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><Label>NAAC Grade</Label><Input value={naacGrade} onChange={(e)=> setNaacGrade(e.target.value)} /></div>
          <div><Label>NAAC Category</Label><Input value={naacCategory} onChange={(e)=> setNaacCategory(e.target.value)} /></div>
          <div><Label>NAAC CGPA</Label><Input value={naacCgpa} onChange={(e)=> setNaacCgpa(e.target.value)} placeholder="0-4"/></div>
          <div><Label>NAAC Cycle</Label><Input value={naacCycle} onChange={(e)=> setNaacCycle(e.target.value)} /></div>
          <div className="md:col-span-2"><Label>NAAC Valid Until</Label><Input value={naacValidUntil} onChange={(e)=> setNaacValidUntil(e.target.value)} placeholder="YYYY-MM-DD or text"/></div>
          <div><Label>NIRF Overall Rank</Label><Input value={nirfOverallRank} onChange={(e)=> setNirfOverallRank(e.target.value)} /></div>
          <div><Label>NIRF University Rank</Label><Input value={nirfUniversityRank} onChange={(e)=> setNirfUniversityRank(e.target.value)} /></div>
          <div><Label>NIRF Management Rank</Label><Input value={nirfManagementRank} onChange={(e)=> setNirfManagementRank(e.target.value)} /></div>
          <div><Label>NIRF Year</Label><Input value={nirfYear} onChange={(e)=> setNirfYear(e.target.value)} /></div>
          <div className="md:col-span-4"><Label>UGC Recognition</Label><Input value={ugcRecognition} onChange={(e)=> setUgcRecognition(e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Location & Contact */}
      <Card>
        <CardHeader><CardTitle>Location & Contact</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><Label>Address</Label><Input value={locAddress} onChange={(e)=> setLocAddress(e.target.value)} /></div>
          <div><Label>City</Label><Input value={locCity} onChange={(e)=> setLocCity(e.target.value)} /></div>
          <div><Label>State</Label><Input value={locState} onChange={(e)=> setLocState(e.target.value)} /></div>
          <div><Label>Pincode</Label><Input value={locPincode} onChange={(e)=> setLocPincode(e.target.value)} /></div>
          <div><Label>Country</Label><Input value={locCountry} onChange={(e)=> setLocCountry(e.target.value)} /></div>
          <div><Label>Latitude</Label><Input value={latitude} onChange={(e)=> setLatitude(e.target.value)} /></div>
          <div><Label>Longitude</Label><Input value={longitude} onChange={(e)=> setLongitude(e.target.value)} /></div>
          <div className="md:col-span-3"><StringList label="Nearby Landmarks" values={nearbyLandmarks} onChange={setNearbyLandmarks} placeholder="Landmark"/></div>
          <div className="md:col-span-3"><StringList label="Phones" values={phones} onChange={setPhones} placeholder="Phone"/></div>
          <div><Label>Contact Email</Label><Input value={contactEmail} onChange={(e)=> setContactEmail(e.target.value)} /></div>
          <div><Label>Contact Website</Label><Input value={contactWebsite} onChange={(e)=> setContactWebsite(e.target.value)} /></div>
          <div><Label>Admissions Email</Label><Input value={admissionsEmail} onChange={(e)=> setAdmissionsEmail(e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><Label>Description</Label><Input value={overviewDescription} onChange={(e)=> setOverviewDescription(e.target.value)} /></div>
          <div><Label>Vision</Label><Input value={overviewVision} onChange={(e)=> setOverviewVision(e.target.value)} /></div>
          <div><Label>Mission</Label><Input value={overviewMission} onChange={(e)=> setOverviewMission(e.target.value)} /></div>
          <div><Label>Motto</Label><Input value={overviewMotto} onChange={(e)=> setOverviewMotto(e.target.value)} /></div>
          <div><Label>Founder</Label><Input value={overviewFounder} onChange={(e)=> setOverviewFounder(e.target.value)} /></div>
          <div><Label>Chancellor</Label><Input value={overviewChancellor} onChange={(e)=> setOverviewChancellor(e.target.value)} /></div>
          <div><Label>Vice Chancellor</Label><Input value={overviewViceChancellor} onChange={(e)=> setOverviewViceChancellor(e.target.value)} /></div>
          
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stats</Label>
              <Button type="button" variant="secondary" size="sm" onClick={addStat}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {stats.map((stat, idx) => (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2" key={idx}>
                  <div><Label>Title</Label><Input value={stat.title} onChange={(e)=> updateStat(idx, { title: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Description</Label><Input value={stat.description} onChange={(e)=> updateStat(idx, { description: e.target.value })} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> removeStat(idx)}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campus Details */}
      <Card>
        <CardHeader><CardTitle>Campus Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Campus Type</Label><Input value={campusType} onChange={(e)=> setCampusType(e.target.value)} /></div>
          <div><Label>Environment</Label><Input value={environment} onChange={(e)=> setEnvironment(e.target.value)} /></div>
          <div className="md:col-span-3"><StringList label="Academic Facilities" values={facAcademic} onChange={setFacAcademic} placeholder="Library, Labs, ..."/></div>
          <div className="md:col-span-3"><StringList label="Residential Facilities" values={facResidential} onChange={setFacResidential} placeholder="Hostel, Mess, ..."/></div>
          <div className="md:col-span-3"><StringList label="Recreational Facilities" values={facRecreational} onChange={setFacRecreational} placeholder="Sports, Gym, ..."/></div>
          <div className="md:col-span-3"><StringList label="Support Facilities" values={facSupport} onChange={setFacSupport} placeholder="Wi-Fi, Bank, ..."/></div>
        </CardContent>
      </Card>

      {/* Academics */}
      <Card>
        <CardHeader><CardTitle>Academics</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div><Label>Total Students</Label><Input value={totalStudents} onChange={(e)=> setTotalStudents(e.target.value)} /></div>
            <div><Label>Total Faculty</Label><Input value={totalFaculty} onChange={(e)=> setTotalFaculty(e.target.value)} /></div>
            <div><Label>Student:Faculty Ratio</Label><Input value={studentFacultyRatio} onChange={(e)=> setStudentFacultyRatio(e.target.value)} placeholder="15:1"/></div>
            <div><Label>International Students</Label><Input value={internationalStudents} onChange={(e)=> setInternationalStudents(e.target.value)} /></div>
            <div><Label>Total Programs</Label><Input value={totalPrograms} onChange={(e)=> setTotalPrograms(e.target.value)} /></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Schools</Label>
              <Button type="button" variant="secondary" size="sm" onClick={addSchool}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {schools.map((s, idx) => (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2" key={idx}>
                  <div className="md:col-span-2"><Label>Name</Label><Input value={s.name} onChange={(e)=> updateSchool(idx, { name: e.target.value })} /></div>
                  <div><Label>Established</Label><Input value={s.established||''} onChange={(e)=> updateSchool(idx, { established: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Programs (comma separated)</Label><Input value={(s.programs||[]).join(', ')} onChange={(e)=> updateSchool(idx, { programs: e.target.value.split(',').map(x=> x.trim()).filter(Boolean) })} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> removeSchool(idx)}><Trash2 className="w-4 h-4"/></Button></div>
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
          <StringList label="Admission Process Steps" values={admissionProcess} onChange={setAdmissionProcess} placeholder="Step"/>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Reservation Policy (key-value)</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setReservationPolicyEntries([...(reservationPolicyEntries||[]), { key: '', value: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-2">
              {reservationPolicyEntries.map((it, idx) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2" key={idx}>
                  <div><Label>Key</Label><Input value={it.key} onChange={(e)=> { const arr=[...reservationPolicyEntries]; arr[idx].key=e.target.value; setReservationPolicyEntries(arr) }} placeholder="sc, st, obc..."/></div>
                  <div><Label>Value</Label><Input value={it.value} onChange={(e)=> { const arr=[...reservationPolicyEntries]; arr[idx].value=e.target.value; setReservationPolicyEntries(arr) }} placeholder="15%"/></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> { const arr=[...reservationPolicyEntries]; arr.splice(idx,1); setReservationPolicyEntries(arr) }}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
            </div>
          </div>

          <StringList label="Top Recruiters" values={topRecruiters} onChange={setTopRecruiters} placeholder="Company"/>
          <StringList label="Sectors" values={sectors} onChange={setSectors} placeholder="IT & Software - 40%"/>
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card>
        <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>National Rankings</Label>
            <Button type="button" variant="secondary" size="sm" onClick={addRanking}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-3">
            {rankingsNational.map((r, idx) => (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2" key={idx}>
                <div><Label>Agency</Label><Input value={r.agency} onChange={(e)=> updateRanking(idx, { agency: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={r.category} onChange={(e)=> updateRanking(idx, { category: e.target.value })} /></div>
                <div><Label>Rank</Label><Input value={r.rank} onChange={(e)=> updateRanking(idx, { rank: e.target.value })} /></div>
                <div><Label>Year</Label><Input value={r.year} onChange={(e)=> updateRanking(idx, { year: e.target.value })} /></div>
                <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> removeRanking(idx)}><Trash2 className="w-4 h-4"/></Button></div>
              </div>
            ))}
          </div>
          <div>
            <Label>Rankings Description</Label>
            <Input value={rankingsDescription} onChange={(e)=> setRankingsDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Research & Alumni */}
      <Card>
        <CardHeader><CardTitle>Research & Alumni</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><Label>Research Centers</Label><Input value={researchCenters} onChange={(e)=> setResearchCenters(e.target.value)} /></div>
          <div><Label>Patents Filed</Label><Input value={patentsFiled} onChange={(e)=> setPatentsFiled(e.target.value)} /></div>
          <div><Label>Publications / Year</Label><Input value={publicationsPerYear} onChange={(e)=> setPublicationsPerYear(e.target.value)} /></div>
          <div><Label>Research Funding</Label><Input value={researchFunding} onChange={(e)=> setResearchFunding(e.target.value)} /></div>
          <div><Label>PhD Scholars</Label><Input value={phdScholars} onChange={(e)=> setPhdScholars(e.target.value)} /></div>
          <div><Label>Incubation Name</Label><Input value={incubationName} onChange={(e)=> setIncubationName(e.target.value)} /></div>
          <div><Label>Startups Funded</Label><Input value={incubationStartupsFunded} onChange={(e)=> setIncubationStartupsFunded(e.target.value)} /></div>
          <div><Label>Total Funding</Label><Input value={incubationTotalFunding} onChange={(e)=> setIncubationTotalFunding(e.target.value)} /></div>
          <div className="md:col-span-4"><StringList label="Collaborations" values={collaborations} onChange={setCollaborations} placeholder="Partner"/></div>
        </CardContent>
      </Card>

      {/* Awards & Media */}
      <Card>
        <CardHeader><CardTitle>Awards & Media</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <StringList label="Awards (titles)" values={awards} onChange={setAwards} placeholder="Award title"/>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Photo Categories</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setPhotosCategories([...(photosCategories||[]), { category: '', urls: [] }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            {photosCategories.map((it, idx) => (
              <div className="space-y-2" key={idx}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div><Label>Category</Label><Input value={it.category} onChange={(e)=> { const arr=[...photosCategories]; arr[idx].category=e.target.value; setPhotosCategories(arr) }} /></div>
                  <div className="md:col-span-2"><StringList label="URLs" values={it.urls} onChange={(urls)=> { const arr=[...photosCategories]; arr[idx].urls=urls; setPhotosCategories(arr) }} placeholder="https://..."/></div>
                </div>
                <div>
                  <Button type="button" variant="destructive" size="sm" onClick={()=> { const arr=[...photosCategories]; arr.splice(idx,1); setPhotosCategories(arr) }}><Trash2 className="w-4 h-4 mr-1"/>Remove Category</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Videos</Label>
              <Button type="button" variant="secondary" size="sm" onClick={()=> setVideos([...(videos||[]), { url: '' }])}><Plus className="w-4 h-4 mr-1"/>Add</Button>
            </div>
            <div className="space-y-3">
              {videos.map((v, idx) => (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2" key={idx}>
                  <div><Label>URL</Label><Input value={v.url} onChange={(e)=> { const arr=[...videos]; arr[idx].url=e.target.value; setVideos(arr) }} /></div>
                  <div><Label>Title</Label><Input value={v.title||''} onChange={(e)=> { const arr=[...videos]; arr[idx].title=e.target.value; setVideos(arr) }} /></div>
                  <div><Label>Thumbnail</Label><Input value={v.thumbnail||''} onChange={(e)=> { const arr=[...videos]; arr[idx].thumbnail=e.target.value; setVideos(arr) }} /></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> { const arr=[...videos]; arr.splice(idx,1); setVideos(arr) }}><Trash2 className="w-4 h-4"/></Button></div>
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
            <Button type="button" variant="secondary" size="sm" onClick={addProgramme}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-6">
            {programmes.map((prog, progIdx) => (
              <div className="space-y-4 border rounded-md p-4" key={progIdx}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div><Label>Programme ID</Label><Input value={prog.id} onChange={(e)=> updateProgramme(progIdx, { id: e.target.value })} /></div>
                  <div><Label>Programme Name</Label><Input value={prog.name} onChange={(e)=> updateProgramme(progIdx, { name: e.target.value })} /></div>
                  <div><Label>Course Count</Label><Input value={prog.courseCount??''} onChange={(e)=> updateProgramme(progIdx, { courseCount: e.target.value ? Number(e.target.value) : 0 })} /></div>
                  <div><Label>Placement Rating</Label><Input value={prog.placementRating??''} onChange={(e)=> updateProgramme(progIdx, { placementRating: e.target.value ? Number(e.target.value) : 0 })} /></div>
                </div>
                
                <div className="space-y-2">
                  <StringList label="Eligibility Exams" values={prog.eligibilityExams||[]} onChange={(v)=> updateProgramme(progIdx, { eligibilityExams: v })} placeholder="GMAT, CAT, XAT"/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Courses in Programme</Label>
                    <Button type="button" variant="secondary" size="sm" onClick={()=> {
                      const arr = [...programmes];
                      const courses = [...(arr[progIdx].course||[])];
                      courses.push({ id: '', name: '', degree: '', school: '', duration: '', level: '', category: '', totalSeats: 0, reviewCount: 0, questionsCount: 0, fees: { tuitionFee: 0, totalFee: 0, currency: 'INR' }, brochure: { url: '', year: new Date().getFullYear() }, seoUrl: '', affiliatedUniversity: '', location: { state: '', city: '' }, educationType: '', deliveryMethod: '', courseLevel: '', eligibilityExams: [], placements: { averagePackage: 0, highestPackage: 0, placementRate: 0, topRecruiters: [] } });
                      arr[progIdx] = { ...arr[progIdx], course: courses };
                      setProgrammes(arr)
                    }}><Plus className="w-4 h-4 mr-1"/>Add Course</Button>
                  </div>
                  <div className="space-y-4">
                    {(prog.course||[]).map((course, courseIdx) => (
                      <div className="space-y-3 border rounded-md p-4 bg-gray-50" key={courseIdx}>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                          <div><Label>Course ID</Label><Input value={course.id} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], id: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div className="md:col-span-2"><Label>Course Name</Label><Input value={course.name} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], name: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Degree</Label><Input value={course.degree||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], degree: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>School</Label><Input value={course.school||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], school: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Duration</Label><Input value={course.duration||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], duration: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                          <div><Label>Level</Label><Input value={course.level||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], level: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Category</Label><Input value={course.category||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], category: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Total Seats</Label><Input value={course.totalSeats??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], totalSeats: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Review Count</Label><Input value={course.reviewCount??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], reviewCount: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Questions Count</Label><Input value={course.questionsCount??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], questionsCount: e.target.value ? Number(e.target.value) : 0 }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>SEO URL</Label><Input value={course.seoUrl||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], seoUrl: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Tuition Fee</Label><Input value={course.fees?.tuitionFee??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.tuitionFee = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Total Fee</Label><Input value={course.fees?.totalFee??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.totalFee = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Currency</Label><Input value={course.fees?.currency||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const fees = { ...(courses[courseIdx].fees||{}) }; fees.currency = e.target.value; courses[courseIdx] = { ...courses[courseIdx], fees }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Affiliated University</Label><Input value={course.affiliatedUniversity||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], affiliatedUniversity: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Brochure URL</Label><Input value={course.brochure?.url||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const brochure = { ...(courses[courseIdx].brochure||{}) }; brochure.url = e.target.value; courses[courseIdx] = { ...courses[courseIdx], brochure }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Brochure Year</Label><Input value={course.brochure?.year??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const brochure = { ...(courses[courseIdx].brochure||{}) }; brochure.year = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], brochure }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Education Type</Label><Input value={course.educationType||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], educationType: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Delivery Method</Label><Input value={course.deliveryMethod||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], deliveryMethod: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Course Level</Label><Input value={course.courseLevel||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], courseLevel: e.target.value }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>State</Label><Input value={course.location?.state||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const location = { ...(courses[courseIdx].location||{}) }; location.state = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>City</Label><Input value={course.location?.city||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const location = { ...(courses[courseIdx].location||{}) }; location.city = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Locality</Label><Input value={course.location?.locality||''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const location: { state?: string; city?: string; locality?: string } = { ...(courses[courseIdx].location||{}) }; location.locality = e.target.value; courses[courseIdx] = { ...courses[courseIdx], location }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div><Label>Avg Package</Label><Input value={course.placements?.averagePackage??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.averagePackage = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Highest Package</Label><Input value={course.placements?.highestPackage??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.highestPackage = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div><Label>Placement Rate</Label><Input value={course.placements?.placementRate??''} onChange={(e)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.placementRate = e.target.value ? Number(e.target.value) : 0; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} /></div>
                          <div className="flex items-end"><Button type="button" variant="destructive" size="sm" onClick={()=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses.splice(courseIdx,1); arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }}><Trash2 className="w-4 h-4 mr-1"/>Remove</Button></div>
                        </div>
                        <div className="md:col-span-4">
                          <StringList label="Recognition" values={course.recognition?.map((r: { name: string }) => r.name) || []} onChange={(v)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], recognition: v.map(name => ({ name })) }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} placeholder="INC, AICTE"/>
                        </div>
                        <div className="md:col-span-4">
                          <StringList label="Eligibility Exams" values={course.eligibilityExams||[]} onChange={(v)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; courses[courseIdx] = { ...courses[courseIdx], eligibilityExams: v }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} placeholder="GMAT, CAT"/>
                        </div>
                        <div className="md:col-span-4">
                          <StringList label="Top Recruiters" values={course.placements?.topRecruiters||[]} onChange={(v)=> { const arr=[...programmes]; const courses=[...arr[progIdx].course!]; const placements = { ...(courses[courseIdx].placements||{}) }; placements.topRecruiters = v; courses[courseIdx] = { ...courses[courseIdx], placements }; arr[progIdx] = { ...arr[progIdx], course: courses }; setProgrammes(arr) }} placeholder="Company Name"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="button" variant="destructive" size="sm" onClick={()=> removeProgramme(progIdx)}><Trash2 className="w-4 h-4 mr-1"/>Remove Programme</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
