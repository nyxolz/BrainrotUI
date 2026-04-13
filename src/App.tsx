import React, { useState, useEffect, useRef } from "react";
import { Play, Trash2, Terminal, X, FileText, Wifi, WifiOff } from "lucide-react";
import { ScriptsBrowser } from "./components/scripts-browser";
import { Themes, THEMES } from "./components/Themes";
import { useMacsploit } from "./hooks/useMacsploit";


const LUA_KEYWORDS = ["and","break","do","else","elseif","end","false","for","function","if","in","local","nil","not","or","repeat","return","then","true","until","while","goto"];
const LUA_BUILTINS = ["print","tostring","tonumber","type","pairs","ipairs","next","select","unpack","rawget","rawset","rawequal","rawlen","setmetatable","getmetatable","require","pcall","xpcall","error","assert","load","loadstring","loadfile","dofile","collectgarbage","_G","_VERSION","math","string","table","io","os","coroutine","game","workspace","script","wait","spawn","delay","Instance","Vector3","CFrame","Color3","UDim2","UDim","TweenInfo","Enum","tick","time","task"];
const TC: Record<string,string> = { keyword:"#569cd6", builtin:"#dcdcaa", string:"#ce9178", number:"#b5cea8", comment:"#6a9955", operator:"#d4d4d4", ident:"#9cdcfe", text:"#d4d4d4" };

