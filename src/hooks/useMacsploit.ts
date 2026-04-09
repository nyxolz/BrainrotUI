import { useState, useRef, useCallback, useEffect } from "react";

const { ipcRenderer } = (window as any).require("electron");

export interface ConsoleMessage {
  type: "print" | "error" | "system";
  text: string;
  time: string;
}

export function useMacsploit() {
  const [attached, setAttached] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activePort, setActivePort] = useState<number | null>(null);
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);

  const instances = Array.from({ length: 10 }, (_, i) => 5553 + i);

  // tung tung
  const addMessage = useRef((type: ConsoleMessage["type"], text: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setMessages(prev => [...prev, { type, text, time }]);
  }).current;

  useEffect(() => {
    ipcRenderer.on("macsploit:message", (_: any, { text, type }: { text: string; type: "print" | "error" }) => {
      addMessage(type, text);
    });
    ipcRenderer.on("macsploit:closed", () => {
      setAttached(false);
      setActivePort(null);
      addMessage("system", "Disconnected.");
    });
    return () => {
      ipcRenderer.removeAllListeners("macsploit:message");
      ipcRenderer.removeAllListeners("macsploit:closed");
    };
  }, []);

  const attach = useCallback(async (port: number) => {
    setConnecting(true);
    addMessage("system", `Connecting to port ${port}...`);
    const result = await ipcRenderer.invoke("macsploit:attach", port);
    if (result.ok) {
      setAttached(true);
      setActivePort(port);
      addMessage("system", `Attached to port ${port}.`);
    } else {
      addMessage("error", result.error ?? "Failed to attach.");
      setAttached(false);
      setActivePort(null);
    }
    setConnecting(false);
  }, []);

  const detach = useCallback(async () => {
    await ipcRenderer.invoke("macsploit:detach");
    setAttached(false);
    setActivePort(null);
    addMessage("system", "Detached.");
  }, []);

  const execute = useCallback(async (script: string) => {
    const result = await ipcRenderer.invoke("macsploit:execute", script);
    if (!result.ok) addMessage("error", result.error ?? "Execute failed.");
    else addMessage("system", "Script executed.");
  }, []);

  const updateSetting = useCallback(async (key: string, value: boolean) => {
    await ipcRenderer.invoke("macsploit:setting", key, value);
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    attached, connecting, activePort,
    instances, messages, clearMessages,
    attach, detach, execute, updateSetting,
  };
}