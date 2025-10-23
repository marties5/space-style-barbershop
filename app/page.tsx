import { InstallButton } from "@/components/InstallButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Calendar, CreditCard, Scissors, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <span className="text-lg sm:text-xl font-bold text-foreground">
                Barber
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm sm:text-base"
                >
                  Login
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-sm sm:text-base"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6">
            Modern Barbershop
            <span className="text-purple-500 block">POS System</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground text-pretty mb-6 sm:mb-8 max-w-2xl mx-auto">
            Streamline your barbershop operations with our intuitive
            point-of-sale system. Manage appointments, track sales, and grow
            your business effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 bg-purple-500 hover:bg-purple-600"
              >
                Get Started
              </Button>
            </Link>
            <InstallButton />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-balance mb-3 sm:mb-4">
              Everything you need to run your barbershop
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Built specifically for barbershops and salons with modern features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-3 sm:pb-6">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Appointment Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Easy online booking system for your customers with calendar
                  management
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-3 sm:pb-6">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Payment Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Accept cash, cards, and digital payments with integrated POS
                  system
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-3 sm:pb-6">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Customer Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Track customer history, preferences, and loyalty rewards
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-3 sm:pb-6">
                <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">
                  Sales Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Monitor daily sales, popular services, and business growth
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              <span className="text-base sm:text-lg font-semibold">Barber</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © 2025 Barber. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
