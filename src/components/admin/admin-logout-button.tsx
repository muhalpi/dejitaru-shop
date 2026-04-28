"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      className="border-white/30 bg-transparent text-blue-100 hover:border-fuchsia-300/50 hover:bg-white/10 hover:text-white"
    >
      Logout
    </Button>
  );
}
