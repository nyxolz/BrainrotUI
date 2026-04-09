import { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ConsoleMessage } from "../hooks/useMacsploit";

interface ExecutionConsoleProps {
  messages: ConsoleMessage[];
  attached: boolean;
  onClear: () => void;
}

export function ExecutionConsole({ messages, attached, onClear }: ExecutionConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages]);

  const color = (t: ConsoleMessage["type"]) =>
    t==="error" ? "text-red-400" : t==="system" ? "text-white/40" : "text-[#06d6a0]";

  const prefix = (t: ConsoleMessage["type"]) =>
    t==="error" ? "[ERR]" : t==="system" ? "[SYS]" : "[OUT]";

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden flex flex-col h-full bg-black/70">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0 bg-black/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/30">CONSOLE</span>
          <div className="flex items-center gap-1.5 ml-2">
            <div className={`w-1.5 h-1.5 rounded-full ${attached ? "bg-[#06d6a0]" : "bg-white/15"}`} style={attached?{boxShadow:"0 0 5px #06d6a0"}:{}} />
            <span className={`text-[10px] font-bold tracking-widest ${attached ? "text-[#06d6a0]" : "text-white/20"}`}>
              {attached ? "LIVE" : "IDLE"}
            </span>
          </div>
        </div>
        <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors px-2 py-1 rounded hover:bg-white/5">
          <Trash2 className="w-3 h-3" /> CLEAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center gap-2 text-white/15 mt-2">
            <span>{">"}</span>
            <span className="tracking-widest">brr brr patapim...</span>
            <span className="animate-pulse">_</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{duration:0.12}}
                className="flex gap-2 leading-relaxed">
                <span className="text-white/15 flex-shrink-0 select-none">{msg.time}</span>
                <span className={`flex-shrink-0 font-bold ${color(msg.type)}`}>{prefix(msg.type)}</span>
                <span className={`break-all ${color(msg.type)} opacity-80`}>{msg.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}