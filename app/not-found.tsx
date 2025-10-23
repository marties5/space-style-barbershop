import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-black text-muted-foreground/20 select-none">
              404
            </h1>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-primary/10 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute top-8 right-8 w-8 h-8 bg-accent/20 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-8 left-8 w-6 h-6 bg-primary/30 rounded-full animate-bounce delay-700"></div>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            {"Oops! We can't seem to find the page you're looking for"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto text-pretty">
            The page you requested might have been moved, deleted, or you
            entered the wrong URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button size="lg" className="min-w-[140px] font-medium">
              Go to Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              size="lg"
              className="min-w-[140px] font-medium bg-transparent"
            >
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help? Try using our search or go back to the{" "}
            <Link href="/" className="text-primary hover:underline font-medium">
              homepage
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
