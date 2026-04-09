import { EventEmitter } from "events";
import net from "net";

export const IpcTypes = {
  IPC_EXECUTE: 0,
  IPC_SETTING: 1
};

export const MessageTypes = {
  PRINT: 1,
  ERROR: 2
};

export class Client extends EventEmitter {
  _host = "127.0.0.1";
  _port = 5553;
  _socket: net.Socket | null = null;

  constructor() {
    super();
  }

  get socket() {
    return this._socket;
  }

  isAttached() {
    return this._socket ? this._socket.readyState === "open" : false;
  }

  attach(port: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._socket && !this._socket.destroyed && this._port === port) {
        return resolve();
      }

      this._port = port;
      const socket = net.createConnection(port, this._host);

      socket.once("connect", () => {
        this._socket = socket; 
        resolve();
      });

      socket.on("data", (data: Buffer) => {
        if (!data || data.length < 16) return;
        const type = data[0];
        const length = data.readUInt32LE(8);
        const message = data.subarray(16, 16 + length).toString("utf-8");
        if (type === MessageTypes.PRINT || type === MessageTypes.ERROR) {
          this.emit("message", message, type);
        }
      });

      socket.once("error", (err) => {
        if (this._socket === socket) {
          this._socket = null;
          this.emit("error", err);
        }
        reject(err);
      });

      socket.once("close", () => {
        if (this._socket === socket) {
          this._socket = null;
          this.emit("close");
        }
      });
    });
  }

  detach(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this._socket) return resolve();
      this._socket.once("close", () => {
        this._socket = null;
        resolve();
      });
      this._socket.destroy();
    });
  }

  _buildPacket(type: number, content: string) {
    const payload = Buffer.from(content, "utf-8");
    const packet = Buffer.alloc(16 + payload.length);
    
    packet.writeUInt8(type, 0);
    packet.writeUInt32LE(payload.length, 8);
    payload.copy(packet, 16);
    
    return packet;
  }

  executeScript(script: string) {
    if (!this._socket || this._socket.destroyed) {
      throw new Error("NotInjectedError: Please attach before executing.");
    }

    const packet = this._buildPacket(IpcTypes.IPC_EXECUTE, script);
    return this._socket.write(packet);
  }

  updateSetting(key: string, value: boolean) {
    if (!this._socket || this._socket.destroyed) {
      throw new Error("NotInjectedError: Please attach before executing.");
    }

    const payload = `${key} ${value ? "true" : "false"}`;
    const packet = this._buildPacket(IpcTypes.IPC_SETTING, payload);
    return this._socket.write(packet);
  }
}