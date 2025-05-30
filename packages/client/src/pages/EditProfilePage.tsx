// swipe/packages/client/src/pages/EditProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from '@swipe/shared'; // Keep this for the API call type
import { getMyProfile, updateMyProfile } from '@/services/userService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray, type SubmitHandler, type FieldArrayWithId } from 'react-hook-form'; // Removed Controller as it wasn't explicitly used directly
import { zodResolver } from '@hookform/resolvers/zod';
// Corrected import path for profile-specific schemas

import ProjectFormModal from '@/components/ProjectFormModal';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { z } from 'zod';

const experienceLevels = [
  "Entry-Level (0-1 year)", "Junior (1-3 years)", "Mid-Level (3-5 years)", "Senior (5+ years)", "Expert (10+ years)"
];

import { editProfileFormSchema, type EditProfileFormValues, type ProjectFormValues, createDefaultFormValues } from '../lib/schemas/profile.schemas';

const EditProfilePage = () => {
  const { token, markProfileSetupComplete } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProjectDataForModal, setCurrentProjectDataForModal] = useState<Partial<ProjectFormValues> | null>(null);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      ...createDefaultFormValues(),
      socialLinks: {
        linkedin: '',
        github: '',
        website: ''
      }
    },
  });

  

  const { fields: projectFields, append, remove, update } = useFieldArray({
      control: form.control,
      name: "projects"
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        setIsProfileLoading(true);
        try {
          const currentProfile = await getMyProfile();
          const loadedProjects = (currentProfile.projects || []).slice(0, 3).map((p): ProjectFormValues => ({
            _id: p._id,
            title: p.title || '',
            description: p.description || '',
            technologies: p.technologies || [],
            projectUrl: p.projectUrl || '',
            repositoryUrl: p.repositoryUrl || '',
          }));
          
          form.reset({
            firstName: currentProfile.firstName || '',
            lastName: currentProfile.lastName || '',
            headline: currentProfile.headline || '',
            bio: currentProfile.bio || '',
            skills: currentProfile.skills || [],
            projects: loadedProjects,
            experienceLevel: currentProfile.experienceLevel || '',
            hourlyRate: currentProfile.hourlyRate === null || currentProfile.hourlyRate === undefined ? undefined : Number(currentProfile.hourlyRate),
            availability: currentProfile.availability || '',
            companyName: currentProfile.companyName || '',
            companyWebsite: currentProfile.companyWebsite || '',
            socialLinks: currentProfile.socialLinks || { linkedin: '', github: '', website: '' },
          });
        } catch (err: any) {
          toast.error(err.message || "Failed to load profile data.");
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [token, form.reset]);

  const handleProjectSave = (projectDataFromModal: ProjectFormValues) => {
    const projectToProcess: ProjectFormValues = {
        ...projectDataFromModal,
        technologies: projectDataFromModal.technologies || []
    };
    if (editingProjectIndex !== null) {
      update(editingProjectIndex, projectToProcess);
    } else {
      if (projectFields.length < 3) {
        append(projectToProcess);
      } else {
        toast.error("You can only add up to 3 projects.");
        return;
      }
    }
    setIsModalOpen(false);
    setEditingProjectIndex(null);
    setCurrentProjectDataForModal(null);
  };

  const openProjectModalForEdit = (index: number) => {
    const projectToEdit = form.getValues('projects')?.[index];
    if (projectToEdit) {
      setCurrentProjectDataForModal({ ...projectToEdit, technologies: projectToEdit.technologies || [] });
      setEditingProjectIndex(index);
      setIsModalOpen(true);
    }
  };

  const openProjectModalForAdd = () => {
    if (projectFields.length < 3) {
      setCurrentProjectDataForModal({ title: '', description: '', technologies: [], projectUrl: '', repositoryUrl: '' });
      setEditingProjectIndex(null);
      setIsModalOpen(true);
    } else {
      toast.info("Maximum of 3 projects reached.");
    }
  };

  const handleRemoveProject = (index: number) => { remove(index); };

  const onSubmit: SubmitHandler<EditProfileFormValues> = async (values) => {
    form.clearErrors("root.apiError");
    try {
      const dataToSubmit = {
        ...values,
        skills: values.skills || [],
        projects: (values.projects || []).map(p => ({
            ...p,
            technologies: p.technologies || []
        })).filter(p => p.title?.trim() || p.description?.trim()),
        hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : undefined,
      };
      await updateMyProfile(dataToSubmit as Partial<UserProfile>);
      markProfileSetupComplete?.();
      toast.success("Profile Updated Successfully!");
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
      form.setError("root.apiError", { type: "server", message: err.message || "Failed to update profile." });
    }
  };

  if (isProfileLoading) {
    return <div className="text-center p-10">Loading your profile for editing...</div>;
  }
  
  const renderProjectFields = projectFields.map((projectFieldItem: FieldArrayWithId<EditProfileFormValues, "projects", "id">, index: number) => {
    const projectData = form.watch(`projects.${index}`);
    return (
        <Card key={projectFieldItem.id} className="p-4 relative bg-slate-50 dark:bg-slate-800">
        <div className="flex justify-between items-start">
            <div>
            <h4 className="font-semibold text-primary">{projectData?.title || `Project ${index + 1}`}</h4>
            <p className="text-sm text-muted-foreground truncate max-w-xs md:max-w-md">{projectData?.description || 'No description'}</p>
            </div>
            <div className="flex space-x-1 flex-shrink-0">
            <Button type="button" variant="ghost" size="icon" onClick={() => openProjectModalForEdit(index)} className="h-8 w-8"> <Edit2 size={16} /> </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProject(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10"> <Trash2 size={16} /> </Button>
            </div>
        </div>
        </Card>
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader><CardTitle className="text-3xl">Edit Your Profile</CardTitle><CardDescription>Showcase your best work and skills. Make it shine!</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info Section */}
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
              </div>
              <FormField control={form.control} name="headline" render={({ field }) => ( <FormItem><FormLabel>Headline</FormLabel><FormControl><Input placeholder="e.g., Passionate Full-Stack Developer" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem><FormLabel>About You / Bio</FormLabel><FormControl><Textarea placeholder="Tell everyone a bit about your skills and passion..." {...field} value={field.value || ''} rows={5} /></FormControl><FormMessage /></FormItem> )}/>

              {/* Skills & Experience Section */}
              <h3 className="text-lg font-semibold border-b pb-2 pt-4">Skills & Experience</h3>
              <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills (comma-separated)</FormLabel>
                    <FormControl><Input placeholder="e.g., React, Node.js, Figma" value={field.value?.join(', ') || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger></FormControl>
                        <SelectContent> {experienceLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)} </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (USD)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="availability" render={({ field }) => ( <FormItem><FormLabel>Availability</FormLabel><FormControl><Input placeholder="e.g., Full-time, Part-time (20hrs/week)" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
              
              {/* Projects Section */}
              <div>
                <div className="flex justify-between items-center mb-4 mt-6 border-t border-b py-4">
                  <h3 className="text-xl font-semibold">Showcase Your Projects</h3>
                  {projectFields.length < 3 && ( <Button type="button" variant="outline" size="sm" onClick={openProjectModalForAdd}> <PlusCircle size={16} className="mr-2" /> Add Project </Button> )}
                </div>
                {projectFields.length === 0 && !isProfileLoading && ( <p className="text-sm text-muted-foreground">No projects added yet. Click "Add Project" to get started (up to 3).</p> )}
                <div className="space-y-4"> {renderProjectFields} </div>
                {/* Displaying project array level errors (e.g. "max 3 projects") */}
                {form.formState.errors.projects && typeof form.formState.errors.projects.message === 'string' && (
                     <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.projects.message}</p>
                )}
              </div>
              
              <h3 className="text-lg font-semibold border-b pb-2 pt-4">Contact & Links</h3>
                <FormField control={form.control} name="socialLinks.linkedin" render={({ field }) => ( <FormItem><FormLabel>LinkedIn Profile URL</FormLabel><FormControl><Input type="url" placeholder="https://linkedin.com/in/..." {...field} value={field.value?.toString() || ''} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="socialLinks.github" render={({ field }) => ( <FormItem><FormLabel>GitHub Profile URL</FormLabel><FormControl><Input type="url" placeholder="https://github.com/..." {...field} value={field.value?.toString() || ''} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="socialLinks.website" render={({ field }) => ( <FormItem><FormLabel>Personal/Company Website URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} value={field.value?.toString() || ''} /></FormControl><FormMessage /></FormItem> )}/>

              {form.formState.errors.root?.apiError && ( <p className="text-sm font-medium text-destructive">{(form.formState.errors.root.apiError as any).message}</p> )}
              <div className="flex justify-end space-x-3 pt-8">
                <Button type="button" variant="outline" onClick={() => navigate('/profile')} disabled={form.formState.isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'} </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setCurrentProjectDataForModal(null); setEditingProjectIndex(null); }}
        onSave={handleProjectSave}
        initialData={currentProjectDataForModal}
        // projectIndex prop was removed from modal as it's not strictly needed by the modal itself
      />
    </div>
  );
};

export default EditProfilePage;