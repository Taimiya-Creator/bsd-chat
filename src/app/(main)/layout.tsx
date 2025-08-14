
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  Bell,
  MessageSquare,
  Package2,
  PanelLeft,
  Search,
  Shield,
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
  const [firebaseUser, loadingAuth, authError] = useAuthState(auth);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (loadingAuth) {
      return; // Wait until Firebase auth state is determined
    }

    if (!firebaseUser) {
      // If not loading and no user, redirect to login
      if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/affiliate-code') {
        redirect('/login');
      }
      return;
    }

    // If we have a firebaseUser but no appUser yet, fetch the user data
    if (firebaseUser && !appUser) {
      const fetchUserData = async () => {
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
            // Fallback if user doc doesn't exist
            setAppUser({
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: 'Student', // Default role
            });
          }
        } catch (error) {
            console.error("Error fetching user data:", error);
            // In case of error, logout to be safe
            handleLogout();
        }
      };
      fetchUserData();
    }
  }, [firebaseUser, loadingAuth, appUser, pathname]);

  async function handleLogout() {
    try {
      await signOut(auth);
      // The useEffect hook will handle the redirect
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  
  // Handle public pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/affiliate-code') {
    return <>{children}</>;
  }

  // Show a loading spinner while auth state is being determined or app user is being fetched
  if (loadingAuth || !appUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  // If we've finished loading and there's still no user, the redirect is in progress.
  if (!firebaseUser) {
    return null;
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
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname.startsWith('/chat') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
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
          {appUser.role === 'admin' && (
             <Link
                href="/admin/announcements"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === '/admin/announcements' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
              >
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin</span>
              </Link>
          )}
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
               <SheetHeader className="p-4 border-b">
                 <SheetTitle>Menu</SheetTitle>
               </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium mt-4">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">BSD Public School</span>
                </Link>
                <Link
                  href="/chat"
                  className={`flex items-center gap-4 px-2.5 ${pathname.startsWith('/chat') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
                {appUser.role === 'admin' && (
                  <Link
                    href="/admin/announcements"
                    className={`flex items-center gap-4 px-2.5 ${pathname === '/admin/announcements' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Shield className="h-5 w-5" />
                    Admin
                  </Link>
                )}
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
