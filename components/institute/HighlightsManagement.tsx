"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { addHighlight, removeHighlight, updateHighlight, Highlight } from "@/lib/redux/slices/instituteSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Star, 
  Users, 
  Award, 
  TrendingUp, 
  Edit, 
  Trash2, 
  GraduationCap,
  Building2
} from "lucide-react";

const HIGHLIGHT_ICONS = {
  students: Users,
  rating: Star,
  awards: Award,
  growth: TrendingUp,
  graduation: GraduationCap,
  infrastructure: Building2,
};

export default function HighlightsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { highlights, loading } = useSelector((state: RootState) => state.institute);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    description: "",
    example: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      value: "",
      description: "",
      example: "",
    });
    setEditingHighlight(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingHighlight) {
        await dispatch(updateHighlight({
          ...editingHighlight,
          ...formData
        })).unwrap();
      } else {
        await dispatch(addHighlight(formData)).unwrap();
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save highlight:", error);
    }
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setFormData({
      title: highlight.title,
      value: highlight.value,
      description: highlight.description,
      example: highlight.example,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (highlightId: string) => {
    if (confirm("Are you sure you want to delete this highlight?")) {
      dispatch(removeHighlight(highlightId));
    }
  };

  const getHighlightIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('student')) return HIGHLIGHT_ICONS.students;
    if (lowerTitle.includes('rating') || lowerTitle.includes('grade')) return HIGHLIGHT_ICONS.rating;
    if (lowerTitle.includes('award') || lowerTitle.includes('patent')) return HIGHLIGHT_ICONS.awards;
    if (lowerTitle.includes('year') || lowerTitle.includes('experience')) return HIGHLIGHT_ICONS.growth;
    if (lowerTitle.includes('graduation') || lowerTitle.includes('placement')) return HIGHLIGHT_ICONS.graduation;
    return HIGHLIGHT_ICONS.infrastructure;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Key Highlights</h2>
            <p className="text-gray-600">Showcase your institute's achievements and statistics</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Highlight
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHighlight ? "Edit Highlight" : "Add New Highlight"}
              </DialogTitle>
              <DialogDescription>
                Add key statistics and achievements that showcase your institute's excellence.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Highlight Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Students Placed, NAAC Rating, Years of Excellence"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value/Number *</Label>
                <Input
                  id="value"
                  placeholder="e.g., 1000+, A++, 25+"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this achievement"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example/Context</Label>
                <Input
                  id="example"
                  placeholder="e.g., Students Placed, NAAC Rating"
                  value={formData.example}
                  onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingHighlight ? "Update" : "Add"} Highlight
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Highlights Grid */}
      {highlights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight) => {
            const IconComponent = getHighlightIcon(highlight.title);
            return (
              <Card key={highlight.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(highlight)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(highlight.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {highlight.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {highlight.title}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    {highlight.description}
                  </p>
                  {highlight.example && (
                    <Badge variant="secondary" className="w-full justify-center">
                      {highlight.example}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No highlights added yet</h3>
            <p className="text-gray-600 text-center mb-4 max-w-md">
              Add key statistics and achievements to showcase your institute's excellence and attract students.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Highlight
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {highlights.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Preview</CardTitle>
            <CardDescription className="text-blue-700">
              This is how your highlights will appear to visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {highlights.slice(0, 4).map((highlight) => {
                const IconComponent = getHighlightIcon(highlight.title);
                return (
                  <div key={highlight.id} className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {highlight.value}
                    </div>
                    <div className="text-xs text-blue-700">
                      {highlight.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Suggested Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
                <div>• Students Placed (1000+)</div>
                <div>• NAAC Rating (A++)</div>
                <div>• Years of Excellence (25+)</div>
                <div>• Patents Filed (50+)</div>
                <div>• Industry Partnerships (100+)</div>
                <div>• Alumni Network (5000+)</div>
                <div>• Placement Rate (95%)</div>
                <div>• Faculty with PhD (80%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
