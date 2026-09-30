import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";

export default async function HomePage() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
