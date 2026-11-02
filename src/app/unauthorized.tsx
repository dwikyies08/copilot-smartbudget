import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unauthorized",
  description: "Please login to access this page.",
};


export default function UnauthorizedPage() {
  return (
    <main>
      <h1>401 - Unauthorized</h1>
      <p>Kamu harus login untuk mengakses halaman ini.</p>
      <Link href="/login">Ke halaman login</Link>
    </main>
  );
}