
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user: appUser, isLoading } = useUser();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appUser) {
      setDisplayName(appUser.displayName || '');
      setSelectedClass(String(appUser.class || ''));
    }
  }, [appUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !auth.currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userDocRef = doc(db, 'users', appUser.uid);
      const updates: { displayName?: string; class?: number } = {};
      
      if (displayName !== appUser.displayName) {
        updates.displayName = displayName;
      }
      if (selectedClass && parseInt(selectedClass, 10) !== appUser.class) {
        updates.class = parseInt(selectedClass, 10);
      }

      // Update Firestore document
      if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates);
      }

      // Update Firebase Auth profile if name changed
      if (displayName !== auth.currentUser.displayName) {
         await updateProfile(auth.currentUser, { displayName });
      }

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Could not update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !appUser) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start py-8 px-4">
      <Card className="w-full max-w-2xl">
        <form onSubmit={handleProfileUpdate}>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={appUser.email || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Display Name</Label>
              <Input
                id="full-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            {appUser.role === 'student' && (
              <div className="grid gap-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  onValueChange={setSelectedClass}
                  value={selectedClass}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                      <SelectItem key={grade} value={String(grade)}>
                        Class {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Role</Label>
               <Input value={appUser.role} disabled className="capitalize"/>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
