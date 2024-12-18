"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          userButtonBox: "hover:opacity-80 transition-opacity",
        },
      }}
    />
  );
}
