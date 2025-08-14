import { redirect } from 'next/navigation';
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

export default function LoginPage() {
  async function login() {
    'use server';
    // This is where you would add your authentication logic.
    // For now, we'll just redirect to the chat page.
    redirect('/chat');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <form action={login}>
          <CardHeader>
            <CardTitle className="text-2xl">BSD Public School</CardTitle>
            <CardDescription>
              Enter your school email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="student@bsd.edu"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
