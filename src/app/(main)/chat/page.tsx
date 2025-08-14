
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Menu, Paperclip, Send } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: Timestamp;
}

export default function ChatPage() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const msgs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(msgs);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch messages.',
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        sender: user.displayName || 'Anonymous',
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message.',
        variant: 'destructive',
      });
    }
  };

  const sidebarContent = (
    <>
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
    </>
  );

  return (
    <div className="grid h-[calc(100vh-theme(spacing.16))] md:grid-cols-[280px_1fr]">
      <div className="hidden md:flex flex-col border-r bg-background">
        {sidebarContent}
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open channels and users menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-full max-w-sm">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold"># general</h1>
        </header>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-4 ${
                  msg.senderId === user?.uid ? 'justify-end' : ''
                }`}
              >
                {msg.senderId !== user?.uid && (
                  <Avatar>
                    <AvatarImage src={'https://placehold.co/32x32.png'} data-ai-hint="avatar" />
                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-xs sm:max-w-md md:max-w-lg ${
                    msg.senderId === user?.uid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="font-semibold">{msg.senderId === user?.uid ? 'You' : msg.sender}</p>
                  <p className="break-words">{msg.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {msg.timestamp?.toDate().toLocaleTimeString()}
                  </p>
                </div>
                {msg.senderId === user?.uid && (
                  <Avatar>
                    <AvatarImage src={'https://placehold.co/32x32.png'} data-ai-hint="avatar" />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t bg-background p-4">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              placeholder="Type a message..."
              className="pr-20"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
              <Button variant="ghost" size="icon" type="button">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" type="submit">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
