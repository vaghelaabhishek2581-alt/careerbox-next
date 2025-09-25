"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { uploadDocument, removeDocument, DocumentInfo } from "@/lib/redux/slices/instituteSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  Download,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const DOCUMENT_TYPES = [
  { value: "pan_card", label: "PAN Card" },
  { value: "gst_certificate", label: "GST Certificate" },
  { value: "cin_certificate", label: "CIN (Corporate Identity Number) / Organization Registration Number" },
  { value: "tan_number", label: "TAN Number" },
  { value: "trade_license", label: "Trade License" },
  { value: "msme_certificate", label: "MSME Certificate" },
  { value: "import_export_certificate", label: "Import Export Certificate" },
  { value: "affiliation_certificate", label: "Affiliation Certificate from Board/University" },
  { value: "aicte_approval", label: "AICTE/UGC Approval (for Higher Education)" },
  { value: "noc_government", label: "NOC from State Government" },
  { value: "trust_registration", label: "Trust/Society Registration Certificate" },
  { value: "building_safety", label: "Building Safety Certificate" },
  { value: "fire_safety", label: "Fire Safety Certificate" },
  { value: "naac_accreditation", label: "NAAC Accreditation Certificate" },
  { value: "nba_accreditation", label: "NBA Accreditation (for Technical Courses)" },
  { value: "iso_certification", label: "ISO Certification" },
  { value: "recognition_certificates", label: "Recognition Certificates from Regulatory Bodies" },
  { value: "annual_compliance", label: "Annual Compliance Reports" },
  { value: "environmental_clearance", label: "Environmental Clearance Certificate" },
  { value: "sanitation_health", label: "Sanitation & Health Certificates" },
  { value: "infrastructure_compliance", label: "Infrastructure Compliance Report" }
];

export default function DocumentManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { documents, loading } = useSelector((state: RootState) => state.institute);
  
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null, documentType?: string) => {
    if (!files || files.length === 0) return;
    
    const type = documentType || selectedDocumentType;
    if (!type) {
      alert("Please select a document type first");
      return;
    }

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only PDF, JPG, PNG, or GIF files");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      await dispatch(uploadDocument({ type, file })).unwrap();
      setSelectedDocumentType("");
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      dispatch(removeDocument(documentId));
    }
  };

  const getStatusIcon = (status: DocumentInfo['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: DocumentInfo['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  // Group documents by category
  const essentialDocs = documents.filter(doc => 
    ['pan_card', 'gst_certificate', 'cin_certificate', 'tan_number', 'trade_license', 'msme_certificate'].includes(doc.type)
  );
  
  const accreditationDocs = documents.filter(doc => 
    ['naac_accreditation', 'nba_accreditation', 'iso_certification', 'recognition_certificates'].includes(doc.type)
  );
  
  const complianceDocs = documents.filter(doc => 
    ['annual_compliance', 'environmental_clearance', 'sanitation_health', 'infrastructure_compliance'].includes(doc.type)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <FileText className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600">Upload and manage required documents</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>
            Select document type and upload files (PDF, JPG, PNG, GIF - Max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Document Type</label>
              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose document type" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 mb-4">
              PDF, JPG, PNG, GIF up to 5MB
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Button 
              type="button" 
              variant="outline"
              disabled={!selectedDocumentType || loading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Essential Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Essential Documents</CardTitle>
            <CardDescription>Basic registration and legal documents</CardDescription>
          </CardHeader>
          <CardContent>
            {essentialDocs.length > 0 ? (
              <div className="space-y-3">
                {essentialDocs.map((doc) => (
                  <div key={doc.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium truncate">
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No essential documents uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accreditation Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accreditation & Recognition</CardTitle>
            <CardDescription>Quality certifications and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {accreditationDocs.length > 0 ? (
              <div className="space-y-3">
                {accreditationDocs.map((doc) => (
                  <div key={doc.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium truncate">
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No accreditation documents uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Documents</CardTitle>
            <CardDescription>Safety and regulatory compliance</CardDescription>
          </CardHeader>
          <CardContent>
            {complianceDocs.length > 0 ? (
              <div className="space-y-3">
                {complianceDocs.map((doc) => (
                  <div key={doc.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium truncate">
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No compliance documents uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Document Completion Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Essential Documents</span>
                <span>{essentialDocs.length}/6</span>
              </div>
              <Progress value={(essentialDocs.length / 6) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Accreditation</span>
                <span>{accreditationDocs.length}/4</span>
              </div>
              <Progress value={(accreditationDocs.length / 4) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Compliance</span>
                <span>{complianceDocs.length}/4</span>
              </div>
              <Progress value={(complianceDocs.length / 4) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
