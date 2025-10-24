import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  isBoard(): boolean;
  addBoard(): void;
  openBoard(): void;
  removeBoard(): void;
  debug(msg: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
