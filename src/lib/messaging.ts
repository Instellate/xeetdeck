import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  isBoard(): boolean;
  addBoard(): void;
  openBoard(): void;
  removeBoard(): void;

  // Used for constructing Twitter API Client
  getTwitterCookies(): Record<string, string>;

  debug(msg: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
