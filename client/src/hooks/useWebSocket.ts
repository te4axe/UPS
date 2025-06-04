import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  title: string;
  message: string;
  orderId?: number;
  [key: string]: any;
}

export function useWebSocket(userId?: number) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      // Authenticate the WebSocket connection
      ws.current?.send(JSON.stringify({
        type: "auth",
        userId: userId,
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        // Show toast notification
        toast({
          title: data.title,
          description: data.message,
          variant: data.type === "error" ? "destructive" : "default",
        });
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [userId, toast]);

  return {
    isConnected,
    sendMessage: (message: any) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      }
    },
  };
}
