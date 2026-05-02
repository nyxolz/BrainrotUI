import { useState, useCallback } from "react";

const Net = (window as any).require("net");
const Zlib = (window as any).require("zlib");

const PORTS = ["8392", "8393", "8394", "8395", "8396", "8397"];

interface Message {
  time: string;
  type: "info" | "error";
  text: string;
}

export function useOpiumware() {
  const [attached, setAttached] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activePort, setActivePort] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const log = (text: string, type: "info" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setMessages((p) => [...p, { time, type, text }]);
  };

  const clearMessages = useCallback(() => setMessages([]), []);

  const connect = useCallback(async (): Promise<{ stream: any; port: string } | null> => {
    for (const port of PORTS) {
      try {
        const stream = await new Promise<any>((resolve, reject) => {
          const socket = Net.createConnection({ host: "127.0.0.1", port: parseInt(port) }, () => resolve(socket));
          socket.on("error", reject);
        });
        return { stream, port };
      } catch {}
    }
    return null;
  }, []);

  const attach = useCallback(async () => {
    if (connecting || attached) return;
    setConnecting(true);
    try {
      const result = await connect();
      if (result) {
        result.stream.end();
        setAttached(true);
        setActivePort(result.port);
        log(`Connected to Opiumware on port ${result.port}`);
      } else {
        log("Failed to connect on all ports", "error");
      }
    } finally {
      setConnecting(false);
    }
  }, [connecting, attached, connect]);

  const detach = useCallback(() => {
    setAttached(false);
    setActivePort(null);
    log("Disconnected from Opiumware");
  }, []);

  const execute = useCallback(async (code: string) => {
    const result = await connect();
    if (!result) { log("Failed to connect on all ports", "error"); return; }
    const { stream } = result;
    const prefixed = `OpiumwareScript ${code}`;
    try {
      await new Promise<void>((resolve, reject) => {
        Zlib.deflate(Buffer.from(prefixed, "utf8"), (err: any, compressed: Buffer) => {
          if (err) return reject(err);
          stream.write(compressed, (writeErr: any) => {
            if (writeErr) return reject(writeErr);
            resolve();
          });
        });
      });
      stream.end();
      log(`Script sent (${prefixed.length} chars)`);
    } catch (err: any) {
      stream.destroy();
      log(`Error sending script: ${err.message}`, "error");
    }
  }, [connect]);

  return { attached, connecting, activePort, messages, clearMessages, attach, detach, execute };
}