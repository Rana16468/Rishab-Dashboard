"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { SocketProvider } from "@/contexts/SocketContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
}
