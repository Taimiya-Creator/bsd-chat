
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
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  Bell,
  Home,
  MessageSquare,
  Package2,
  PanelLeft,
  Search,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProvider, useUser } from '@/hooks/use-user';


function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const [firebaseUser, loadingAuth] = useAuthState(auth);
  const { user: appUser, isLoading: appUserLoading } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loadingAuth && !firebaseUser) {
      redirect('/login');
    }
  }, [firebaseUser, loadingAuth, pathname]);


  async function handleLogout() {
    try {
      await signOut(auth);
      // The useEffect hook will handle the redirect
    } catch (error) {
      console.error('Logout failed:', error);
       toast({
        title: 'Error',
        description: 'Failed to log out.',
        variant: 'destructive',
      });
    }
  }
  
  const inAdminSection = pathname.startsWith('/admin');

  if (loadingAuth || appUserLoading || !appUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }
  
  if (!firebaseUser) {
    return null;
  }

  const mainNavigation = (
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/chat"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">BSD Connect</span>
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
                href="/admin/dashboard"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname.startsWith('/admin') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
              >
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin</span>
              </Link>
          )}
        </nav>
  )

  const mobileNav = (
     <nav className="grid gap-6 text-lg font-medium mt-4">
        <Link
          href="/chat"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">BSD Connect</span>
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
            href="/admin/dashboard"
            className={`flex items-center gap-4 px-2.5 ${pathname.startsWith('/admin') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Shield className="h-5 w-5" />
            Admin
          </Link>
        )}
      </nav>
  )

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
       {mainNavigation}
      </aside>
      <div className="flex flex-col sm:pl-14">
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
                 <SheetTitle>BSD Connect</SheetTitle>
               </SheetHeader>
              {mobileNav}
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
                    src={`https://placehold.co/32x32.png`}
                    alt="User avatar"
                    data-ai-hint="avatar"
                  />
                  <AvatarFallback>
                    {appUser.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{appUser.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild className="cursor-pointer">
                 <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>{appUser.role}</DropdownMenuItem>
              <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </UserProvider>
  )
}
