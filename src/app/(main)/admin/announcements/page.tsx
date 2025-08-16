
'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center mb-4">
          <h1 className="text-lg font-semibold md:text-2xl">Create Announcement</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>New Announcement</CardTitle>
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
