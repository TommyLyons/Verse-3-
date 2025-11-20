
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'studioBookings') : null),
    [firestore]
  );

  const userBookingsQuery = useMemoFirebase(() => {
    if (!user || !bookingsCollection) return null;
    return query(
      bookingsCollection,
      where('userId', '==', user.uid),
      where('bookingDateTime', '>=', Timestamp.now())
    );
  }, [user, bookingsCollection]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection(userBookingsQuery);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (isUserLoading) {
    return (
        <div className="container py-12 md:py-24">
            <Skeleton className="h-10 w-24 mb-8" />
             <div className="flex justify-center items-center h-64">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="container py-12 md:py-24 text-center">
            <h2 className="text-2xl font-bold">Please sign in</h2>
            <p className="text-muted-foreground mt-2">You need to be signed in to view your profile and bookings.</p>
            <Button asChild className='mt-4'>
                <Link href="/booking">Sign In</Link>
            </Button>
        </div>
    )
  }


  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              {isUserLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
              )}
              <CardTitle>
                {isUserLoading ? <Skeleton className="h-6 w-32" /> : user?.displayName}
              </CardTitle>
              <CardDescription>
                {isUserLoading ? <Skeleton className="h-4 w-40" /> : user?.email}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Upcoming Bookings</CardTitle>
              <CardDescription>
                Here are the studio sessions you have scheduled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <ul className="space-y-4">
                  {bookings
                    .sort((a, b) => a.bookingDateTime.toMillis() - b.bookingDateTime.toMillis())
                    .map((booking) => (
                      <li key={booking.id} className="p-4 border rounded-md bg-muted/50">
                        <p className="font-semibold">
                          {format(booking.bookingDateTime.toDate(), 'EEEE, MMMM do, yyyy')}
                        </p>
                        <p className="text-muted-foreground">
                          {format(booking.bookingDateTime.toDate(), 'p')} -{' '}
                          {format(
                            new Date(
                              booking.bookingDateTime.toDate().getTime() +
                                booking.durationMinutes * 60000
                            ),
                            'p'
                          )}
                        </p>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">You have no upcoming bookings.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
