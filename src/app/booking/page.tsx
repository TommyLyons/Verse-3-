
'use client';

import React from 'react';
import {
  collection,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
} from '@/firebase';
import { add, format, formatISO } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/ui/back-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

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

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

export default function BookingPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = React.useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  React.useEffect(() => {
    if (user && !form.formState.isDirty) {
      form.setValue("name", user.displayName || "");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);


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

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
  };
  
  const createGoogleCalendarLink = (bookingDateTime: Date, durationHours: number, name: string, email: string) => {
    const startTime = formatISO(bookingDateTime, { format: 'basic' }).replace(/-|:|\.\d+/g, '');
    const endTime = formatISO(add(bookingDateTime, { hours: durationHours }), { format: 'basic' }).replace(/-|:|\.\d+/g, '');

    const details = `Booking confirmed for: ${name} (${email}).`;
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Studio+Booking: ${name}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=Verse3+Records`;
  };

  function onSubmit(values: BookingFormValues) {
    if (!date || !selectedSlot) return;

    const bookingDateTime = new Date(date);
    const [hours, minutes] = selectedSlot.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const newBooking: any = {
      ...values,
      bookingDateTime: Timestamp.fromDate(bookingDateTime),
      durationMinutes: sessionDurationHours * 60,
      status: 'confirmed',
    };
    
    if (user) {
      newBooking.userId = user.uid;
    }

    if (bookingsCollection) {
      addDocumentNonBlocking(bookingsCollection, newBooking);
      
      const googleCalendarLink = createGoogleCalendarLink(bookingDateTime, sessionDurationHours, values.name, values.email);
      const emailBody = `
A new booking has been made:
Name: ${values.name}
Email: ${values.email}
Phone: ${values.phone || 'Not provided'}
Date: ${format(bookingDateTime, 'MMMM do, yyyy')}
Time: ${selectedSlot}

Add to Google Calendar: ${googleCalendarLink}
      `;

      const mailtoLink = `mailto:lofty@verse3.com?subject=${encodeURIComponent(`New Studio Booking: ${values.name} on ${format(bookingDateTime, 'MMMM do')}`)}&body=${encodeURIComponent(emailBody)}`;
      
      window.open(mailtoLink, '_blank');
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your session is booked. A confirmation email has been prepared for you to send.`,
      });
    }

    setIsBookingDialogOpen(false);
    setSelectedSlot(null);
    form.reset();
  }

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
                    const slotDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(slot.split(':')[0]), parseInt(slot.split(':')[1]));
                    const isBooked = bookedSlots.includes(slot);
                    const isPast = slotDateTime < new Date();
                    const isDisabled = isBooked || isPast || bookingsLoading;

                    return (
                      <Button
                        key={slot}
                        variant={'outline'}
                        className="w-full justify-start"
                        disabled={isDisabled}
                        onClick={() => handleSlotSelect(slot)}
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
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>
              You are booking a {sessionDurationHours}-hour session on{' '}
              {date && format(date, 'MMMM do, yyyy')} at {selectedSlot}. Please provide your details to reserve the slot.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Confirm Booking</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
