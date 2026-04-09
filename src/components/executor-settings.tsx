import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, Monitor, Globe, Wifi, WifiOff } from "lucide-react";

interface ExecutorSettingsProps {
  attached: boolean;
  connecting: boolean;
  activePort: number | null;
  instances: { port: number }[];
  onAttach: (port: number) => void;
  onDetach: () => void;
  onUpdateSetting: (key: string, value: boolean) => void;
  onToggleRpc?: (enabled: boolean) => void;
}

export function ExecutorSettings({ attached, connecting, activePort, instances, onAttach, onDetach, onUpdateSetting }: ExecutorSettingsProps) {
  const [settings, setSettings] = useState({ fpsUnlock: true, httpTraffic: true });

  const toggle = (key: keyof typeof settings) => {
    const v = !settings[key];
    setSettings(p => ({ ...p, [key]: v }));
    onUpdateSetting(key, v);
  };

  return (
    <div className="space-y-4 max-w-2xl">

      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/60">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/30">ATTACH TO ROBLOX</span>
          {attached && (
            <button
              onClick={onDetach}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all">
              <WifiOff className="w-3 h-3"/> DETACH
            </button>
          )}
        </div>
        <div className="p-4">
          {instances.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-4 tracking-widest">NO INSTANCES DETECTED — OPEN ROBLOX FIRST</p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {instances.map(ins => (
                <button
                  key={ins.port}
                  onClick={() => activePort===ins.port ? onDetach() : onAttach(ins.port)}
                  className={`py-4 rounded-lg border text-xs font-black tracking-widest transition-all flex flex-col items-center gap-2 ${
                    activePort===ins.port
                      ? "border-[#06d6a0]/40 text-[#06d6a0] bg-[#06d6a0]/10"
                      : "border-white/8 text-white/30 bg-white/[0.02] hover:text-white/60 hover:border-white/15"
                  }`}>
                  {connecting && activePort===ins.port
                    ? <Loader2 className="w-4 h-4 animate-spin"/>
                    : <Wifi className={`w-4 h-4 ${activePort===ins.port ? "text-[#06d6a0]" : "text-white/20"}`}/>
                  }
                  {ins.port}
                </button>
              ))}
            </div>
          )}
          {attached && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#06d6a0]/20 bg-[#06d6a0]/05">
              <div className="w-2 h-2 rounded-full bg-[#06d6a0]" style={{boxShadow:"0 0 6px #06d6a0"}}/>
              <span className="text-xs font-bold text-[#06d6a0] tracking-widest">ATTACHED TO PORT {activePort}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Toggle
          icon={<Monitor className="w-4 h-4 text-[#ff9f1c]"/>}
          title="FPS UNLOCKER"
          desc="Remove the 60 FPS cap"
          active={settings.fpsUnlock}
          onToggle={() => toggle("fpsUnlock")}
        />
        <Toggle
          icon={<Globe className="w-4 h-4 text-[#ff4d6d]"/>}
          title="ALLOW HTTP TRAFFIC"
          desc="Required for web-based scripts"
          active={settings.httpTraffic}
          onToggle={() => toggle("httpTraffic")}
        />
      </div>
    </div>
  );
}

function Toggle({ icon, title, desc, active, onToggle }: { icon: React.ReactNode; title: string; desc: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 flex items-center justify-between bg-black/60">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs font-black text-white tracking-widest">{title}</p>
          <p className="text-xs text-white/25 mt-0.5">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="w-10 h-5 rounded-full relative transition-colors shrink-0"
        style={{background: active ? "#ff4d6d" : "rgba(255,255,255,0.08)"}}>
        <motion.div
          animate={{x: active ? 22 : 2}}
          transition={{type:"spring",stiffness:500,damping:30}}
          className="absolute top-1 w-3 h-3 bg-white rounded-full"
          style={{boxShadow:"0 1px 3px rgba(0,0,0,0.4)"}}
        />
      </button>
    </div>
  );
}