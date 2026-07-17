import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import type { MessageResponse } from "../api/services";
import { useAuth } from "../providers/AuthProvider";

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [incoming, setIncoming] = useState<MessageResponse[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}://${window.location.host}/ws/chat`;
    const client = new Client({
      brokerURL: wsUrl,
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
  }, [isAuthenticated]);

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
