import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, Share2, Bot, Star, Server, Users, FileText } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center justify-center" prefetch={false}>
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-bold font-headline">ProctorLink</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
              <Button asChild variant="default">
                <Link href="/login">Organizer Login</Link>
              </Button>
            </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    The Gold Standard in Secure Online Examinations
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ProctorLink offers a robust platform for creating, managing, and conducting secure online exams with AI-powered tools and advanced proctoring features.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/dashboard/create">Create Your First Exam</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://i.postimg.cc/8kfGbWwr/image.png"
                width="650"
                height="450"
                alt="Hero"
                data-ai-hint="online exam computer"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <FileText className="mx-auto h-10 w-10 text-primary mb-4" />
                <h3 className="text-4xl font-bold">5,000+</h3>
                <p className="text-muted-foreground">Exams Taken</p>
              </div>
              <div className="text-center">
                 <Users className="mx-auto h-10 w-10 text-primary mb-4" />
                <h3 className="text-4xl font-bold">150+</h3>
                <p className="text-muted-foreground">Organizers Trust Us</p>
              </div>
              <div className="text-center">
                 <Server className="mx-auto h-10 w-10 text-primary mb-4" />
                <h3 className="text-4xl font-bold">99.9%</h3>
                <p className="text-muted-foreground">Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need for Secure Testing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From AI question generation to advanced security measures, our platform is designed for a fair and cheat-proof exam experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <Card className="hover:shadow-lg transition-shadow border-transparent hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Question Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Automatically generate relevant exam questions based on the topic you provide, saving you time and effort.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow border-transparent hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Advanced Proctoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Prevent cheating with screen, tab, and copy-paste restrictions, plus live camera monitoring.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow border-transparent hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Easy Sharing & Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Create your exam and share a unique link with participants. It's that simple to get started.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What Our Users Are Saying</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Don't just take our word for it. Here's what organizers think about ProctorLink.
                    </p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:gap-12 mt-8">
                    <Card className="text-left">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                            </div>
                            <blockquote className="text-lg font-semibold leading-snug">
                                “ProctorLink has revolutionized how we conduct our certification exams. The AI tools are a lifesaver, and the security features give us complete peace of mind.”
                            </blockquote>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar"/>
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">Jane Doe</p>
                                <p className="text-sm text-muted-foreground">Hiring Manager, TechCorp</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="text-left">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                            </div>
                            <blockquote className="text-lg font-semibold leading-snug">
                                “The setup was incredibly easy, and the ability to set timers per question has made our technical assessments far more effective. Highly recommended!”
                            </blockquote>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar"/>
                                <AvatarFallback>MS</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-semibold">Michael Smith</p>
                                <p className="text-sm text-muted-foreground">Professor, InnovateU</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Secure Your Exams?</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Create an account and start building your first secure exam in minutes. No credit card required.
                    </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                     <Button asChild size="lg" className="w-full">
                        <Link href="/signup">Get Started for Free</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 ProctorLink. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
