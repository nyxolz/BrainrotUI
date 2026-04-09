import { useState, useEffect } from "react";
import { Loader2, Copy, Play } from "lucide-react";

const API_BASE = "https://scriptblox.com/api";

interface Script {
  _id: string;
  title: string;
  game: string;
  script?: string;
  slug?: string;
}

interface Props {
  attached: boolean;
  onExecute: (script: string) => void;
}

export function ScriptsBrowser({ attached, onExecute }: Props) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { fetchScripts(); }, []);

  const fetchScripts = async () => {
    setLoading(true);
    setStatus("");
    try {
      const r = await fetch(`${API_BASE}/script/fetch?page=1`);
      const d = await r.json();
      if (d.result?.scripts) setScripts(d.result.scripts.map(mapScript));
    } catch { setStatus("FETCH FAILED"); }
    finally { setLoading(false); }
  };

  const doSearch = async () => {
    if (!query.trim()) { fetchScripts(); return; }
    setLoading(true);
    setStatus("");
    try {
      const r = await fetch(`${API_BASE}/script/search?q=${encodeURIComponent(query)}&max=20`);
      const d = await r.json();
      if (d.result?.scripts) setScripts(d.result.scripts.map(mapScript));
      else setScripts([]);
    } catch { setStatus("SEARCH FAILED"); }
    finally { setLoading(false); }
  };

  const mapScript = (s: any): Script => ({
    _id: s._id || s.slug,
    title: s.title,
    game: s.game?.name || "Universal",
    script: s.script,
    slug: s.slug,
  });

  const getFullCode = async (script: Script) => {
    if (script.script) return script.script;
    try {
      const r = await fetch(`${API_BASE}/script/${script.slug}`);
      const d = await r.json();
      return d.script?.script;
    } catch { return null; }
  };

  const runScript = async (script: Script) => {
    const code = await getFullCode(script);
    if (!code) { setStatus("DOWNLOAD FAILED"); return; }
    onExecute(code);
    setStatus(`EXECUTED: ${script.title.toUpperCase()}`);
  };

  const copyToClipboard = async (script: Script) => {
    const code = await getFullCode(script);
    if (code) {
      navigator.clipboard.writeText(code);
      setStatus("COPIED TO CLIPBOARD");
    }
  };

  return (
    <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#888" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="SEARCH SCRIPTS..."
          style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid #111", color: "#E0E0E0", padding: "10px 12px", fontSize: "11px", fontWeight: "700", outline: "none", borderRadius: "4px" }}
        />
        <button onClick={doSearch} style={{ padding: "0 20px", background: "#111", color: "#E0E0E0", border: "1px solid #222", fontSize: "10px", fontWeight: "900", cursor: "pointer", borderRadius: "4px" }}>
          SEARCH
        </button>
      </div>

      {status && <div style={{ fontSize: "9px", color: "#444", marginBottom: "10px", fontWeight: "900", letterSpacing: "1px" }}>{status}</div>}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={18} className="animate-spin" style={{ color: "#222" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
          {scripts.map(script => (
            <div key={script._id} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #111", padding: "12px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#E0E0E0", fontWeight: "800", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{script.title.toUpperCase()}</div>
                <div style={{ fontSize: "9px", color: "#444", fontWeight: "800" }}>{script.game.toUpperCase()}</div>
              </div>
              
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => runScript(script)}
                  style={{
                    flex: 1, height: "32px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    background: "#111",
                    color: "#E0E0E0",
                    border: "1px solid #222",
                    fontSize: "9px", fontWeight: "900", cursor: "pointer", borderRadius: "4px"
                  }}>
                  <Play size={10} fill="#E0E0E0" /> EXECUTE
                </button>
                <button
                  onClick={() => copyToClipboard(script)}
                  style={{ width: "35px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#080808", color: "#444", border: "1px solid #111", borderRadius: "4px", cursor: "pointer" }}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}