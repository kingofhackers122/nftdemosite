import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { User, Shield } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Mintograph" }] }),
  component: SettingsLayout,
});

function SettingsLayout() {
  const loc = useLocation();
  const tabs = [
    { to: "/settings/profile" as const, label: "Profile", icon: User },
    { to: "/settings/security" as const, label: "Security", icon: Shield },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Settings</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
          <nav className="flex md:flex-col gap-1">
            {tabs.map((t) => {
              const active = loc.pathname === t.to;
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />{t.label}
                </Link>
              );
            })}
          </nav>
          <div><Outlet /></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}