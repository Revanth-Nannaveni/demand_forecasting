

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Sprout, Eye, EyeOff } from "lucide-react";

// const MicrosoftIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
//     <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
//     <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
//     <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
//     <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
//   </svg>
// );

// const BACKEND_URL = "https://34464xv038.execute-api.ap-south-1.amazonaws.com/prod";

// const Login = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const navigate = useNavigate();

//   // Login fields
//   const [username, setUsername] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");

//   // Sign up fields
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName]   = useState("");
//   const [email, setEmail]         = useState("");
//   const [phone, setPhone]         = useState("");
//   const [password, setPassword]   = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordError, setPasswordError] = useState("");

//   const handleMicrosoftLogin = () => {
//     // window.location.href = `${BACKEND_URL}/auth/login`;
//     localStorage.removeItem("farmgate_logged_out"); // 👈 ADD THIS LINE
//     window.location.href = `${BACKEND_URL}/auth/login`;
//   };


//   // Add this near the top with BACKEND_URL
// const LAMBDA_API_URL = "/lambda/auth"; // ← paste your URL here



// const handleLogin = async (e: React.FormEvent) => {
//   e.preventDefault();
//   try {
//     const res = await fetch(LAMBDA_API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ action: "login", username, password: loginPassword }),
//     });
//     const data = await res.json();
//     if (!res.ok) { alert(data.error); return; }

//     // localStorage.setItem("farmgate_jwt", data.token);
//     // localStorage.setItem("farmgate_user", JSON.stringify(data.user));
//     // navigate("/dashboard");
//     localStorage.removeItem("farmgate_logged_out"); // 👈 ADD THIS LINE
//     localStorage.setItem("farmgate_jwt", data.token);
//     localStorage.setItem("farmgate_user", JSON.stringify(data.user));
//     navigate("/dashboard");
//   } catch {
//     alert("Network error. Please try again.");
//   }
// };

// const handleSignUp = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (password !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
//   setPasswordError("");
//   try {
//     const res = await fetch(LAMBDA_API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ action: "signup", firstName, lastName, email, phone, password, confirmPassword }),
//     });
//     const data = await res.json();
//     if (!res.ok) { alert(data.error); return; }

//     // localStorage.setItem("farmgate_jwt", data.token);
//     // localStorage.setItem("farmgate_user", JSON.stringify(data.user));
//     // navigate("/dashboard");
//     localStorage.removeItem("farmgate_logged_out"); // 👈 ADD THIS LINE
//     localStorage.setItem("farmgate_jwt", data.token);
//     localStorage.setItem("farmgate_user", JSON.stringify(data.user));
//     navigate("/dashboard");
//   } catch {
//     alert("Network error. Please try again.");
//   }
// };

//   const switchTab = (login: boolean) => {
//     setIsLogin(login);
//     setPasswordError("");
//     setShowPassword(false);
//     setShowConfirmPassword(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
//       <div className="w-full max-w-md animate-fade-in">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
//             <Sprout className="w-8 h-8 text-primary-foreground" />
//           </div>
//           <h1 className="text-3xl font-bold font-display text-foreground">FarmGate</h1>
//           <p className="text-muted-foreground mt-2 text-sm">
//             AI-powered demand forecasting for agri commodities
//           </p>
//         </div>

//         <Card className="shadow-card">
//           {/* Tabs */}
//           <CardHeader className="pb-4">
//             <div className="flex gap-2">
//               <Button
//                 variant={isLogin ? "default" : "ghost"}
//                 className="flex-1"
//                 onClick={() => switchTab(true)}
//               >
//                 Login
//               </Button>
//               <Button
//                 variant={!isLogin ? "default" : "ghost"}
//                 className="flex-1"
//                 onClick={() => switchTab(false)}
//               >
//                 Sign Up
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             {/* Microsoft SSO */}
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full flex items-center gap-3"
//               size="lg"
//               onClick={handleMicrosoftLogin}
//             >
//               <MicrosoftIcon />
//               Continue with Microsoft
//             </Button>

