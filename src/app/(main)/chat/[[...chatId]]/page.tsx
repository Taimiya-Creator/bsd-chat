
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
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
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  timestamp: Timestamp;
}

interface ChatUser {
    id: string;
    displayName: string;
    role: string;
    class?: number;
    photoURL?: string;
}

export default function ChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.chatId) ? params.chatId : params.chatId ? [params.chatId] : [];
  const [user, loading] = useAuthState(auth);
  const { user: appUser, isLoading: appUserLoading } = useUser();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [chatPartner, setChatPartner] = useState<ChatUser | null>(null);

  const channelId = useMemo(() => chatId?.[0], [chatId]);
  const isDm = useMemo(() => chatId && chatId.length > 1 && chatId[0] === 'dm', [chatId]);
  const isClassChat = useMemo(() => chatId && chatId.length === 1 && chatId[0].startsWith('class-'), [chatId]);
  
  const dmPartnerId = useMemo(() => isDm ? chatId![1] : null, [isDm, chatId]);
  const dmId = useMemo(() => {
    if (!isDm || !user) return null;
    return [user.uid, dmPartnerId].sort().join('_');
  }, [isDm, user, dmPartnerId]);


  const channels = useMemo(() => {
    const baseChannels = ['general']; 
    if (appUser?.class) {
      baseChannels.push(`class-${appUser.class}`);
    }
    return baseChannels;
  }, [appUser]);

  useEffect(() => {
    if (!user) return;

    const usersQuery = query(collection(db, "users"), where("uid", "!=", user.uid));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ChatUser);
        setAllUsers(usersData);
    });

    return () => {
        unsubscribeUsers();
    };
  }, [user]);

  useEffect(() => {
    if (!dmPartnerId) {
      setChatPartner(null);
      return;
    }
    const partnerDocRef = doc(db, 'users', dmPartnerId);
    getDoc(partnerDocRef).then(docSnap => {
        if(docSnap.exists()){
            setChatPartner({id: docSnap.id, ...docSnap.data()} as ChatUser);
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
    if (!user) return;

    let messagesQuery;
    if (isDm && dmId) {
        messagesQuery = query(collection(db, 'dms', dmId, 'messages'), orderBy('timestamp', 'asc'));
    } else if (isClassChat && channelId) {
        messagesQuery = query(collection(db, 'classes', channelId, 'messages'), orderBy('timestamp', 'asc'));
    } else if (channelId === 'general' || !channelId) {
        messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    } else {
        return; 
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
    if (newMessage.trim() === '' || !user || !appUser) return;

    const messageText = newMessage;
    setNewMessage(''); 

    const messageData = {
        text: messageText,
        senderId: user.uid,
        senderName: appUser.displayName || 'Anonymous', 
        senderPhotoURL: appUser.photoURL || null,
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message.',
        variant: 'destructive',
      });
      setNewMessage(messageText); 
    }
  };

  if (loading || appUserLoading || !appUser) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  const teachers = allUsers.filter(u => u.role === 'teacher');
  const students = allUsers.filter(u => u.role === 'student');
  
  const sidebarContent = (
    <>
      <Card className="border-0 border-b rounded-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid gap-1">
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
        <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">Teachers</h3>
        <div className="grid gap-1">
          {teachers.map((teacher) => (
            <Button
              asChild
              key={teacher.id}
              variant={dmPartnerId === teacher.id ? 'secondary' : 'ghost'}
              className="w-full justify-start h-10 gap-2"
            >
              <Link href={`/chat/dm/${teacher.id}`} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={teacher.photoURL || `https://placehold.co/32x32.png`} data-ai-hint="avatar" />
                  <AvatarFallback>{teacher.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                {teacher.displayName}
              </Link>
            </Button>
          ))}
        </div>
        <h3 className="mb-2 mt-4 px-4 text-lg font-semibold tracking-tight">Students</h3>
        <div className="grid gap-1">
          {students.map((student) => (
            <Button
              asChild
              key={student.id}
              variant={dmPartnerId === student.id ? 'secondary' : 'ghost'}
              className="w-full justify-start h-10 gap-2"
            >
              <Link href={`/chat/dm/${student.id}`} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student.photoURL || `https://placehold.co/32x32.png`} data-ai-hint="avatar" />
                  <AvatarFallback>{student.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
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
    <div className="grid h-screen md:grid-cols-[280px_1fr]">
      <div className="hidden md:flex flex-col border-r bg-muted/20">
        {sidebarContent}
      </div>
      <div className="flex flex-col h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 shrink-0">
           <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open channels and users menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-full max-w-sm sm:max-w-sm bg-muted/40">
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
                className={`flex items-end gap-3 ${
                  msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.senderId !== user?.uid && (
                   <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.senderPhotoURL || 'https://placehold.co/32x32.png'} data-ai-hint="avatar" />
                    <AvatarFallback>{msg.senderName ? msg.senderName.charAt(0) : 'A'}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex flex-col gap-1 max-w-[70%] sm:max-w-[60%]`}
                >
                    {msg.senderId !== user?.uid && <p className="text-xs text-muted-foreground px-3">{msg.senderName}</p>}
                    <div
                        className={`p-3 rounded-2xl ${
                        msg.senderId === user?.uid
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        }`}
                    >
                    <p className="break-words">{msg.text}</p>
                    <p className="mt-1 text-xs text-right opacity-70">
                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    </div>
                </div>
                {msg.senderId === user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={appUser.photoURL || 'https://placehold.co/32x32.png'} data-ai-hint="avatar" />
                    <AvatarFallback>{appUser.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t bg-background p-4 shrink-0">
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
