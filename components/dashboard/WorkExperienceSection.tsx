import React, { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { deleteWorkExperience } from "@/lib/redux/slices/profileSlice";
import type { IProfile, IWorkExperience, IWorkPosition } from "@/lib/redux/slices/profileSlice";
import { WorkExperienceDisplay } from "@/components/profile/workExperience";

interface WorkExperienceSectionProps {
  profile: IProfile;
  onAdd: () => void;
  onEdit: (experience: IWorkExperience, editingPositionId?: string) => void;
  onEditPosition?: (experience: IWorkExperience, position: IWorkPosition) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ 
  profile, 
  onAdd, 
  onEdit,
  onEditPosition
}) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lastPositionDialogOpen, setLastPositionDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'experience' | 'position' | 'lastPosition';
    experienceId: string;
    positionId?: string;
    experienceName?: string;
    positionTitle?: string;
  } | null>(null);

  const handleDeleteExperience = async (experienceId: string) => {
    try {
      await dispatch(deleteWorkExperience(experienceId)).unwrap();
      // Success toast and optimistic updates are now handled by the thunk
    } catch (error) {
      console.error('Failed to delete work experience:', error);
      // Error toast and rollback are now handled by the thunk
    }
  };

  const handleDeletePosition = async (experienceId: string, positionId: string) => {
    // For now, we'll need to implement position-specific deletion in the Redux slice
    // This is a TODO item as the current slice only handles full experience deletion
    toast({
      title: "Feature Coming Soon",
      description: "Individual position deletion will be available soon. Please edit the experience to remove positions.",
      variant: "default",
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'experience') {
      await handleDeleteExperience(deleteTarget.experienceId);
    } else if (deleteTarget.type === 'position' && deleteTarget.positionId) {
      await handleDeletePosition(deleteTarget.experienceId, deleteTarget.positionId);
    }

    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const confirmDeleteLastPosition = async () => {
    if (!deleteTarget) return;

    // Deleting the last position means deleting the entire experience
    await handleDeleteExperience(deleteTarget.experienceId);

    setLastPositionDialogOpen(false);
    setDeleteTarget(null);
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-gray-600" />
            Work Experience
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {profile?.workExperiences && profile.workExperiences.length > 0 ? (
            // Sort work experiences by most recent position start date
            [...profile.workExperiences]
              .sort((a, b) => {
                // Get the most recent position from each experience
                const getMostRecentDate = (exp: IWorkExperience) => {
                  const sortedPositions = [...exp.positions].sort((pos1, pos2) => {
                    const date1 = new Date(pos1.startDate);
                    const date2 = new Date(pos2.startDate);
                    return date2.getTime() - date1.getTime();
                  });
                  return new Date(sortedPositions[0]?.startDate || 0);
                };
                
                const dateA = getMostRecentDate(a);
                const dateB = getMostRecentDate(b);
                return dateB.getTime() - dateA.getTime();
              })
              .map((experience: IWorkExperience) => (
              <WorkExperienceDisplay
                key={experience.id}
                experience={experience}
                onEdit={onEdit}
                onEditPosition={(experience, position) => {
                  // Pass the full experience and the position ID to edit
                  onEdit(experience, position.id);
                }}
                onDeleteExperience={(experienceId, experienceName) => {
                  setDeleteTarget({
                    type: 'experience',
                    experienceId,
                    experienceName
                  });
                  setDeleteDialogOpen(true);
                }}
                onDeletePosition={(experienceId, positionId, experienceName, positionTitle) => {
                  setDeleteTarget({
                    type: 'position',
                    experienceId,
                    positionId,
                    experienceName,
                    positionTitle
                  });
                  setDeleteDialogOpen(true);
                }}
                onDeleteLastPosition={(experienceId, positionId, experienceName, positionTitle) => {
                  setDeleteTarget({
                    type: 'lastPosition',
                    experienceId,
                    positionId,
                    experienceName,
                    positionTitle
                  });
                  setLastPositionDialogOpen(true);
                }}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No work experience added yet.
            </p>
          )}
        </div>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'experience' 
                ? `This will permanently delete the work experience at "${deleteTarget.experienceName}" and all its positions. This action cannot be undone.`
                : `This will permanently delete the position "${deleteTarget?.positionTitle}" at "${deleteTarget?.experienceName}". This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Last Position Delete Confirmation Dialog */}
      <AlertDialog open={lastPositionDialogOpen} onOpenChange={setLastPositionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Last Position</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete the last position "{deleteTarget?.positionTitle}" at "{deleteTarget?.experienceName}". 
              This will remove the entire work experience entry as well.
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLastPosition}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Experience
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
