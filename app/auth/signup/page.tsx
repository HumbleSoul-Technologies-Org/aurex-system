"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, User, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { signupSendCode, verifySignupCode } from "@/lib/services/authApi";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "property_manager">(
    "property_manager",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [step, setStep] = useState<
    "form" | "verification" | "pending" | "success"
  >("form");
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !role) {
      setError("Please fill in all required fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms & Conditions to continue");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and number",
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      await signupSendCode({
        firstName,
        lastName,
        email,
        role,
        password,
        acceptedTermsAndConditions: acceptedTerms,
      });

      setStep("verification");
      setInfo(
        `A verification code has been sent to ${email}. Enter it below to continue.`,
      );
    } catch (err: any) {
      const msg = err?.message || "Failed to send verification code";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists") ||
        msg.includes("USER_EXISTS") ||
        msg.includes("requiresProductKey")
      ) {
        router.push(`/auth/product-key?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      await verifySignupCode({
        email,
        code: verificationCode,
      });

      // After successful signup verification, require product key entry
      router.push(`/auth/product-key?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg = err?.message || "Failed to verify code";
      // If account already exists / requires product key, redirect to product-key page
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists") ||
        msg.includes("USER_EXISTS") ||
        msg.includes("requiresProductKey")
      ) {
        router.push(`/auth/product-key?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
                <span className="text-xl font-bold text-foreground">
                  PropManager
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional property management simplified
              </p>
            </div>

            {/* STEP 1: Initial Registration Form */}
            {step === "form" && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Join Our Team
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Register as an administrator or property manager
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role
                    </label>
                    <Select
                      value={role}
                      onValueChange={(value) =>
                        setRole(value as "admin" | "property_manager")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property_manager">
                          Property Manager
                        </SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your account will be reviewed and approved by a super
                      administrator
                    </p>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters and include
                    uppercase, lowercase, and a number.
                  </p>

                  <label className="flex items-start gap-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span>
                      I accept the{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:text-primary/80 font-medium"
                        target="_blank"
                      >
                        Terms & Conditions
                      </Link>
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Proceeding...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* STEP 2: Email Verification */}
            {step === "verification" && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We sent a verification code to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the 6-digit code from the email we sent to your
                      inbox.
                    </p>
                    {info && (
                      <div className="mt-3 p-3 bg-secondary/10 rounded-lg text-sm text-foreground">
                        {info}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Verify & Continue
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isLoading}
                      onClick={async () => {
                        setError("");
                        setInfo("");
                        setIsLoading(true);
                        try {
                          await signupSendCode({
                            firstName,
                            lastName,
                            email,
                            role,
                            password,
                            acceptedTermsAndConditions: acceptedTerms,
                          });
                          setInfo(`A new code has been sent to ${email}.`);
                        } catch (err: any) {
                          setError(err?.message || "Unable to resend code");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full"
                    >
                      Resend Code
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("form")}
                    className="w-full"
                  >
                    Back
                  </Button>
                </form>
              </>
            )}

            {/* STEP 3: Pending Approval */}
            {step === "pending" && (
              <>
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <CheckCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Registration Submitted
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Your registration as a{" "}
                      <span className="font-medium capitalize text-foreground">
                        {role.replace("_", " ")}
                      </span>{" "}
                      has been submitted for approval.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">What happens next:</span>
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>✓ A super administrator will review your request</li>
                      <li>
                        ✓ You'll receive an email when your account is approved
                      </li>
                      <li>✓ Once approved, you can log in with your email</li>
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    This typically takes 24-48 hours. If you don't hear back,
                    please contact support.
                  </p>

                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => router.push("/auth/login")}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                    >
                      Back to Login
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Already have an account?{" "}
                      <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Success - Account Created */}
            {step === "success" && (
              <>
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Account Created Successfully!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification email to{" "}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use the password you created during signup after verifying
                      your email.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Next steps:</span>
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>✓ Check your email for the verification link</li>
                      <li>✓ Click the link to verify your account</li>
                      <li>✓ You'll be redirected to set up your profile</li>
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Didn't receive the email? Check your spam folder or contact
                    support.
                  </p>

                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => router.push("/auth/login")}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                    >
                      Back to Login
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Already verified?{" "}
                      <Link
                        href="/onboarding/profile-setup"
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Tenant Signup Notice */}
            {(step === "form" || step === "verification") && (
              <div className="mt-8 text-center text-xs text-muted-foreground">
                <p>
                  Are you a tenant?{" "}
                  <Link
                    href="/auth/invite"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Use your invite link instead
                  </Link>
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <p>© 2024 PropManager. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
