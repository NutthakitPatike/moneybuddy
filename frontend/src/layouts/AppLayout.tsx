import { Bot, ChartNoAxesCombined, CreditCard, Home, Layers3, LogOut, PieChart, Repeat, Settings, Tags } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";

const nav = [
  { to: "/dashboard", label: "หน้าหลัก", icon: Home },
  { to: "/transactions", label: "รายการ", icon: CreditCard },
  { to: "/categories", label: "หมวดหมู่", icon: Tags },
  { to: "/budget", label: "งบ", icon: PieChart },
  { to: "/reports", label: "รายงาน", icon: ChartNoAxesCombined },
  { to: "/recurring", label: "ประจำ", icon: Repeat },
  { to: "/ai", label: "AI", icon: Bot },
  { to: "/settings", label: "ตั้งค่า", icon: Settings }
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="min-h-screen bg-cream soft-grid text-cocoa">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-white/80 bg-white/72 p-5 backdrop-blur-xl lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-emerald-700">
            <Layers3 />
          </div>
          <div>
            <p className="text-xl font-black">Money Buddy</p>
            <p className="text-xs text-cocoa/60">เพื่อนคู่คิดเรื่องเงิน</p>
          </div>
        </div>
        <nav className="grid gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-blush text-rose-700 shadow-sm" : "hover:bg-white"}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-skysoft p-4">
          <div className="mb-3 flex items-center gap-3">
            {avatar ? <img src={avatar} className="h-10 w-10 rounded-full" alt="" /> : <div className="h-10 w-10 rounded-full bg-rose-200" />}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.user_metadata?.full_name ?? user?.email}</p>
              <p className="truncate text-xs text-cocoa/60">{user?.email}</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full" onClick={signOut}>
            <LogOut size={16} /> ออกจากระบบ
          </Button>
        </div>
      </aside>
      <main className="pb-28 lg:ml-72 lg:pb-0">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex gap-1 overflow-x-auto border-t border-white/80 bg-white/90 px-2 py-2 backdrop-blur-xl lg:hidden">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `grid min-w-16 flex-1 place-items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${isActive ? "bg-blush text-rose-700" : ""}`}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
