import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../providers/AuthProvider";
import { messageApi } from "../api/services";

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const { data } = await messageApi.getUnread();
      setCount(data.filter((m) => !m.read).length);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    fetch();
    intervalRef.current = setInterval(fetch, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetch]);

  return count;
}
