
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user: appUser, isLoading } = useUser();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appUser) {
      setDisplayName(appUser.displayName || '');
      setSelectedClass(String(appUser.class || ''));
      setPreviewUrl(appUser.photoURL || null);
    }
  }, [appUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
      let photoURL = appUser.photoURL;

      // Upload new profile picture if one was selected
      if (profilePic) {
        const storageRef = ref(storage, `profile_pictures/${appUser.uid}`);
        const snapshot = await uploadBytes(storageRef, profilePic);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      const userDocRef = doc(db, 'users', appUser.uid);
      const updates: { displayName?: string; photoURL?: string } = {};
      
      if (displayName !== appUser.displayName) {
        updates.displayName = displayName;
      }
      if (photoURL !== appUser.photoURL) {
          updates.photoURL = photoURL;
      }

      // Update Firestore document
      if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates);
      }

      // Update Firebase Auth profile if name or photo changed
      if (displayName !== auth.currentUser.displayName || photoURL !== auth.currentUser.photoURL) {
         await updateProfile(auth.currentUser, { displayName, photoURL });
      }

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      setProfilePic(null);
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
            <div className="flex flex-col items-center gap-4">
               <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || `https://placehold.co/96x96.png`} alt="Profile Picture" />
                  <AvatarFallback>
                     {displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                    type="button" 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Camera className="h-4 w-4" />
                </Button>
                <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
               </div>
            </div>

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
                  disabled
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
