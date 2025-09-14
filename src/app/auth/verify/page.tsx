"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { postRequestSend } from "@/components/ApiCall/methord";

const VERIFY_API = "/api/v1/auth/email-verify";

const Verify = () => {
  const router = useRouter();
  const pathname = usePathname(); // current URL path
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]); // 6 slots

  // URL থেকে email এবং code নিয়ে আসা
  useEffect(() => {
    // window.location.search থেকে query params বের করা
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const queryEmail = params.get("email") || "";
    const queryCode = params.get("code") || "";

    setEmail(queryEmail);

    if (queryCode.length === 6) {
      const codeArr = queryCode.split("");
      setCode(codeArr);

      // Auto-submit যদি 6-digit code থাকে
      handleVerifyAuto(queryEmail, queryCode);
    }
  }, [pathname]); // pathname change হলে আবার check করবে

  const handleVerifyAuto = async (email: string, codeStr: string) => {
    setLoading(true);
    try {
      const res = await postRequestSend(VERIFY_API, {}, { email, code: codeStr });

      if (res.status === 200) {
        toast.success(res.message || "Email verified successfully 🎉");
        router.push("/auth/login");
      } else {
        toast.error(res.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = code.join("");
    handleVerifyAuto(email, codeStr);
  };

  return (
    <section className="w-full h-auto">
      <div className="container m-auto flex justify-center items-center">
        <div className="w-full max-w-md h-auto py-40 px-6">
          <form
            onSubmit={handleVerifyManual}
            className="flex flex-col items-center align-middle justify-center gap-6 border p-6 rounded-xl shadow-md"
          >
            <h1 className="text-xl font-bold text-center">Verify Your Email</h1>
            <p className="text-sm text-center text-muted-foreground">
              Enter the verification code sent to your email.
            </p>

            {/* OTP Input */}
            <InputOTP
              maxLength={6}
              value={code.join("")}
              onChange={(val) => {
                const valArr = val.split("").slice(0, 6);
                setCode([...valArr, ...Array(6 - valArr.length).fill("")]);
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {/* Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || code.join("").length < 6}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Verify;
