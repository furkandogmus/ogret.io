import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  BookOpen, Search, MessageSquare, User, BarChart2, Home,
  Menu, X, Shield, LogOut, ChevronDown, Heart, Zap
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { NotificationBell } from "../shared/NotificationBell";

const PUBLIC_ITEMS = [
  { label: "Ana Sayfa", path: "/", icon: Home },
  { label: "Öğretmen Ara", path: "/arama", icon: Search },
  { label: "Blog", path: "/blog", icon: BookOpen },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    ...PUBLIC_ITEMS,
    ...(isAuthenticated && user?.role === "STUDENT" ? [
      { label: "Mesajlar", path: "/mesajlar", icon: MessageSquare },
      { label: "Öğrenci Paneli", path: "/ogrenci-panel", icon: User },
    ] : []),
    ...(isAuthenticated && user?.role === "TUTOR" ? [
      { label: "Mesajlar", path: "/mesajlar", icon: MessageSquare },
      { label: "Öğretmen Paneli", path: "/ogretmen-panel", icon: BarChart2 },
    ] : []),
    ...(isAuthenticated && user?.role === "ADMIN" ? [
      { label: "Admin", path: "/admin", icon: Shield },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:shadow-lg group-hover:shadow-emerald-600/30 transition-shadow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            öğret<span className="text-primary">.io</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-black/[0.03] transition-colors"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                  {user?.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl elevation-lg py-1.5 z-20">
                    <Link
                      to="/profil/duzenle"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      Profilim
                    </Link>
                    <hr className="mx-3 my-1 border-border" />
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate("/giris")}
                className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-black/[0.03] transition-colors"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => navigate("/kayit")}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-semibold btn-glow"
              >
                Öğretmen Ol
              </button>
            </div>
          )}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/[0.03] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <hr className="border-border my-2" />
          {isAuthenticated ? (
            <>
              <Link
                to="/profil/duzenle"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <User className="w-4 h-4" />
                Profilim
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate("/giris"); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => { navigate("/kayit"); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
              >
                Öğretmen Ol
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
