"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { postRequestSend } from "@/components/ApiCall/methord";
import { SIGNIN_API } from "@/components/ApiCall/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/utilities/Logo";
import Link from "next/link"; 
import { useAuth } from "@/hooks/AuthContext";

const ZypcoLogin = () => {
  const router = useRouter();
  const { login } = useAuth(); // ✅ Use Auth Context
  const [loading, setLoading] = useState(false);
  const [userCredential, setUserCredential] = useState({
    phone: "",
    password: "",
  });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserCredential({
      ...userCredential,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Call backend API
      const res = await postRequestSend(SIGNIN_API, {}, userCredential);

      if (res.status == 200) {
        const userData = res.data;

        console.log(userData);
        

        // ✅ Save user in global AuthContext
        const success = await login(userCredential.phone, userCredential.password);
        if (success) {
          toast.success("Login successful 🎉");
          router.push("/dashboard"); // redirect to dashboard or homepage
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else {
        toast.error(res.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-auto">
      <div className="container m-auto flex justify-center items-center">
        <div className="w-100 h-auto py-20 pb-35 px-2 pt-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="flex flex-col gap-6">
              {/* Logo + Title */}
              <div className="flex flex-col items-center gap-2">
                <Link href={"/"} className="flex flex-col items-center gap-2 font-medium">
                  <div className="flex size-50 items-center justify-center rounded-md">
                    <Logo width={100} height={120} isFooter={true} />
                  </div>
                  <span className="sr-only">Zypco</span>
                </Link>
                <h1 className="text-xl font-bold">Welcome to Zypco</h1>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+8801XXXXXXXXXX"
                    required
                    value={userCredential.phone}
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="*******"
                    required
                    value={userCredential.password}
                    onChange={onChangeHandler}
                  />
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>
            </div>
          </form>

          {/* Terms */}
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZypcoLogin;
