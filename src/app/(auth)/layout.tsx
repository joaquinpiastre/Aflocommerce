import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex flex-col items-center gap-3">
          <Image
            src="/brand/aflo-logo-original.jpeg"
            alt="Aflo"
            width={64}
            height={95}
            className="rounded-sm border border-border"
          />
          <span className="text-3xl text-foreground">Aflo</span>
        </Link>
        <div className="rounded-sm border border-border bg-card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
