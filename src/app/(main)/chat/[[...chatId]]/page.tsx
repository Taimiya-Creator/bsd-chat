
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { Menu, Paperclip, Send } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

interface User {
    id: string;
    displayName: string;
    role: string;
    class?: number;
    online?: boolean; // You can extend this later with presence detection
}

export default function ChatPage({ params }: { params: { chatId?: string[] } }) {
  const [user, loading] = useAuthState(auth);
  const [appUser, setAppUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);

  const channelId = useMemo(() => params.chatId?.[0], [params.chatId]);
  const isDm = useMemo(() => params.chatId && params.chatId.length > 1 && params.chatId[0] === 'dm', [params.chatId]);
  const isClassChat = useMemo(() => params.chatId && params.chatId.length === 1 && params.chatId[0].startsWith('class-'), [params.chatId]);
  
  const dmPartnerId = useMemo(() => isDm ? params.chatId![1] : null, [isDm, params.chatId]);
  const dmId = useMemo(() => {
    if (!isDm || !user) return null;
    return [user.uid, dmPartnerId].sort().join('_');
  }, [isDm, user, dmPartnerId]);


  const channels = useMemo(() => {
    const baseChannels = ['general']; // Use slugs directly
    if (appUser?.class) {
      baseChannels.push(`class-${appUser.class}`);
    }
    return baseChannels;
  }, [appUser]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        redirect('/login');
        return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setAppUser({id: doc.id, ...doc.data()} as User);
        } else {
            // This might happen if the user document is not created yet
            // Or if rules deny access.
            console.log("User document not found for UID:", user.uid);
        }
    });

    const usersQuery = query(collection(db, "users"), where("uid", "!=", user.uid));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as User);
        setAllUsers(usersData);
    });

    return () => {
        unsubscribeUser();
        unsubscribeUsers();
    };
  }, [user, loading]);

  useEffect(() => {
    if (!dmPartnerId) {
      setChatPartner(null);
      return;
    }
    const partnerDocRef = doc(db, 'users', dmPartnerId);
    getDoc(partnerDocRef).then(docSnap => {
        if(docSnap.exists()){
            setChatPartner({id: docSnap.id, ...docSnap.data()} as User);
        }
    })

  }, [dmPartnerId])


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !channelId && !isDm) { // Handle general chat
        const generalMessagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(generalMessagesQuery, (querySnapshot) => {
            const msgs = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[];
            setMessages(msgs);
        });
        return () => unsubscribe();
    }

    let messagesQuery;
    if (isDm && dmId) {
        messagesQuery = query(collection(db, 'dms', dmId, 'messages'), orderBy('timestamp', 'asc'));
    } else if (isClassChat && channelId) {
        messagesQuery = query(collection(db, 'classes', channelId, 'messages'), orderBy('timestamp', 'asc'));
    } else if (channelId === 'general' || !channelId) {
        messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    } else {
        return; // No valid channel selected
    }


    const unsubscribe = onSnapshot(
      messagesQuery,
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
          description: 'Could not fetch messages. Check permissions.',
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  }, [user, toast, isDm, dmId, isClassChat, channelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messageData = {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous', 
        timestamp: serverTimestamp(),
    };

    try {
        if (isDm && dmId && dmPartnerId) {
            const dmDocRef = doc(db, 'dms', dmId);
            const dmDocSnap = await getDoc(dmDocRef);
            if(!dmDocSnap.exists()){
                await setDoc(dmDocRef, {
                    members: [user.uid, dmPartnerId],
                    lastMessage: serverTimestamp(),
                });
            }
            await addDoc(collection(db, 'dms', dmId, 'messages'), messageData);
        } else if (isClassChat && channelId) {
            const classDocRef = doc(db, 'classes', channelId);
            const classDocSnap = await getDoc(classDocRef);
            if (!classDocSnap.exists()) {
                await setDoc(classDocRef, {
                    name: channelId,
                    createdAt: serverTimestamp()
                });
            }
            await addDoc(collection(db, 'classes', channelId, 'messages'), messageData);
        } else {
             await addDoc(collection(db, 'messages'), messageData);
        }
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

  if (loading || !appUser) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  const teachers = allUsers.filter(u => u.role === 'teacher');
  const students = allUsers.filter(u => u.role === 'student');
  
  const sidebarContent = (
    <>
      <Card className="border-0 border-b rounded-none">
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid gap-2">
            {channels.map((channelSlug) => {
              const isActive = !isDm && (channelSlug === 'general' ? !channelId || channelId === 'general' : channelId === channelSlug);
              return (
                <Button asChild key={channelSlug} variant={isActive ? 'secondary' : 'ghost'} className="justify-start">
                  <Link href={`/chat/${channelSlug}`}>{`# ${channelSlug}`}</Link>
                </Button>
              )
            })}
          </nav>
        </CardContent>
      </Card>
      <div className="flex-1 overflow-auto p-4">
        <h3 className="mb-2 text-lg font-semibold">Teachers</h3>
        <div className="grid gap-2">
          {teachers.map((teacher) => (
            <Button
              asChild
              key={teacher.uid}
              variant={dmPartnerId === teacher.uid ? 'secondary' : 'ghost'}
              className="justify-start gap-2"
            >
              <Link href={`/chat/dm/${teacher.uid}`}>
                <div className="h-2 w-2 rounded-full bg-gray-500" />
                {teacher.displayName}
              </Link>
            </Button>
          ))}
        </div>
        <h3 className="mb-2 mt-4 text-lg font-semibold">Students</h3>
        <div className="grid gap-2">
          {students.map((student) => (
            <Button
              asChild
              key={student.uid}
              variant={dmPartnerId === student.uid ? 'secondary' : 'ghost'}
              className="justify-start gap-2"
            >
              <Link href={`/chat/dm/${student.uid}`}>
                <div className="h-2 w-2 rounded-full bg-gray-500" />
                {student.displayName}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </>
  );

  let currentChatName = '# general';
  if (isDm) {
    currentChatName = chatPartner?.displayName || 'Direct Message';
  } else if (isClassChat) {
    currentChatName = `# ${channelId}`;
  } else if (channelId && channelId !== 'general') {
    currentChatName = `# ${channelId}`;
  }


  return (
    <div className="grid h-[calc(100vh-theme(spacing.16))] md:grid-cols-[280px_1fr]">
      <div className="hidden md:flex flex-col border-r bg-background">
        {sidebarContent}
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
           <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open channels and users menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-full max-w-sm">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                {sidebarContent}
                </SheetContent>
            </Sheet>
           </div>
          <h1 className="text-lg font-semibold">{currentChatName}</h1>
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
                    <AvatarFallback>{msg.senderName ? msg.senderName.charAt(0) : 'A'}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-xs sm:max-w-md md:max-w-lg ${
                    msg.senderId === user?.uid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="font-semibold">{msg.senderId === user?.uid ? 'You' : msg.senderName}</p>
                  <p className="break-words">{msg.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground opacity-70">
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

    