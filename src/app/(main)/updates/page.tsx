import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UpdatesPage() {
  const updates = [
    {
      title: 'Parent-Teacher Conferences Next Week',
      description:
        'A reminder that parent-teacher conferences are scheduled for next week. Please sign up for a time slot if you haven’t already.',
      date: 'May 15, 2024',
      author: 'Principal Johnson',
    },
    {
      title: 'School Play "A Midsummer Night\'s Dream" this Friday!',
      description:
        'Come support our talented students in the drama club! The show starts at 7 PM in the auditorium. Tickets are $5 at the door.',
      date: 'May 12, 2024',
      author: 'Ms. Davis - Drama Club Advisor',
    },
    {
      title: 'Final Exams Schedule Released',
      description:
        'The final exam schedule for all grades has been posted. Please check the school website for details and start preparing.',
      date: 'May 10, 2024',
      author: 'Administration',
    },
  ];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>School Updates</CardTitle>
          <CardDescription>
            Important announcements and news for BSD Public School.
          </CardDescription>
        </CardHeader>
      </Card>
      {updates.map((update, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{update.title}</CardTitle>
            <CardDescription>
              {update.author} - {update.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{update.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
