import 'emoji-log';
import {browser} from 'webextension-polyfill-ts';
import {BackgroundScript} from './background-script';

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});

async function initSetup(): Promise<void> {
  const background = new BackgroundScript();

  await background.init();
}

initSetup().then(() => {
  console.emoji('🦄', 'setup successful');
});
