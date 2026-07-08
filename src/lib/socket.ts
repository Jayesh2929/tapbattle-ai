"use client";

import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Returns a singleton Socket.io client connected to the custom Node server
 * (see server/index.ts). The server multiplexes game namespaces by session
 * code, so a single connection is reused across host/join/game screens.
 */
export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}
