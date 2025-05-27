import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import Image from "next/image";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/auth/signin");
  }
}
