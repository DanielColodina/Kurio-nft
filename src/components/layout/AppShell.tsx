import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
export function AppShell() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <MobileNav />
    </>
  );
}
