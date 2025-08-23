import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowLeftIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from "@heroicons/react/24/outline";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearAuthError } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login(formData);
      if (result.meta.requestStatus === 'fulfilled') {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Login Failed",
        description: error || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset email
    setTimeout(() => {
      setForgotPasswordSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <h1 className="hidden sm:block text-lg font-semibold text-gray-900">
              Document Portal
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin-login")}
              className="text-sm"
            >
              Admin Login
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/signup")}
              className="text-sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Sign in to your account to continue
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div></div>
                  <Dialog
                    open={showForgotPassword}
                    onOpenChange={setShowForgotPassword}
                  >
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                      </DialogHeader>
                      {!forgotPasswordSent ? (
                        <form
                          onSubmit={handleForgotPassword}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email Address</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              required
                              value={forgotPasswordEmail}
                              onChange={(e) =>
                                setForgotPasswordEmail(e.target.value)
                              }
                              placeholder="Enter your email address"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowForgotPassword(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                              Send Reset Link
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-green-800 text-sm">
                              Password reset link has been sent to your email
                              address.
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setShowForgotPassword(false);
                              setForgotPasswordSent(false);
                              setForgotPasswordEmail("");
                            }}
                            className="w-full"
                          >
                            Close
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/signup")}
                >
                  Create New Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
