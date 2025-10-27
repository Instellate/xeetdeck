import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sendMessage } from './messaging';
import { storage } from '#imports';
import type { TabPage, TabSettings } from '@/entrypoints/board/app/Tab.svelte';
import type { HTMLAttributes } from 'svelte/elements';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function debug(message: string): Promise<void> {
  return sendMessage('debug', message);
}

export type TabEventData =
  | {
      type: 'requestSettings';
    }
  | {
      type: 'settingsUpdated';
      settings: TabSettings;
    }
  | {
      type: 'gotoHome';
      home: HomeType;
    }
  | {
      type: 'goto';
      url: string;
    };

export type HomeType = 'forYou' | 'following';

export type SVGProps = HTMLAttributes<SVGSVGElement>;

export const savedTabs = storage.defineItem<TabPage[]>('local:tabs', {
  fallback: [],
});

export function sendTabMessage(win: Window | null | undefined, data: TabEventData) {
  win?.postMessage(data, '*');
}
