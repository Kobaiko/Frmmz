
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, Loader2, CheckCircle, Mail } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user && !data.session) {
        // User created but needs email confirmation
        setConfirmationEmail(email);
        setShowConfirmation(true);
      } else if (data.session) {
        // User created and automatically signed in
        onAuthSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: confirmationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setError(""); // Clear any previous errors
        // Could show a success message here
      }
    } catch (err) {
      setError("Failed to resend confirmation email");
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Frmzz</span>
            </div>
            <CardTitle className="text-white">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-300 mb-2">
                We've sent a confirmation link to:
              </p>
              <p className="text-white font-medium mb-4">{confirmationEmail}</p>
              <p className="text-sm text-gray-400">
                Click the link in the email to activate your account and complete the sign-up process.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendConfirmation}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend confirmation email"
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  setError("");
                }}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Back to sign in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">Frmzz</span>
          </div>
          <CardTitle className="text-white">Welcome to Frmzz</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger 
                value="signin" 
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
