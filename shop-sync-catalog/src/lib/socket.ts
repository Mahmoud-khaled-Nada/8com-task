// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_WEBSOCKET_SERVER_URL || "http://localhost:5000";

export const socket: Socket<any, any> = io(URL, {
  withCredentials: true,
    transports: ["websocket"],
});

// import { io } from "socket.io-client";
// import { user_token } from "./api/config";

// export const socket = io("http://localhost:5000", {
//   withCredentials: true,
//   transports: ["websocket"],
// });
