import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-4xl text-foreground">Mi cuenta</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <AccountNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
