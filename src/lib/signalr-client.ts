import * as signalR from "@microsoft/signalr";
import { TOKEN_KEY } from "@/utils/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5013/api";
// Hub URL is at the server root, not under /api
const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/sesion";

let connection: signalR.HubConnection | null = null;

export function getSesionConnection(): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => {
        if (typeof window !== "undefined") {
          return localStorage.getItem(TOKEN_KEY) || "";
        }
        return "";
      },
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export async function startConnection(): Promise<void> {
  const conn = getSesionConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
}

export async function stopConnection(): Promise<void> {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    await connection.stop();
  }
  connection = null;
}

export async function joinSesion(sesionId: string): Promise<void> {
  const conn = getSesionConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("JoinSesion", sesionId);
  }
}

export async function leaveSesion(sesionId: string): Promise<void> {
  const conn = getSesionConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("LeaveSesion", sesionId);
  }
}
