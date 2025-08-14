
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  Bell,
  MessageSquare,
  Package2,
  PanelLeft,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

type AppUser = {
  name: string;
  email: string | null;
  role: string;
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseUser, loadingAuth] = useAuthState(auth);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAppUser({
              name: data.displayName || 'User',
              email: firebaseUser.email,
              role: data.role || 'Student',
            });
          } else {
            // Fallback if user doc doesn't exist, use auth profile
            setAppUser({
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: 'Student', // Default role
            });
          }
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Handle error, maybe show a toast or log out user
            setAppUser(null);
        } finally {
            setLoadingUser(false);
        }
      } else {
        // No firebaseUser, so not loading user data
        setLoadingUser(false);
        setAppUser(null);
      }
    };

    fetchUserData();
  }, [firebaseUser]);

  useEffect(() => {
    // Redirect logic should run when auth state is resolved and there's no user
    if (!loadingAuth && !firebaseUser) {
      if (pathname !== '/login' && pathname !== '/signup') {
        redirect('/login');
      }
    }
  }, [loadingAuth, firebaseUser, pathname]);


  async function handleLogout() {
    try {
      await signOut(auth);
      // The redirection will be handled by the effect above
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  const isLoading = loadingAuth || loadingUser;

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  // After loading, if there's no user and we're not on a public page, let the redirect effect handle it.
  // This prevents rendering children while redirection is pending.
  if (!firebaseUser) {
    return null;
  }
  
  // This should only happen if user data somehow fails to load but they are authenticated.
  if (!appUser) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">BSD Public School</span>
          </Link>
          <Link
            href="/chat"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === '/chat' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Chat</span>
          </Link>
          <Link
            href="/updates"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === '/updates' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Updates</span>
          </Link>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">BSD Public School</span>
                </Link>
                <Link
                  href="/chat"
                  className={`flex items-center gap-4 px-2.5 ${pathname === '/chat' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </Link>
                <Link
                  href="/updates"
                  className={`flex items-center gap-4 px-2.5 ${pathname === '/updates' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Bell className="h-5 w-5" />
                  Updates
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage
                    src="https://placehold.co/32x32.png"
                    alt="User avatar"
                    data-ai-hint="avatar"
                  />
                  <AvatarFallback>
                    {appUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{appUser.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{appUser.role}</DropdownMenuItem>
              <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
