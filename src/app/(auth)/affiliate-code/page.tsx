
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const AFFILIATION_CODE = '2132394';

export default function AffiliateCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === AFFILIATION_CODE) {
      toast({
        title: 'Success',
        description: 'Affiliation code accepted.',
      });
      router.push('/signup?validated=true');
    } else {
      toast({
        title: 'Error',
        description: 'Invalid affiliation code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-0 shadow-lg sm:border">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">School Affiliation</CardTitle>
            <CardDescription>
              Please enter the school affiliation code to proceed to signup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="affiliation-code">Affiliation Code</Label>
              <Input
                id="affiliation-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              Verify Code
            </Button>
             <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Designed by Zenova (Taimiya Amjad)
      </p>
    </div>
  );
}
