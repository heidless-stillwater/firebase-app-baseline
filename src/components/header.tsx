'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mail, UploadCloud, User, LogOut } from 'lucide-react';
import { AetheriaLogo } from './aetheria-logo';
import { Button } from './ui/button';
import { useUser, useAuth } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    signOut(auth);
  };

  const navLinks = [
    { href: '/', label: 'Workspace', icon: Home },
    { href: '/upload-and-display', label: 'Upload', icon: UploadCloud },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <AetheriaLogo />
      </div>

      <nav className="hidden items-center gap-2 md:flex">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            variant="ghost"
            asChild
            className={cn(
              'justify-start',
              pathname === href && 'bg-accent text-accent-foreground'
            )}
          >
            <Link href={href}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="flex items-center">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
