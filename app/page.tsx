'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, Home } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">PM</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">PropManager</h1>
          <p className="text-sm md:text-base text-muted-foreground">Choose your portal to get started</p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {/* Landlord Portal */}
          <Card className="border-2 border-border p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
            <Link href="/dashboard" className="flex flex-col items-center text-center gap-4 h-full">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Property Manager</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage properties, tenants, rent collection, and maintenance
                </p>
                <div className="flex items-center gap-2 justify-center text-primary hover:gap-3 transition-all">
                  <span className="font-semibold">Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </Card>

          {/* Tenant Portal */}
          <Card className="border-2 border-border p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
            <Link href="/tenant" className="flex flex-col items-center text-center gap-4 h-full">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Tenant Portal</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  View payments, report maintenance, and contact management
                </p>
                <div className="flex items-center gap-2 justify-center text-primary hover:gap-3 transition-all">
                  <span className="font-semibold">Access Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-border text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2024 PropManager. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
