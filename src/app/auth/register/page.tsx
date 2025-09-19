"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { postRequestSend } from "@/components/ApiCall/methord";
import { SIGNUP_API } from "@/components/ApiCall/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/utilities/Logo";
import Link from "next/link";

const ZypcoRegister = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await postRequestSend(SIGNUP_API, {}, userData);

      if (res.status === 201 || res.status === 200) {
        toast.success("Registration successful 🎉");
        router.push("/auth/login"); // redirect to login after signup
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-auto">
      <div className="container m-auto flex justify-center items-center">
        <div className="w-100 h-auto px-2 pt-6 pb-35">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <div className="flex flex-col gap-6">
              {/* Logo + Title */}
              <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
                  <div className="flex size-50 items-center justify-center rounded-md">
                    <Logo width={100} height={120} isFooter={true} />
                  </div>
                  <span className="sr-only">Zypco</span>
                </a>
                <h1 className="text-xl font-bold">Create your Zypco account</h1>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    value={userData.name}
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+8801XXXXXXXXXX"
                    required
                    value={userData.phone}
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    value={userData.email}
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
                    value={userData.password}
                    onChange={onChangeHandler}
                  />
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
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

export default ZypcoRegister;
