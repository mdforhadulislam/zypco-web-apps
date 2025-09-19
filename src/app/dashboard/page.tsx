"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";

const DashBoard = () => {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <div>
      DashBoard
      <Button
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default DashBoard;
