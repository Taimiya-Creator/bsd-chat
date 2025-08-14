
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function AdminAnnouncementsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          router.push('/chat'); // Redirect non-admins
        }
      }
    };
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;
    setIsSubmitting(true);

    try {
        await addDoc(collection(db, 'updates'), {
            title,
            description,
            author: user.displayName || 'Admin',
            createdAt: serverTimestamp()
        });
        toast({
            title: 'Success',
            description: 'Announcement has been posted.',
        });
        setTitle('');
        setDescription('');
    } catch(error) {
        console.error("Error posting announcement:", error);
        toast({
            title: 'Error',
            description: 'Could not post announcement.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>
            Post a new update for the entire school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Parent-Teacher Conferences"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A reminder that parent-teacher conferences are scheduled for next week..."
                required
                className="min-h-[120px]"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Announcement'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
