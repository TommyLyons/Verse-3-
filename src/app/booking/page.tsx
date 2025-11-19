
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookingPage() {
  return (
    <div className="container max-w-5xl py-12 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Book The Studio</h1>
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
                className="p-0"
                classNames={{
                    caption: "text-primary",
                    head_cell: "text-muted-foreground",
                    day: "hover:bg-primary/20",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                }}
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
