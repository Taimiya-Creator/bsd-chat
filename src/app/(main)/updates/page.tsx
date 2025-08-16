
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface Update {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: Timestamp;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const { user: appUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Update[];
      setUpdates(updatesData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
        await deleteDoc(doc(db, 'updates', id));
        toast({
            title: 'Success',
            description: 'Announcement has been deleted.',
        });
    } catch(error) {
        console.error("Error deleting announcement:", error);
        toast({
            title: 'Error',
            description: 'Could not delete announcement.',
            variant: 'destructive',
        });
    }
  }


  return (
    <div className="grid gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>School Updates</CardTitle>
          <CardDescription>
            Important announcements and news for BSD Public School.
          </CardDescription>
        </CardHeader>
      </Card>
      {updates.map((update) => (
        <Card key={update.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{update.title}</CardTitle>
                <CardDescription>
                  {update.author} - {update.createdAt?.toDate().toLocaleDateString()}
                </CardDescription>
              </div>
              {appUser?.role === 'admin' && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(update.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete Announcement</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{update.description}</p>
          </CardContent>
        </Card>
      ))}
       {updates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No announcements yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
