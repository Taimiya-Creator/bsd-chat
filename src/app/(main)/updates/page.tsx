
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Update {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: Timestamp;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);

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
      {updates.map((update) => (
        <Card key={update.id}>
          <CardHeader>
            <CardTitle>{update.title}</CardTitle>
            <CardDescription>
              {update.author} - {update.createdAt?.toDate().toLocaleDateString()}
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
