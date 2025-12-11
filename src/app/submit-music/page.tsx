
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/ui/back-button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, CheckCircle } from 'lucide-react';

const submissionFormSchema = z.object({
  artistName: z.string().min(2, { message: 'Artist name is required.' }),
  artistEmail: z.string().email({ message: 'A valid email is required.' }),
  trackTitle: z.string().min(2, { message: 'Track title is required.' }),
  message: z.string().optional(),
  audioFile: z.any().refine((files) => files?.length === 1, 'Audio file is required.'),
  imageFile: z.any().optional(),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

export default function SubmitMusicPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = getStorage();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      artistName: '',
      artistEmail: '',
      trackTitle: '',
      message: '',
    },
  });

  const handleFileUpload = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const onSubmit = async (values: SubmissionFormValues) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const audioFile = values.audioFile[0] as File;
      const audioPath = `demoSubmissions/audio/${Date.now()}_${audioFile.name}`;
      const audioUrl = await handleFileUpload(audioFile, audioPath);

      let imageUrl: string | undefined = undefined;
      if (values.imageFile && values.imageFile.length > 0) {
        const imageFile = values.imageFile[0] as File;
        const imagePath = `demoSubmissions/images/${Date.now()}_${imageFile.name}`;
        imageUrl = await handleFileUpload(imageFile, imagePath);
      }
      
      const submissionsCollection = collection(firestore, 'demoSubmissions');

      const submissionData = {
        artistName: values.artistName,
        artistEmail: values.artistEmail,
        trackTitle: values.trackTitle,
        message: values.message || '',
        audioUrl,
        imageUrl: imageUrl || '',
        submittedAt: serverTimestamp(),
      };

      addDocumentNonBlocking(submissionsCollection, submissionData);

      toast({
        title: 'Submission successful!',
        description: "Thank you for sharing your music with us. We'll be in touch.",
      });

      setSubmissionComplete(true);
      form.reset();

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your submission. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (submissionComplete) {
    return (
        <div className="container py-12 md:py-24 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">Thank You!</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">Your demo has been successfully submitted. We appreciate you sharing your talent with Verse3 Records.</p>
            <Button onClick={() => setSubmissionComplete(false)}>Submit Another Demo</Button>
        </div>
    )
  }

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Submit Your Music</CardTitle>
          <CardDescription>
            We are always looking for fresh sounds. Upload your demo or EP below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="artistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist / Band Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Synthwave Kid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="artistEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="trackTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Track or EP Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Echoes in Rain" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about yourself and your music..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="audioFile"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Audio File (MP3, WAV, etc.)</FormLabel>
                        <FormControl>
                            <Input type="file" accept="audio/*" onChange={(e) => field.onChange(e.target.files)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cover Art (Optional)</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

              {isSubmitting && uploadProgress !== null && (
                <div className='space-y-2'>
                    <p className='text-sm text-muted-foreground'>Uploading... Do not close this window.</p>
                    <Progress value={uploadProgress} />
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit Demo'}
                <UploadCloud className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}