//             {/* Divider */}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t border-border" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-card px-2 text-muted-foreground">or</span>
//               </div>
//             </div>

//             {/* ── LOGIN FORM ── */}
//             {isLogin && (
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="username">Email or Phone Number</Label>
//                   <Input
//                     id="username"
//                     type="text"
//                     placeholder="you@example.com or 9876543210"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="loginPassword">Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="loginPassword"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={loginPassword}
//                       onChange={(e) => setLoginPassword(e.target.value)}
//                       required
//                       className="pr-10"
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="text-right">
//                   <button
//                     type="button"
//                     className="text-xs text-primary hover:underline"
//                     onClick={() => {/* TODO: forgot password */}}
//                   >
//                     Forgot password?
//                   </button>
//                 </div>

//                 <Button type="submit" className="w-full" size="lg">
//                   Login
//                 </Button>
//               </form>
//             )}

//             {/* ── SIGN UP FORM ── */}
//             {!isLogin && (
//               <form onSubmit={handleSignUp} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">First Name</Label>
//                     <Input
//                       id="firstName"
//                       type="text"
//                       placeholder="John"
//                       value={firstName}
//                       onChange={(e) => setFirstName(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">Last Name</Label>
//                     <Input
//                       id="lastName"
//                       type="text"
//                       placeholder="Doe"
//                       value={lastName}
//                       onChange={(e) => setLastName(e.target.value)}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     placeholder="9876543210"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     pattern="[0-9]{10}"
//                     title="Enter a valid 10-digit phone number"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       className="pr-10"
//                       minLength={8}
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword">Confirm Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={confirmPassword}
//                       onChange={(e) => {
//                         setConfirmPassword(e.target.value);
//                         setPasswordError("");
//                       }}
//                       required
//                       className="pr-10"
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     >
//                       {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                   {passwordError && (
//                     <p className="text-xs text-destructive">{passwordError}</p>
//                   )}
//                 </div>

//                 <Button type="submit" className="w-full" size="lg">
//                   Create Account
//                 </Button>
//               </form>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Login;



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sprout, Eye, EyeOff } from "lucide-react";

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
    <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
    <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

