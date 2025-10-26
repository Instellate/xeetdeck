import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sendMessage } from './messaging';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function debug(message: string): Promise<void> {
  return sendMessage('debug', message);
}

