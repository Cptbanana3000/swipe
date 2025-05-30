// swipe/packages/client/src/components/ProjectFormModal.tsx
import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Corrected import path
import { projectFormSchema, type ProjectFormValues } from '@/lib/schemas/profile.schemas'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: ProjectFormValues) => void;
  initialData?: Partial<ProjectFormValues> | null;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '', description: '', technologies: [], projectUrl: '', repositoryUrl: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        technologies: initialData?.technologies || [], // Ensure array default
        projectUrl: initialData?.projectUrl || '',
        repositoryUrl: initialData?.repositoryUrl || '',
        _id: initialData?._id
      });
    }
  }, [initialData, isOpen, form.reset]);

  const onSubmit: SubmitHandler<ProjectFormValues> = (values) => {
    const dataToSave: ProjectFormValues = {
      ...values,
      technologies: values.technologies || [], // Ensure always an array
    };
    onSave(dataToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData?.title ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>Showcase one of your projects. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="e.g., My Awesome App" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea placeholder="A brief summary..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="technologies" render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used (comma-separated)</FormLabel>
                  <FormControl><Input placeholder="e.g., React, Node.js" value={Array.isArray(field.value) ? field.value.join(', ') : ''} onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="projectUrl" render={({ field }) => ( <FormItem><FormLabel>Live Project URL (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="repositoryUrl" render={({ field }) => ( <FormItem><FormLabel>Code Repository URL (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://github.com/..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (initialData?.title ? 'Save Changes' : 'Add Project')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormModal;