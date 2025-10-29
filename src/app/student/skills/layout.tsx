'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

export default function CareerHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = (pathname || '').split('/').filter(Boolean); // e.g., ['student','skills','courses']
  const skillsIndex = segments.findIndex((s) => s === 'skills');
  const trail = skillsIndex >= 0 ? segments.slice(skillsIndex, segments.length) : [];

  const pretty = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/student/skills" className="flex items-center gap-2" prefetch={false}>
            <Logo size="sm" />
            <span className="text-sm font-semibold">ProctorLink CareerHub</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost">
              <Link href="/student/skills/courses">Courses</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/student/skills/path">Learning Path</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/student/skills/resume">Resume</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/student/skills/interview">AI Interview</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/student/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <span>
            <Link href="/student/skills" className="hover:underline">CareerHub</Link>
          </span>
          {trail.slice(1).map((seg, idx) => {
            const href = '/student/' + segments.slice(0, skillsIndex + 1 + idx + 1).join('/');
            return (
              <span key={href}>
                <span className="mx-2">/</span>
                <Link href={href} className="hover:underline">{pretty(seg)}</Link>
              </span>
            );
          })}
        </nav>
        {children}
      </main>

      <footer className="border-t bg-card">
        <div className="container flex flex-col gap-2 py-6 items-center text-center">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm font-semibold">ProctorLink CareerHub</span>
          </div>
          <p className="text-xs text-muted-foreground">Grow faster with curated learning and AI guidance.</p>
        </div>
      </footer>
    </div>
  );
}


