"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Send,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Save,
  X
} from "lucide-react";
import { EMAIL_CATEGORIES, EMAIL_VARIABLES } from "@/lib/email/templates";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    category: "welcome",
    variables: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Simulate API call
      const mockTemplates: EmailTemplate[] = [
        {
          id: "1",
          name: "Welcome Email",
          subject: "Welcome to CareerBox, {{userName}}!",
          content: "<h1>Welcome to CareerBox!</h1><p>Hi {{userName}}, welcome to our platform!</p>",
          category: "welcome",
          variables: ["userName", "profileUrl"],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        },
        {
          id: "2",
          name: "Payment Confirmation",
          subject: "Payment Confirmation - {{planType}} Subscription",
          content: "<h1>Payment Confirmed!</h1><p>Your payment for {{planType}} has been processed.</p>",
          category: "transactional",
          variables: ["userName", "planType", "amount"],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = async () => {
    try {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        category: formData.category,
        variables: formData.variables,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      setTemplates([...templates, newTemplate]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const updatedTemplate = {
        ...selectedTemplate,
        ...formData,
        updatedAt: new Date(),
        version: selectedTemplate.version + 1
      };

      setTemplates(templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
      setSelectedTemplate(null);
      resetForm();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      content: "",
      category: "welcome",
      variables: []
    });
  };

  const openEditForm = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
      variables: template.variables
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'welcome':
        return <Users className="h-4 w-4" />;
      case 'transactional':
        return <FileText className="h-4 w-4" />;
      case 'marketing':
        return <TrendingUp className="h-4 w-4" />;
      case 'administrative':
        return <Settings className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome':
        return 'bg-blue-100 text-blue-800';
      case 'transactional':
        return 'bg-green-100 text-green-800';
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      case 'administrative':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Email Template Manager</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Template Manager</h2>
          <p className="text-muted-foreground">Create and manage email templates for your platform</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a new email template with customizable content and variables
              </DialogDescription>
            </DialogHeader>
            <EmailTemplateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateTemplate}
              onCancel={() => {
                setShowCreateForm(false);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Welcome Templates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.category === 'welcome').length}
            </div>
            <p className="text-xs text-muted-foreground">
              User onboarding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactional</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.category === 'transactional').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Payment & confirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.category === 'marketing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Promotional emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(EMAIL_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Manage your email templates and their content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        v{template.version} • Updated {template.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(template.category)}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(template.category)}
                        {template.category}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {template.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
              <DialogDescription>
                Update the email template content and settings
              </DialogDescription>
            </DialogHeader>
            <EmailTemplateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateTemplate}
              onCancel={() => {
                setSelectedTemplate(null);
                resetForm();
              }}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {selectedTemplate && showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>
                Preview how the email template will look
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {selectedTemplate.subject}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div 
                  className="p-4 border rounded-md min-h-64"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Email Template Form Component
function EmailTemplateForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [selectedVariables, setSelectedVariables] = useState<string[]>(formData.variables);

  const handleVariableToggle = (variable: string) => {
    const newVariables = selectedVariables.includes(variable)
      ? selectedVariables.filter(v => v !== variable)
      : [...selectedVariables, variable];
    
    setSelectedVariables(newVariables);
    setFormData({ ...formData, variables: newVariables });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EMAIL_CATEGORIES).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Enter email subject (use {{variableName}} for dynamic content)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Email Content (HTML)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter HTML content for the email"
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label>Available Variables</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(EMAIL_VARIABLES).map(([key, value]) => (
            <Button
              key={key}
              variant={selectedVariables.includes(value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVariableToggle(value)}
              className="justify-start"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}
