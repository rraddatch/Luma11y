import { type as osType } from '@tauri-apps/plugin-os';

const os = osType();

export const IS_MAC = os === 'macos';
export const IS_WINDOWS = os === 'windows';
export const IS_LINUX = os === 'linux';
