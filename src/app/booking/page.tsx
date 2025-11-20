
'use client';

import React from 'react';
import {
  collection,
  doc,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
} from '@/firebase';
import { add, format, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/ui/back-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { useAuth } from '@/firebase';

const timeSlots = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];
const sessionDurationHours = 2;

export default function BookingPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const bookingsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'studioBookings') : null),
    [firestore]
  );

  const bookingsQuery = useMemoFirebase(() => {
    if (!date || !bookingsCollection) return null;
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    return query(
      bookingsCollection,
      where('bookingDateTime', '>=', Timestamp.fromDate(startOfDay)),
      where('bookingDateTime', '<=', Timestamp.fromDate(endOfDay))
    );
  }, [date, bookingsCollection]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);

  const bookedSlots = React.useMemo(() => {
    return (
      bookings?.map((booking) =>
        format(booking.bookingDateTime.toDate(), 'HH:mm')
      ) || []
    );
  }, [bookings]);

  const handleBooking = async () => {
    if (!user || !date || !selectedSlot) return;

    const bookingDateTime = new Date(date);
    const [hours, minutes] = selectedSlot.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const newBooking = {
      userId: user.uid,
      bookingDateTime: Timestamp.fromDate(bookingDateTime),
      durationMinutes: sessionDurationHours * 60,
      status: 'confirmed',
    };

    if (bookingsCollection) {
      addDocumentNonBlocking(bookingsCollection, newBooking);
      toast({
        title: 'Booking Confirmed!',
        description: `Your session is booked for ${format(
          bookingDateTime,
          'MMMM do, yyyy'
        )} at ${selectedSlot}.`,
      });
    }

    setSelectedSlot(null);
    setShowConfirmation(false);
  };
  
  const handleGoogleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };


  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-2">
          Book The Studio
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Find an open slot in our calendar and book your next session. We can&apos;t wait to hear
          what you create.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                classNames={{
                  caption_label: 'flex items-center text-sm font-medium',
                  caption_dropdowns: 'flex items-center gap-2',
                  vhidden: 'hidden',
                  caption: 'text-primary flex justify-center pt-1 relative items-center',
                  head_cell: 'text-muted-foreground',
                  day: 'hover:bg-primary/20',
                  day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                }}
                fromDate={new Date()}
                toDate={add(new Date(), { months: 2 })}
                captionLayout="dropdown-buttons"
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Times</CardTitle>
              <CardDescription>
                {date ? format(date, 'MMMM do, yyyy') : 'Please select a date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {date ? (
                <div className="space-y-2">
                  {timeSlots.map((slot) => {
                    const slotDateTime = set(date, {
                      hours: parseInt(slot.split(':')[0]),
                      minutes: parseInt(slot.split(':')[1]),
                    });
                    const isBooked = bookedSlots.includes(slot);
                    const isPast = slotDateTime < new Date();
                    const isDisabled = isBooked || isPast || bookingsLoading;

                    return (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? 'default' : 'outline'}
                        className="w-full justify-start"
                        disabled={isDisabled}
                        onClick={() => {
                          if (user) {
                            setSelectedSlot(slot);
                            setShowConfirmation(true);
                          } else {
                            handleGoogleSignIn();
                          }
                        }}
                      >
                        {slot} - {format(add(slotDateTime, { hours: sessionDurationHours }), 'HH:mm')}
                        {isBooked && <span className="ml-auto text-xs text-destructive">Booked</span>}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">
                  Please select a date to see available time slots.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your booking</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to book a {sessionDurationHours}-hour session on{' '}
              {date && format(date, 'MMMM do, yyyy')} at {selectedSlot}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBooking}>Confirm Booking</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
