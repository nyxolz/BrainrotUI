import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { Client } from "../src/lib/macsploit-client";

let win: BrowserWindow | null = null;
const client = new Client();

client.on("message", (text, type) => {
  if (win) {
    win.webContents.send("macsploit:message", { 
      text, 
      type: type === 2 ? "error" : "print",
      time: new Date().toLocaleTimeString([], { hour12: false })
    });
  }
});

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    title: "brainrot ui",
    backgroundColor: "#050505",
    show: false,
    autoHideMenuBar: true, 
    frame: false, 
    titleBarStyle: 'hidden',
    
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
  });

  win.once('ready-to-show', () => win?.show());

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  }
});

ipcMain.handle("macsploit:attach", async (_, port) => {
  try {
    await client.attach(port);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("macsploit:execute", async (_, script: string) => {
  try {
    await client.executeScript(script);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
});
