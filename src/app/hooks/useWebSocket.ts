import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import type { MessageResponse } from "../api/services";

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [incoming, setIncoming] = useState<MessageResponse[]>([]);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: `/ws/chat`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/user/queue/messages", (msg) => {
          try {
            const body: MessageResponse = JSON.parse(msg.body);
            setIncoming((prev) => [...prev, body]);
          } catch { /* ignore */ }
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [token]);

  const sendMessage = useCallback(
    (receiverId: string, content: string) => {
      const client = clientRef.current;
      if (client?.connected) {
        client.publish({
          destination: `/app/chat.send/${receiverId}`,
          body: JSON.stringify({ content }),
        });
      }
    },
    []
  );

  return { connected, incoming, sendMessage };
}