const BACKEND_URL    = "https://34464xv038.execute-api.ap-south-1.amazonaws.com/prod";
const LAMBDA_API_URL = "/lambda/auth";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Login fields
  const [username, setUsername]           = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up fields
  const [firstName, setFirstName]               = useState("");
  const [lastName, setLastName]                 = useState("");
  const [email, setEmail]                       = useState("");
  const [phone, setPhone]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [passwordError, setPasswordError]       = useState("");

  // ── Forgot Password States ─────────────────────────────────────────────────
  const [showForgotPassword, setShowForgotPassword]     = useState(false);
  const [fpStep, setFpStep]                             = useState<"email" | "otp" | "newPassword">("email");
  const [fpEmail, setFpEmail]                           = useState("");
  const [fpOtp, setFpOtp]                               = useState("");
  const [fpNewPassword, setFpNewPassword]               = useState("");
  const [fpConfirmPassword, setFpConfirmPassword]       = useState("");
  const [fpError, setFpError]                           = useState("");
  const [fpLoading, setFpLoading]                       = useState(false);
  const [fpSuccess, setFpSuccess]                       = useState("");
  const [resendTimer, setResendTimer]                   = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ── Forgot Password Handlers ───────────────────────────────────────────────
  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFpError("");
    setFpLoading(true);
    try {
      const res = await fetch(LAMBDA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOTP", email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error); return; }
      setFpStep("otp");
      setResendTimer(30);
    } catch {
      setFpError("Network error. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError("");
    setFpLoading(true);
    try {
      const res = await fetch(LAMBDA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verifyOTP", email: fpEmail, otp: fpOtp }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error); return; }
      setFpStep("newPassword");
    } catch {
      setFpError("Network error. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError("");
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError("Passwords do not match");
      return;
    }
    setFpLoading(true);
    try {
      const res = await fetch(LAMBDA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", email: fpEmail, newPassword: fpNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error); return; }
      setFpSuccess("Password reset successfully! Please login.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setFpStep("email");
        setFpEmail("");
        setFpOtp("");
        setFpNewPassword("");
        setFpConfirmPassword("");
        setFpSuccess("");
      }, 2000);
    } catch {
      setFpError("Network error. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setFpStep("email");
    setFpError("");
    setFpEmail("");
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpSuccess("");
  };

  // ── Auth Handlers ──────────────────────────────────────────────────────────
  const handleMicrosoftLogin = () => {
    localStorage.removeItem("farmgate_logged_out");
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(LAMBDA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      localStorage.removeItem("farmgate_logged_out");
      localStorage.setItem("farmgate_jwt", data.token);
      localStorage.setItem("farmgate_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    setPasswordError("");
    try {
      const res = await fetch(LAMBDA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", firstName, lastName, email, phone, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      localStorage.removeItem("farmgate_logged_out");
      localStorage.setItem("farmgate_jwt", data.token);
      localStorage.setItem("farmgate_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const switchTab = (login: boolean) => {
    setIsLogin(login);
    setPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Sprout className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">FarmGate</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            AI-powered demand forecasting for agri commodities
          </p>
        </div>

        <Card className="shadow-card">
          {/* Tabs */}
          <CardHeader className="pb-4">
            <div className="flex gap-2">
              <Button variant={isLogin ? "default" : "ghost"} className="flex-1" onClick={() => switchTab(true)}>
                Login
              </Button>
              <Button variant={!isLogin ? "default" : "ghost"} className="flex-1" onClick={() => switchTab(false)}>
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Microsoft SSO */}
            <Button type="button" variant="outline" className="w-full flex items-center gap-3" size="lg" onClick={handleMicrosoftLogin}>
              <MicrosoftIcon />
              Continue with Microsoft
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* ── LOGIN FORM ── */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email or Phone Number</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="you@example.com or 9876543210"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* ── Forgot Password Button ── */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Login
                </Button>
              </form>
            )}

            {/* ── SIGN UP FORM ── */}
            {!isLogin && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} pattern="[0-9]{10}" title="Enter a valid 10-digit phone number" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" minLength={8} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }} required className="pr-10" />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Create Account
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-display">
                  {fpStep === "email"       && "Forgot Password"}
                  {fpStep === "otp"         && "Enter OTP"}
                  {fpStep === "newPassword" && "Set New Password"}
                </h2>
                <button onClick={closeForgotPassword} className="text-muted-foreground hover:text-foreground text-xl">
                  ✕
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2 mt-2">
                {["email", "otp", "newPassword"].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${
                      ["email", "otp", "newPassword"].indexOf(fpStep) >= i ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Success Message */}
              {fpSuccess && (
                <p className="text-sm text-green-600 font-medium text-center">✅ {fpSuccess}</p>
              )}

              {/* Error Message */}
              {fpError && (
                <p className="text-sm text-destructive text-center">{fpError}</p>
              )}

              {/* Step 1 — Email */}
              {fpStep === "email" && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your registered email. We'll send you a 6-digit OTP.
                  </p>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={fpLoading}>
                    {fpLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              )}

              {/* Step 2 — OTP */}
              {fpStep === "otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit OTP sent to <strong>{fpEmail}</strong>
                  </p>
                  <div className="space-y-2">
                    <Label>OTP Code</Label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={fpLoading}>
                    {fpLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Resend OTP in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={handleSendOTP}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Step 3 — New Password */}
              {fpStep === "newPassword" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your new password below.
                  </p>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={fpConfirmPassword}
                      onChange={(e) => setFpConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={fpLoading}>
                    {fpLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Login;