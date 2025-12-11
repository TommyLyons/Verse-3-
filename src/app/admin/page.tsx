
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, ExternalLink, FileAudio, FileImage, Terminal } from 'lucide-react';
import { format } from 'date-fns';

const adminEmail = 'verse3records@gmail.com';

const MusicSubmissions = () => {
    const firestore = useFirestore();
    const submissionsQuery = useMemoFirebase(() => collection(firestore, 'demoSubmissions'), [firestore]);
    const { data: submissions, isLoading, error } = useCollection(submissionsQuery);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Submissions</AlertTitle>
                <AlertDescription>
                    There was a problem fetching the music submissions. Please check your connection and security rules.
                </AlertDescription>
            </Alert>
        )
    }

    if (!submissions || submissions.length === 0) {
        return <p className="text-muted-foreground">No demo submissions yet.</p>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Music Submissions</CardTitle>
                <CardDescription>Review demos and EPs uploaded by artists.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Artist</TableHead>
                            <TableHead>Track Title</TableHead>
                            <TableHead>Submitted On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission: any) => (
                            <TableRow key={submission.id}>
                                <TableCell>
                                    <div className="font-medium">{submission.artistName}</div>
                                    <div className="text-sm text-muted-foreground">{submission.artistEmail}</div>
                                </TableCell>
                                <TableCell>{submission.trackTitle}</TableCell>
                                <TableCell>
                                    {submission.submittedAt ? format(submission.submittedAt.toDate(), 'PPP') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {submission.audioUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={submission.audioUrl} target="_blank" rel="noopener noreferrer">
                                                <FileAudio className="mr-2 h-4 w-4" /> Audio
                                            </a>
                                        </Button>
                                    )}
                                    {submission.imageUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={submission.imageUrl} target="_blank" rel="noopener noreferrer">
                                                <FileImage className="mr-2 h-4 w-4" /> Art
                                            </a>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

const SalesDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Dashboard</CardTitle>
                <CardDescription>Analytics for merchandise and record sales.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Sales Data Coming Soon</h3>
                    <p className="text-muted-foreground mt-2">
                        E-commerce functionality is not yet implemented. Once sales data is available, you will see it here.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user?.email !== adminEmail) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user?.email !== adminEmail) {
        return (
            <div className="container py-12 md:py-24 text-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-24">
            <div className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome, {user.displayName}.</p>
            </div>

            <div className="grid gap-8">
                <MusicSubmissions />
                <SalesDashboard />
            </div>
        </div>
    )
}
