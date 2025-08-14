import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Wand2, Rocket, Zap } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <Mountain className="h-6 w-6" />
            <span className="font-semibold">MagiCorp</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              About
            </Link>
          </nav>
          <Button>Get Started</Button>
        </div>
      </header>
      <main className="flex-1">
        <section
          id="hero"
          className="container mx-auto flex flex-col items-center justify-center space-y-6 px-4 py-20 text-center md:py-32"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
              Unlock the Magic of Your Business
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              MagiCorp provides the tools you need to streamline your workflow,
              boost productivity, and achieve your goals.
            </p>
          </div>
          <div className="space-x-4">
            <Button size="lg">Start Free Trial</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        <section id="features" className="w-full bg-muted py-20 md:py-32">
          <div className="container mx-auto grid gap-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features designed to help you
                  work smarter, not harder.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Wand2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Effortless Automation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Automate repetitive tasks and focus on what matters most.
                      Our intuitive tools make it simple.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-1">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Blazing Fast Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Experience a new level of speed and responsiveness. Our
                      platform is built for performance.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-1">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Powerful Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Connect with your favorite tools and services. We support
                      hundreds of integrations out of the box.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        <section id="image-gallery" className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">See the Magic in Action</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">A glimpse into our world of innovation and creativity.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Placeholder Image 1"
                width={600}
                height={400}
                className="aspect-video w-full overflow-hidden rounded-lg object-cover"
                data-ai-hint="office productivity"
              />
              <Image
                src="https://placehold.co/600x400.png"
                alt="Placeholder Image 2"
                width={600}
                height={400}
                className="aspect-video w-full overflow-hidden rounded-lg object-cover"
                data-ai-hint="team collaboration"
              />
              <Image
                src="https://placehold.co/600x400.png"
                alt="Placeholder Image 3"
                width={600}
                height={400}
                className="aspect-video w-full overflow-hidden rounded-lg object-cover"
                data-ai-hint="data analytics"
              />
            </div>
          </div>
        </section>

      </main>
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6" />
            <span className="font-semibold">MagiCorp</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 MagiCorp. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
              prefetch={false}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