function tokenizeLua(code: string) {
  const tokens: { type: string; value: string }[] = [];
  let i = 0;
  while (i < code.length) {
    if (code[i]==="-"&&code[i+1]==="-") { let j=i; while(j<code.length&&code[j]!=="\n")j++; tokens.push({type:"comment",value:code.slice(i,j)}); i=j; continue; }
    if (code[i]==='"'||code[i]==="'") { const q=code[i]; let j=i+1; while(j<code.length&&code[j]!==q&&code[j]!=="\n"){if(code[j]==="\\")j++;j++;} tokens.push({type:"string",value:code.slice(i,j+1)}); i=j+1; continue; }
    if (/[0-9]/.test(code[i])||(code[i]==="."&&/[0-9]/.test(code[i+1]||""))) { let j=i; while(j<code.length&&/[0-9._xXa-fA-F]/.test(code[j]))j++; tokens.push({type:"number",value:code.slice(i,j)}); i=j; continue; }
    if (/[a-zA-Z_]/.test(code[i])) { let j=i; while(j<code.length&&/[a-zA-Z0-9_]/.test(code[j]))j++; const w=code.slice(i,j); tokens.push({type:LUA_KEYWORDS.includes(w)?"keyword":LUA_BUILTINS.includes(w)?"builtin":"ident",value:w}); i=j; continue; }
    if (/[+\-*/%^#&|~<>=(){}[\];:,.]/.test(code[i])) { tokens.push({type:"operator",value:code[i]}); i++; continue; }
    tokens.push({type:"text",value:code[i]}); i++;
  }
  return tokens;
}

interface Tab { id: number; name: string; code: string; }
let uid = 2;

export default function App() {
  const [page, setPage] = useState<"editor" | "scripts" | "themes">("editor");
  const [activeTheme, setActiveTheme] = useState("tung");
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, name: "untitled", code: 'print("tung tung sahur")' }]);
  const [activeId, setActiveId] = useState(1);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const consoleEnd = useRef<HTMLDivElement>(null);

  const { attached, connecting, activePort, instances, messages, clearMessages, attach, detach, execute } = useMacsploit();
  const tab = tabs.find(t => t.id === activeId)!;
  const currentThemeData = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  useEffect(() => {
    if (consoleOpen && consoleEnd.current) {
      consoleEnd.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, consoleOpen]);

  useEffect(() => {
    if (messages.length) setConsoleOpen(true);
  }, [messages.length]);

  const setCode = (code: string) => setTabs(p => p.map(t => t.id === activeId ? { ...t, code } : t));

  const syncScroll = () => {
    if (taRef.current && preRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const onTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const ta = taRef.current!;
    const s = ta.selectionStart;
    const next = tab.code.slice(0, s) + "  " + tab.code.slice(ta.selectionEnd);
    setCode(next);
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
  };

  const newTab = () => { const id = uid++; setTabs(p => [...p, { id, name: "untitled", code: "" }]); setActiveId(id); };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeId === id) setActiveId(next[Math.max(0, idx - 1)].id);
  };

  const autoAttach = async () => {
    if (connecting || attached) return;
    for (const port of instances) {
      try {
        const res: any = await attach(port);
        if (res !== false) return;
      } catch (err: any) {
        if (err?.toString().includes("AlreadyInjected")) return;
      }
    }
  };

  const run = async () => {
    if (!tab.code.trim()) return;
    await execute(tab.code);
  };

  const lines = tab.code.split("\n").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif", fontSize: "13px", background: "#050505", color: "#fff" }}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        textarea { scrollbar-width: thin; scrollbar-color: #333 transparent; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <img src={currentThemeData.img}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", filter: "brightness(0.5) saturate(0.9)" }} alt="" />
      </div>

      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: "rgba(0,0,0,0.85)", borderBottom: "1px solid #111", zIndex: 10, position: "relative", WebkitAppRegion: "drag" } as any}>
        <div style={{ display: "flex", gap: "6px", marginLeft: "auto", WebkitAppRegion: "no-drag" } as any}>
          {(["editor", "scripts", "themes"] as const).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: "4px 14px", fontSize: "10px", textTransform: "uppercase", cursor: "pointer", background: page === p ? "rgba(255,255,255,0.1)" : "transparent", color: page === p ? "#fff" : "#777", border: "none", borderRadius: "4px", fontWeight: "900" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}>
        {page === "scripts" ? (
          <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
            <ScriptsBrowser attached={attached} onExecute={execute} />
          </div>
        ) : page === "themes" ? (
          <div style={{ flex: 1, overflow: "auto" }}>
            <Themes currentTheme={activeTheme} onSelect={setActiveTheme} />
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.5)", borderBottom: "1px solid #111" }}>
              {tabs.map(t => (
                <div key={t.id} onClick={() => setActiveId(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", cursor: "pointer", background: t.id === activeId ? "rgba(255,255,255,0.05)" : "transparent", color: t.id === activeId ? "#fff" : "#666", borderRight: "1px solid #111", borderBottom: t.id === activeId ? "2px solid #fff" : "2px solid transparent" }}>
                  <FileText size={12} style={{ opacity: t.id === activeId ? 1 : 0.4 }} />
                  <span style={{ fontSize: "11px", fontWeight: t.id === activeId ? "700" : "400" }}>{t.name.toUpperCase()}</span>
                  {tabs.length > 1 && <span onClick={e => closeTab(t.id, e)} style={{ fontSize: "10px", opacity: 0.3 }}>✕</span>}
                </div>
              ))}
              <button onClick={newTab} style={{ padding: "0 15px", background: "transparent", color: "#444", border: "none", cursor: "pointer", fontSize: "16px" }}>+</button>
            </div>

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              <div style={{ padding: "12px 0", textAlign: "center", color: "#555", lineHeight: "22px", background: "rgba(0,0,0,0.2)", minWidth: "40px", userSelect: "none", fontSize: "11px" }}>
                {Array.from({ length: Math.max(lines, 1) }, (_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                <pre ref={preRef} style={{ position: "absolute", inset: 0, margin: 0, padding: "12px", lineHeight: "22px", whiteSpace: "pre", color: "#aaa", overflow: "hidden", pointerEvents: "none", fontFamily: "'Consolas', monospace" }}>
                  {tokenizeLua(tab.code).map((tok, i) => <span key={i} style={{ color: TC[tok.type] ?? TC.text }}>{tok.value}</span>)}
                </pre>
                <textarea ref={taRef} value={tab.code} onChange={e => setCode(e.target.value)} onScroll={syncScroll} onKeyDown={onTabKey} spellCheck={false}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: "12px", lineHeight: "22px", resize: "none", background: "transparent", color: "transparent", caretColor: "#fff", outline: "none", border: "none", fontFamily: "'Consolas', monospace", fontSize: "inherit", overflow: "auto" }}
                />
              </div>
            </div>

            {consoleOpen && (
              <div style={{ height: "160px", display: "flex", flexDirection: "column", borderTop: "1px solid #111", background: "rgba(5,5,5,0.98)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px", borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: "9px", color: "#888", fontWeight: "900", letterSpacing: "1px" }}>CONSOLE</span>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={clearMessages} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "9px", fontWeight: "800" }}>CLEAR</button>
                    <button onClick={() => setConsoleOpen(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}><X size={12} /></button>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                  {messages.length === 0 ? <div style={{ color: "#333", fontSize: "11px" }}>NO OUTPUT</div> : messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", fontSize: "11px", marginBottom: "4px" }}>
                      <span style={{ color: "#444", flexShrink: 0 }}>{m.time}</span>
                      <span style={{ color: m.type === "error" ? "#ff4444" : "#666", flexShrink: 0 }}>[{m.type.toUpperCase().slice(0, 3)}]</span>
                      <span style={{ color: m.type === "error" ? "#fca5a5" : "#fff", wordBreak: "break-all" }}>{m.text}</span>
                    </div>
                  ))}
                  <div ref={consoleEnd} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#000", borderTop: "1px solid #111", zIndex: 10, minHeight: "62px" }}>
        {page === "editor" ? (
          <>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { icon: <Trash2 size={18} />, action: () => setCode(""), title: "CLEAR" },
                { icon: <Terminal size={18} />, action: () => setConsoleOpen(!consoleOpen), title: "CONSOLE", active: consoleOpen }
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} title={btn.title}
                  style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", background: btn.active ? "rgba(255,255,255,0.1)" : "#080808", color: btn.active ? "#fff" : "#444", border: "1px solid #111", borderRadius: "6px", cursor: "pointer" }}>
                  {btn.icon}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={attached ? detach : autoAttach} disabled={connecting}
                style={{ padding: "0 20px", height: "38px", background: "#080808", color: attached ? "#4ade80" : "#fff", border: "1px solid #111", borderRadius: "6px", fontSize: "10px", fontWeight: "900", cursor: "pointer", letterSpacing: "0.5px" }}>
                {connecting ? "CONNECTING..." : attached ? "CONNECTED" : "ATTACH"}
              </button>
              <button onClick={run} disabled={!attached} title="EXECUTE"
                style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", background: "#080808", color: attached ? "#fff" : "#222", border: "1px solid #111", borderRadius: "6px", cursor: attached ? "pointer" : "not-allowed" }}>
                <Play size={18} fill={attached ? "currentColor" : "none"} style={{ opacity: attached ? 1 : 0.4 }} />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
