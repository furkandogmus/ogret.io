import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, MessageSquare, CheckCheck, Trash2, BookOpen, XCircle, Star, Award, CheckCircle } from "lucide-react";
import { useNotifications } from "../../providers/NotificationProvider";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "message":
        return { bg: "bg-blue-50", color: "text-blue-600", Icon: MessageSquare };
      case "lesson_request":
        return { bg: "bg-amber-50", color: "text-amber-600", Icon: BookOpen };
      case "lesson_confirmed":
        return { bg: "bg-emerald-50", color: "text-emerald-600", Icon: CheckCircle };
      case "lesson_cancelled":
        return { bg: "bg-red-50", color: "text-red-600", Icon: XCircle };
      case "lesson_completed":
        return { bg: "bg-teal-50", color: "text-teal-600", Icon: CheckCircle };
      case "review":
        return { bg: "bg-yellow-50", color: "text-yellow-600", Icon: Star };
      case "reference_approved":
        return { bg: "bg-purple-50", color: "text-purple-600", Icon: Award };
      default:
        return { bg: "bg-emerald-50", color: "text-emerald-600", Icon: Bell };
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px] text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">Bildirimler</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Tümünü okundu işaretle"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Bildirim bulunmuyor</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const style = getNotificationStyle(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted ${
                      !n.read ? "bg-primary/5" : ""
                    } border-b border-border/50 last:border-0`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${style.bg} ${style.color}`}>
                      <style.Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground text-xs">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}
