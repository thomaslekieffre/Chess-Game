"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function UserButton() {
  const router = useRouter();
  const { user } = useUser();

  const handleManageAccount = () => {
    router.push("/profile");
  };

  return (
    <div className="relative">
      <button
        onClick={handleManageAccount}
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <img
          src={user?.imageUrl}
          alt="User Profile"
          className="w-8 h-8 rounded-full"
        />
      </button>
    </div>
  );
}
