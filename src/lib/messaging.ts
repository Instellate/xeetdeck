import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  isBoard(): boolean;
  addBoard(): void;
  removeBoard(): void;
  openBoard(): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
