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

  // courses
  const [courses, setCourses] = useState<Array<{
    id: string; name: string; degree?: string; school?: string; duration?: string; level?: string; category?: string; totalSeats?: string; reviewCount?: string; questionsCount?: string; tuitionFee?: string; totalFee?: string; currency?: string; brochureUrl?: string; brochureYear?: string; seoUrl?: string; state?: string; city?: string; locality?: string; educationType?: string; deliveryMethod?: string; courseLevel?: string; affiliatedUniversity?: string; recognition?: string[]; avgPackage?: string; highestPackage?: string; placementRate?: string; placementRecruiters?: string[];
  }>>([])

  // programmes (new structure)
  const [programmes, setProgrammes] = useState<Array<{
    id?: string
    name: string
    courseCount?: string
    placementRating?: string
    eligibilityExams: string[]
    course: Array<{
      id?: string
      name: string
      degree?: string
      school?: string
      duration?: string
      level?: string
      category?: string
      totalSeats?: string
      reviewCount?: string
      questionsCount?: string
      tuitionFee?: string
      totalFee?: string
      currency?: string
      brochureUrl?: string
      brochureYear?: string
      seoUrl?: string
      state?: string
      city?: string
      locality?: string
      educationType?: string
      deliveryMethod?: string
      courseLevel?: string
      affiliatedUniversity?: string
      recognition?: string[]
      eligibilityExams?: string[]
      avgPackage?: string
      highestPackage?: string
      placementRate?: string
      placementRecruiters?: string[]
    }>
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

  function addCourse() { setCourses([...(courses||[]), { id: '', name: '', recognition: [], placementRecruiters: [] }]) }
  function updateCourse(idx: number, next: any) { const arr=[...courses]; arr[idx] = { ...arr[idx], ...next }; setCourses(arr) }
  function removeCourse(idx: number) { const arr=[...courses]; arr.splice(idx,1); setCourses(arr) }

  // programme helpers
  function addProgramme() { setProgrammes([...(programmes||[]), { name: '', eligibilityExams: [], course: [] }]) }
  function updateProgramme(idx: number, next: any) { const arr=[...programmes]; arr[idx] = { ...arr[idx], ...next }; setProgrammes(arr) }
  function removeProgramme(idx: number) { const arr=[...programmes]; arr.splice(idx,1); setProgrammes(arr) }
  function addProgrammeCourse(pIdx: number) {
    const arr=[...programmes];
    const cur = arr[pIdx];
    cur.course = [...(cur.course||[]), { name: '', recognition: [], eligibilityExams: [], placementRecruiters: [] } as any]
    arr[pIdx] = { ...cur };
    setProgrammes(arr)
  }
  function updateProgrammeCourse(pIdx: number, cIdx: number, next: any) {
    const arr=[...programmes];
    const cur = arr[pIdx];
    const courses = [...(cur.course||[])];
    courses[cIdx] = { ...courses[cIdx], ...next };
    cur.course = courses; arr[pIdx] = { ...cur }; setProgrammes(arr)
  }
  function removeProgrammeCourse(pIdx: number, cIdx: number) {
    const arr=[...programmes];
    const cur = arr[pIdx];
    const courses = [...(cur.course||[])];
    courses.splice(cIdx,1);
    cur.course = courses; arr[pIdx] = { ...cur }; setProgrammes(arr)
  }

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
        ...(courses.length ? { courses: courses.map(c => ({
          id: c.id,
          name: c.name,
          ...(c.degree ? { degree: c.degree } : {}),
          ...(c.school ? { school: c.school } : {}),
          ...(c.duration ? { duration: c.duration } : {}),
          ...(c.level ? { level: c.level } : {}),
          ...(c.category ? { category: c.category } : {}),
          ...(c.totalSeats ? { totalSeats: Number(c.totalSeats) } : {}),
          ...(c.reviewCount ? { reviewCount: Number(c.reviewCount) } : {}),
          ...(c.questionsCount ? { questionsCount: Number(c.questionsCount) } : {}),
          fees: {
            ...(c.tuitionFee ? { tuitionFee: Number(c.tuitionFee) } : {}),
            ...(c.totalFee ? { totalFee: Number(c.totalFee) } : {}),
            ...(c.currency ? { currency: c.currency } : {}),
          },
          brochure: {
            ...(c.brochureUrl ? { url: c.brochureUrl } : {}),
            ...(c.brochureYear ? { year: Number(c.brochureYear) } : {}),
          },
          ...(c.seoUrl ? { seoUrl: c.seoUrl } : {}),
          location: {
            ...(c.state ? { state: c.state } : {}),
            ...(c.city ? { city: c.city } : {}),
            ...(c.locality ? { locality: c.locality } : {}),
          },
          ...(c.educationType ? { educationType: c.educationType } : {}),
          ...(c.deliveryMethod ? { deliveryMethod: c.deliveryMethod } : {}),
          ...(c.courseLevel ? { courseLevel: c.courseLevel } : {}),
          ...(c.affiliatedUniversity ? { affiliatedUniversity: c.affiliatedUniversity } : {}),
          ...(c.recognition && c.recognition.length ? { recognition: c.recognition } : {}),
          placements: {
            ...(c.avgPackage ? { averagePackage: Number(c.avgPackage) } : {}),
            ...(c.highestPackage ? { highestPackage: Number(c.highestPackage) } : {}),
            ...(c.placementRate ? { placementRate: Number(c.placementRate) } : {}),
            ...(c.placementRecruiters && c.placementRecruiters.length ? { topRecruiters: c.placementRecruiters } : {}),
          }
        })) } : {}),
        ...(programmes.length ? { programmes: programmes.map(p => ({
          ...(p.id ? { id: p.id } : {}),
          name: p.name,
          ...(p.courseCount ? { courseCount: Number(p.courseCount) } : {}),
          ...(p.placementRating ? { placementRating: Number(p.placementRating) } : {}),
          ...(p.eligibilityExams?.length ? { eligibilityExams: p.eligibilityExams } : {}),
          course: (p.course||[]).map(c => ({
            ...(c.id ? { _id: c.id } : {}),
            name: c.name,
            ...(c.degree ? { degree: c.degree } : {}),
            ...(c.school ? { school: c.school } : {}),
            ...(c.duration ? { duration: c.duration } : {}),
            ...(c.level ? { level: c.level } : {}),
            ...(c.category ? { category: c.category } : {}),
            ...(c.totalSeats ? { totalSeats: Number(c.totalSeats) } : {}),
            ...(c.reviewCount ? { reviewCount: Number(c.reviewCount) } : {}),
            ...(c.questionsCount ? { questionsCount: Number(c.questionsCount) } : {}),
            fees: {
              ...(c.tuitionFee ? { tuitionFee: Number(c.tuitionFee) } : {}),
              ...(c.totalFee ? { totalFee: Number(c.totalFee) } : {}),
              ...(c.currency ? { currency: c.currency } : {}),
            },
            brochure: {
              ...(c.brochureUrl ? { url: c.brochureUrl } : {}),
              ...(c.brochureYear ? { year: Number(c.brochureYear) } : {}),
            },
            ...(c.seoUrl ? { seoUrl: c.seoUrl } : {}),
            location: {
              ...(c.state ? { state: c.state } : {}),
              ...(c.city ? { city: c.city } : {}),
              ...(c.locality ? { locality: c.locality } : {}),
            },
            ...(c.educationType ? { educationType: c.educationType } : {}),
            ...(c.deliveryMethod ? { deliveryMethod: c.deliveryMethod } : {}),
            ...(c.courseLevel ? { courseLevel: c.courseLevel } : {}),
            ...(c.affiliatedUniversity ? { affiliatedUniversity: c.affiliatedUniversity } : {}),
            ...(c.recognition && c.recognition.length ? { recognition: c.recognition } : {}),
            ...(c.eligibilityExams && c.eligibilityExams.length ? { eligibilityExams: c.eligibilityExams } : {}),
            placements: {
              ...(c.avgPackage ? { averagePackage: Number(c.avgPackage) } : {}),
              ...(c.highestPackage ? { highestPackage: Number(c.highestPackage) } : {}),
              ...(c.placementRate ? { placementRate: Number(c.placementRate) } : {}),
              ...(c.placementRecruiters && c.placementRecruiters.length ? { topRecruiters: c.placementRecruiters } : {}),
            }
          }))
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

      {/* Programmes (new structure) */}
      <Card>
        <CardHeader><CardTitle>Programmes (New Structure)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Programme List</Label>
            <Button type="button" variant="secondary" size="sm" onClick={addProgramme}><Plus className="w-4 h-4 mr-1"/>Add Programme</Button>
          </div>
          <div className="space-y-4">
            {programmes.map((p, pIdx) => (
              <div key={pIdx} className="space-y-3 border rounded-md p-3">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div><Label>ID</Label><Input value={p.id||''} onChange={(e)=> updateProgramme(pIdx, { id: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Name</Label><Input value={p.name} onChange={(e)=> updateProgramme(pIdx, { name: e.target.value })} /></div>
                  <div><Label>Course Count</Label><Input value={p.courseCount||''} onChange={(e)=> updateProgramme(pIdx, { courseCount: e.target.value })} /></div>
                  <div><Label>Placement Rating</Label><Input value={p.placementRating||''} onChange={(e)=> updateProgramme(pIdx, { placementRating: e.target.value })} /></div>
                  <div className="md:col-span-2"><StringList label="Eligibility Exams" values={p.eligibilityExams||[]} onChange={(v)=> updateProgramme(pIdx, { eligibilityExams: v })} placeholder="CAT"/></div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Programme Courses</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={()=> addProgrammeCourse(pIdx)}><Plus className="w-4 h-4 mr-1"/>Add Course</Button>
                    <Button type="button" variant="destructive" size="sm" onClick={()=> removeProgramme(pIdx)}><Trash2 className="w-4 h-4 mr-1"/>Remove Programme</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {(p.course||[]).map((c, cIdx) => (
                    <div key={cIdx} className="space-y-2 border rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <div><Label>ID</Label><Input value={c.id||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { id: e.target.value })} /></div>
                        <div className="md:col-span-2"><Label>Name</Label><Input value={c.name||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { name: e.target.value })} /></div>
                        <div><Label>Degree</Label><Input value={c.degree||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { degree: e.target.value })} /></div>
                        <div><Label>School</Label><Input value={c.school||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { school: e.target.value })} /></div>
                        <div><Label>Duration</Label><Input value={c.duration||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { duration: e.target.value })} /></div>
                        <div><Label>Level</Label><Input value={c.level||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { level: e.target.value })} /></div>
                        <div><Label>Category</Label><Input value={c.category||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { category: e.target.value })} /></div>
                        <div><Label>Total Seats</Label><Input value={c.totalSeats??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { totalSeats: e.target.value })} /></div>
                        <div><Label>Review Count</Label><Input value={c.reviewCount??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { reviewCount: e.target.value })} /></div>
                        <div><Label>Questions Count</Label><Input value={c.questionsCount??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { questionsCount: e.target.value })} /></div>
                        <div><Label>Tuition Fee</Label><Input value={c.tuitionFee??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { tuitionFee: e.target.value })} /></div>
                        <div><Label>Total Fee</Label><Input value={c.totalFee??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { totalFee: e.target.value })} /></div>
                        <div><Label>Currency</Label><Input value={c.currency||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { currency: e.target.value })} /></div>
                        <div className="md:col-span-2"><Label>Brochure URL</Label><Input value={c.brochureUrl||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { brochureUrl: e.target.value })} /></div>
                        <div><Label>Brochure Year</Label><Input value={c.brochureYear??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { brochureYear: e.target.value })} /></div>
                        <div className="md:col-span-2"><Label>SEO URL</Label><Input value={c.seoUrl||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { seoUrl: e.target.value })} /></div>
                        <div><Label>State</Label><Input value={c.state||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { state: e.target.value })} /></div>
                        <div><Label>City</Label><Input value={c.city||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { city: e.target.value })} /></div>
                        <div><Label>Locality</Label><Input value={c.locality||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { locality: e.target.value })} /></div>
                        <div><Label>Education Type</Label><Input value={c.educationType||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { educationType: e.target.value })} /></div>
                        <div><Label>Delivery Method</Label><Input value={c.deliveryMethod||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { deliveryMethod: e.target.value })} /></div>
                        <div><Label>Course Level</Label><Input value={c.courseLevel||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { courseLevel: e.target.value })} /></div>
                        <div className="md:col-span-2"><Label>Affiliated University</Label><Input value={c.affiliatedUniversity||''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { affiliatedUniversity: e.target.value })} /></div>
                        <div className="md:col-span-3"><StringList label="Recognition" values={c.recognition||[]} onChange={(v)=> updateProgrammeCourse(pIdx, cIdx, { recognition: v })} placeholder="INC"/></div>
                        <div className="md:col-span-3"><StringList label="Eligibility Exams" values={c.eligibilityExams||[]} onChange={(v)=> updateProgrammeCourse(pIdx, cIdx, { eligibilityExams: v })} placeholder="CAT"/></div>
                        <div><Label>Average Package</Label><Input value={c.avgPackage??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { avgPackage: e.target.value })} /></div>
                        <div><Label>Highest Package</Label><Input value={c.highestPackage??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { highestPackage: e.target.value })} /></div>
                        <div><Label>Placement Rate</Label><Input value={c.placementRate??''} onChange={(e)=> updateProgrammeCourse(pIdx, cIdx, { placementRate: e.target.value })} /></div>
                        <div className="md:col-span-3"><StringList label="Placement Recruiters" values={c.placementRecruiters||[]} onChange={(v)=> updateProgrammeCourse(pIdx, cIdx, { placementRecruiters: v })} placeholder="Company"/></div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={()=> removeProgrammeCourse(pIdx, cIdx)}><Trash2 className="w-4 h-4 mr-1"/>Remove Course</Button>
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
            <Button type="button" variant="secondary" size="sm" onClick={addCourse}><Plus className="w-4 h-4 mr-1"/>Add</Button>
          </div>
          <div className="space-y-4">
            {courses.map((c, idx) => (
              <div className="space-y-2 border rounded-md p-3" key={idx}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div><Label>ID</Label><Input value={c.id} onChange={(e)=> updateCourse(idx, { id: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Name</Label><Input value={c.name} onChange={(e)=> updateCourse(idx, { name: e.target.value })} /></div>
                  <div><Label>Degree</Label><Input value={c.degree||''} onChange={(e)=> updateCourse(idx, { degree: e.target.value })} /></div>
                  <div><Label>School</Label><Input value={c.school||''} onChange={(e)=> updateCourse(idx, { school: e.target.value })} /></div>
                  <div><Label>Duration</Label><Input value={c.duration||''} onChange={(e)=> updateCourse(idx, { duration: e.target.value })} /></div>
                  <div><Label>Level</Label><Input value={c.level||''} onChange={(e)=> updateCourse(idx, { level: e.target.value })} /></div>
                  <div><Label>Category</Label><Input value={c.category||''} onChange={(e)=> updateCourse(idx, { category: e.target.value })} /></div>
                  <div><Label>Total Seats</Label><Input value={c.totalSeats||''} onChange={(e)=> updateCourse(idx, { totalSeats: e.target.value })} /></div>
                  <div><Label>Review Count</Label><Input value={c.reviewCount||''} onChange={(e)=> updateCourse(idx, { reviewCount: e.target.value })} /></div>
                  <div><Label>Questions Count</Label><Input value={c.questionsCount||''} onChange={(e)=> updateCourse(idx, { questionsCount: e.target.value })} /></div>
                  <div><Label>Tuition Fee</Label><Input value={c.tuitionFee||''} onChange={(e)=> updateCourse(idx, { tuitionFee: e.target.value })} /></div>
                  <div><Label>Total Fee</Label><Input value={c.totalFee||''} onChange={(e)=> updateCourse(idx, { totalFee: e.target.value })} /></div>
                  <div><Label>Currency</Label><Input value={c.currency||''} onChange={(e)=> updateCourse(idx, { currency: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Brochure URL</Label><Input value={c.brochureUrl||''} onChange={(e)=> updateCourse(idx, { brochureUrl: e.target.value })} /></div>
                  <div><Label>Brochure Year</Label><Input value={c.brochureYear||''} onChange={(e)=> updateCourse(idx, { brochureYear: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>SEO URL</Label><Input value={c.seoUrl||''} onChange={(e)=> updateCourse(idx, { seoUrl: e.target.value })} /></div>
                  <div><Label>State</Label><Input value={c.state||''} onChange={(e)=> updateCourse(idx, { state: e.target.value })} /></div>
                  <div><Label>City</Label><Input value={c.city||''} onChange={(e)=> updateCourse(idx, { city: e.target.value })} /></div>
                  <div><Label>Locality</Label><Input value={c.locality||''} onChange={(e)=> updateCourse(idx, { locality: e.target.value })} /></div>
                  <div><Label>Education Type</Label><Input value={c.educationType||''} onChange={(e)=> updateCourse(idx, { educationType: e.target.value })} /></div>
                  <div><Label>Delivery Method</Label><Input value={c.deliveryMethod||''} onChange={(e)=> updateCourse(idx, { deliveryMethod: e.target.value })} /></div>
                  <div><Label>Course Level</Label><Input value={c.courseLevel||''} onChange={(e)=> updateCourse(idx, { courseLevel: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Affiliated University</Label><Input value={c.affiliatedUniversity||''} onChange={(e)=> updateCourse(idx, { affiliatedUniversity: e.target.value })} /></div>
                  <div className="md:col-span-3"><StringList label="Recognition" values={c.recognition||[]} onChange={(v)=> updateCourse(idx, { recognition: v })} placeholder="INC"/></div>
                  <div><Label>Average Package</Label><Input value={c.avgPackage||''} onChange={(e)=> updateCourse(idx, { avgPackage: e.target.value })} /></div>
                  <div><Label>Highest Package</Label><Input value={c.highestPackage||''} onChange={(e)=> updateCourse(idx, { highestPackage: e.target.value })} /></div>
                  <div><Label>Placement Rate</Label><Input value={c.placementRate||''} onChange={(e)=> updateCourse(idx, { placementRate: e.target.value })} /></div>
                  <div className="md:col-span-3"><StringList label="Top Recruiters" values={c.placementRecruiters||[]} onChange={(v)=> updateCourse(idx, { placementRecruiters: v })} placeholder="Company"/></div>
                  <div className="flex items-end"><Button type="button" variant="destructive" size="icon" onClick={()=> removeCourse(idx)}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
