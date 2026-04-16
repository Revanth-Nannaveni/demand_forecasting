// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Sprout } from "lucide-react";

// const Login = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4">
//       <div className="w-full max-w-md animate-fade-in">
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
//           <CardHeader className="pb-4">
//             <div className="flex gap-2">
//               <Button
//                 variant={isLogin ? "default" : "ghost"}
//                 className="flex-1"
//                 onClick={() => setIsLogin(true)}
//               >
//                 Login
//               </Button>
//               <Button
//                 variant={!isLogin ? "default" : "ghost"}
//                 className="flex-1"
//                 onClick={() => setIsLogin(false)}
//               >
//                 Sign Up
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full" size="lg">
//                 {isLogin ? "Login" : "Create Account"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Login;


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Sprout } from "lucide-react";

// // Microsoft logo as an inline SVG — no extra dependency needed
// const MicrosoftIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
//     <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
//     <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
//     <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
//     <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
//   </svg>
// );

// // ── Change this to your FastAPI backend URL ────────────────────────────────────
// const BACKEND_URL = "http://localhost:8000";

// const Login = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   // Regular email/password submit (your existing logic)
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     navigate("/dashboard");
//   };

//   // Microsoft SSO — simply redirect the browser to the FastAPI login endpoint.
//   // FastAPI will redirect to Microsoft, handle the callback, set the session
//   // cookie, then redirect back to your app (see FRONTEND_REDIRECT_URL in backend).
//   const handleMicrosoftLogin = () => {
//     window.location.href = `${BACKEND_URL}/auth/login`;
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4">
//       <div className="w-full max-w-md animate-fade-in">
//         {/* Logo + title */}
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
//           {/* Login / Sign Up tabs */}
//           <CardHeader className="pb-4">
//             <div className="flex gap-2">
//               <Button
//                 variant={isLogin ? "default" : "ghost"}
//                 className="flex-1"
//                 onClick={() => setIsLogin(true)}
//               >
//                 Login
//               </Button>
//               <Button
//                 variant={!isLogin ? "default" : "ghost"}
//                 className="flex-1"
//                 onClick={() => setIsLogin(false)}
//               >
//                 Sign Up
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             {/* ── Microsoft SSO button ── */}
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

//             {/* Email / password form (your existing form, unchanged) */}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full" size="lg">
//                 {isLogin ? "Login" : "Create Account"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Login;



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

// const BACKEND_URL = "http://localhost:8000";

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
//     window.location.href = `${BACKEND_URL}/auth/login`;
//   };


//   // Add this near the top with BACKEND_URL
// const LAMBDA_API_URL = "/lambda/auth"; // ← paste your URL here

// // const handleLogin = async (e: React.FormEvent) => {
// //   e.preventDefault();
// //   try {
// //     const res = await fetch(LAMBDA_API_URL, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ action: "login", username, password: loginPassword }),
// //     });
// //     const data = await res.json();
// //     if (!res.ok) { alert(data.error); return; }
// //     // Save user to localStorage
// //     localStorage.setItem("farmgate_local_user", JSON.stringify(data.user));
// //     navigate("/dashboard");
// //   } catch {
// //     alert("Network error. Please try again.");
// //   }
// // };


// // const handleSignUp = async (e: React.FormEvent) => {
// //   e.preventDefault();
// //   if (password !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
// //   setPasswordError("");
  
// //   console.log("Sending to:", LAMBDA_API_URL);  // ← add this
// //   console.log("Payload:", { action: "signup", firstName, lastName, email, phone }); // ← add this
  
// //   try {
// //     const res = await fetch(LAMBDA_API_URL, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ action: "signup", firstName, lastName, email, phone, password, confirmPassword }),
// //     });
    
// //     console.log("Response status:", res.status);  // ← add this
// //     const data = await res.json();
// //     console.log("Response data:", data);  // ← add this
    
// //     if (!res.ok) { alert(data.error); return; }
// //     alert("Account created! Please log in.");
// //     switchTab(true);
// //   } catch(err) {
// //     console.log("Error:", err);  // ← update this
// //     alert("Network error. Please try again.");
// //   }
// // };


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

import { useState } from "react";
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

const BACKEND_URL = "http://localhost:8000";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Login fields
  const [username, setUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleMicrosoftLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };


  // Add this near the top with BACKEND_URL
const LAMBDA_API_URL = "/lambda/auth"; // ← paste your URL here

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
//     // Save user to localStorage
//     localStorage.setItem("farmgate_local_user", JSON.stringify(data.user));
//     navigate("/dashboard");
//   } catch {
//     alert("Network error. Please try again.");
//   }
// };


// const handleSignUp = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (password !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
//   setPasswordError("");
  
//   console.log("Sending to:", LAMBDA_API_URL);  // ← add this
//   console.log("Payload:", { action: "signup", firstName, lastName, email, phone }); // ← add this
  
//   try {
//     const res = await fetch(LAMBDA_API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ action: "signup", firstName, lastName, email, phone, password, confirmPassword }),
//     });
    
//     console.log("Response status:", res.status);  // ← add this
//     const data = await res.json();
//     console.log("Response data:", data);  // ← add this
    
//     if (!res.ok) { alert(data.error); return; }
//     alert("Account created! Please log in.");
//     switchTab(true);
//   } catch(err) {
//     console.log("Error:", err);  // ← update this
//     alert("Network error. Please try again.");
//   }
// };


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
              <Button
                variant={isLogin ? "default" : "ghost"}
                className="flex-1"
                onClick={() => switchTab(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                className="flex-1"
                onClick={() => switchTab(false)}
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Microsoft SSO */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-3"
              size="lg"
              onClick={handleMicrosoftLogin}
            >
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

                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => {/* TODO: forgot password */}}
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
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                      minLength={8}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-destructive">{passwordError}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Create Account
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;