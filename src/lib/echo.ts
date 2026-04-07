import api from "@/lib/axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

const sanctumUrl = import.meta.env.VITE_SANCTUM_URL as string;

// Define the expected shape of the authorization response
interface AuthData {
  auth: string;
  channel_data?: string;
}

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY as string,
  wsHost: import.meta.env.VITE_REVERB_HOST as string,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
  enabledTransports: ["ws", "wss"],

  authorizer: (channel: { name: string }) => ({
    authorize: (
      socketId: string,
      callback: (err: Error | null, data: AuthData | null) => void,
    ) => {
      api
        .post(`${sanctumUrl}/broadcasting/auth`, {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((res) => callback(null, res.data as AuthData))
        .catch((err) =>
          callback(err instanceof Error ? err : new Error(String(err)), null),
        );
    },
  }),
});

export default echo;
