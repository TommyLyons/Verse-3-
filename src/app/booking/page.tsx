
'use client';

import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from '@/components/ui/back-button';

export default function BookingPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="container max-w-5xl py-12 md:py-24">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Book The Studio</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Find an open slot in our calendar and book your next session. We can&apos;t wait to hear what you create.
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
                    caption_label: "flex items-center text-sm font-medium",
                    caption_dropdowns: "flex items-center gap-2",
                    vhidden: "hidden",
                    caption: "text-primary flex justify-center pt-1 relative items-center",
                    head_cell: "text-muted-foreground",
                    day: "hover:bg-primary/20",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                }}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 5}
                captionLayout="dropdown-buttons"
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Times</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Please select a date to see available time slots.</p>
              {/* Placeholder for time slots */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>10:00 AM - 12:00 PM</Button>
                <Button variant="outline" className="w-full justify-start" disabled>01:00 PM - 03:00 PM</Button>
                <Button variant="outline" className="w-full justify-start" disabled>04:00 PM - 06:00 PM</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
