'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleVerify = async () => {
    setIsLoading(true)
    // Simulate email verification
    setTimeout(() => {
      setIsVerified(true)
      setIsLoading(false)
    }, 1500)
  }

  const handleContinue = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <div className="p-8">
            {/* Logo/Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PM</span>
                </div>
                <span className="text-xl font-bold text-foreground">PropManager</span>
              </div>
            </div>

            {!isVerified ? (
              <>
                {/* Message */}
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
                  <p className="text-sm text-muted-foreground">
                    We've sent a verification link to your email. Click the button below to verify your account.
                  </p>
                </div>

                {/* Verification Button */}
                <Button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 mb-4"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      I've verified my email
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {/* Help Text */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Didn't receive the email?
                  </p>
                  <Button variant="outline" className="w-full border-border text-foreground bg-transparent">
                    Resend verification link
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Email verified!</h1>
                  <p className="text-sm text-muted-foreground">
                    Your account is all set. Let's get started with setting up your first property.
                  </p>
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
                >
                  <span className="flex items-center gap-2">
                    Start onboarding
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 PropManager. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
