import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';

export default function ChatPage() {
  const channels = ['# general', '# announcements', '# random'];
  const teachers = [
    { name: 'Mr. Smith', online: true },
    { name: 'Mrs. Jones', online: false },
    { name: 'Mr. Williams', online: true },
  ];
  const students = [
    { name: 'Alice', online: true },
    { name: 'Bob', online: false },
    { name: 'Charlie', online: true },
  ];

  const messages = [
    {
      sender: 'Mr. Smith',
      avatar: 'https://placehold.co/32x32.png',
      message:
        "Hello class, just a reminder that your projects are due this Friday. Please make sure to submit them on time. Let me know if you have any questions!",
      timestamp: '2:15 PM',
    },
    {
      sender: 'Alice',
      avatar: 'https://placehold.co/32x32.png',
      message: 'Thanks for the reminder, Mr. Smith!',
      timestamp: '2:16 PM',
    },
    {
      sender: 'You',
      avatar: 'https://placehold.co/32x32.png',
      message: 'Got it. I should be able to finish it tonight.',
      timestamp: '2:17 PM',
    },
  ];

  return (
    <div className="grid h-[calc(100vh-theme(spacing.16))] grid-cols-[280px_1fr]">
      <div className="flex flex-col border-r bg-background">
        <Card className="border-0 border-b rounded-none">
          <CardHeader>
            <CardTitle>Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid gap-2">
              {channels.map((channel) => (
                <Button key={channel} variant="ghost" className="justify-start">
                  {channel}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
        <div className="flex-1 overflow-auto p-4">
          <h3 className="mb-2 text-lg font-semibold">Teachers</h3>
          <div className="grid gap-2">
            {teachers.map((teacher) => (
              <Button
                key={teacher.name}
                variant="ghost"
                className="justify-start gap-2"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    teacher.online ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                {teacher.name}
              </Button>
            ))}
          </div>
          <h3 className="mb-2 mt-4 text-lg font-semibold">Students</h3>
          <div className="grid gap-2">
            {students.map((student) => (
              <Button
                key={student.name}
                variant="ghost"
                className="justify-start gap-2"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    student.online ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                {student.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  msg.sender === 'You' ? 'justify-end' : ''
                }`}
              >
                {msg.sender !== 'You' && (
                  <Avatar>
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 ${
                    msg.sender === 'You'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="font-semibold">{msg.sender}</p>
                  <p>{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {msg.timestamp}
                  </p>
                </div>
                {msg.sender === 'You' && (
                  <Avatar>
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t bg-background p-4">
          <div className="relative">
            <Input
              placeholder="Type a message..."
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
