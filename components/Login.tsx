"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

import { useEffect } from "react";

export default function Login({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
    const { loginWithGoogle, signupWithEmail, loginWithEmail, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const isSignUp = mode === 'signup';
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            router.push(`/profile`);
        }
    }, [user, authLoading, router, locale]);

    const handleGoogleLogin = async () => {
        try {
            setError("");
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Google Login Failed:", err);
            setError("Google Login failed. Please try again.");
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            if (isSignUp) {
                await signupWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            // Redirection handled by useEffect
        } catch (err: any) {
            console.error("Auth Failed:", err);
            setIsSubmitting(false);
            let message = "Authentication failed. Please check your credentials.";

            if (err.code === "auth/email-already-in-use") {
                message = "This email is already in use. Please log in instead.";
            } else if (err.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            } else if (err.code === "auth/weak-password") {
                message = "Password should be at least 6 characters.";
            } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                message = "Invalid email or password.";
            }

            setError(message);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-sans bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark antialiased">
            <div className="layout-container flex h-full grow flex-col">
                <main className="flex-grow">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                        {/* Left Side - Image */}
                        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-neutral-light dark:bg-neutral-dark/40 relative overflow-hidden">
                            <div className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIr_jj3h41m_v7jIP1Xrl-s7YK1q59J1FjIPv9V1A7jIXtx4GcvwVwH1n3v0tUOzUmAXDMnL1Od3cyUaWyftoJdeNShBuqLg_IL4O8Aj9-9jRqQrtQ-al1TTyrLlumWuQFbEk8k40bwEwQAnMcKqdHDaqH4bl3ovpq50PA_L-GRz_GDgvUTuR5gPNR_9Jhr_3D5Von96RcFkOT_vkpMb-FE_4xw-b4aIBZcylHPvlZMxCcQYn_p6vfmstGVXtzjkE-hIHkoiPEjIY')" }}></div>
                            <div className="relative z-10 text-center max-w-lg">
                                <h1 className="text-5xl md:text-6xl font-extrabold font-display leading-tight tracking-tighter text-gray-900 dark:text-white">Your journey, simplified.</h1>
                                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Smart, seamless visa guidance at your fingertips. {isSignUp ? "Sign up" : "Log in"} to get started.</p>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 bg-white dark:bg-gray-900">
                            <div className="flex flex-col w-full max-w-md gap-8">
                                <div className="flex flex-col gap-2 text-center lg:text-left">
                                    <h2 className="font-display text-gray-900 dark:text-white text-4xl sm:text-5xl font-extrabold leading-tight tracking-tighter">
                                        {isSignUp ? "Create Account" : "Welcome Back!"}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                                        {isSignUp ? "Please enter your details to sign up." : "Please enter your details to sign in."}
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-900 dark:text-white" htmlFor="email">Email Address</label>
                                        <div className="relative flex w-full items-center">
                                            <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">mail</span>
                                            <input
                                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent border border-gray-200 dark:border-gray-700 h-12 placeholder:text-gray-400 pl-12 pr-4 text-base font-normal leading-normal shadow-sm transition-all"
                                                id="email"
                                                placeholder="you@example.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-900 dark:text-white" htmlFor="password">Password</label>
                                        <div className="relative flex w-full items-center">
                                            <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">lock</span>
                                            <input
                                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent border border-gray-200 dark:border-gray-700 h-12 placeholder:text-gray-400 pl-12 pr-4 text-base font-normal leading-normal shadow-sm transition-all"
                                                id="password"
                                                placeholder="Enter your password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    {!isSignUp && (
                                        <div className="flex items-center justify-end">
                                            <a className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors" href="#">Forgot Password?</a>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4 mt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-600 text-white text-base font-bold leading-normal tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <span className="truncate">{isSubmitting ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}</span>
                                        </button>

                                        <div className="relative flex items-center py-2">
                                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                            <span className="flex-shrink mx-4 text-xs font-medium uppercase text-gray-400 tracking-wider">OR</span>
                                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white gap-3 text-base font-bold leading-normal tracking-wide border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                            </svg>
                                            <span className="truncate">Sign {isSignUp ? "up" : "in"} with Google</span>
                                        </button>
                                    </div>
                                </form>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal text-center">
                                    {isSignUp ? "Already have an account?" : "New to VisaGuide?"}{" "}
                                    <Link
                                        href={`/${isSignUp ? 'login' : 'signup'}`}
                                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        {isSignUp ? "Log in" : "Create an account"}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
