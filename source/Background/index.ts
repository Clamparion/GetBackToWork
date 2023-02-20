import 'emoji-log';
import {browser} from 'webextension-polyfill-ts';
import {v4 as uuidv4} from 'uuid';
import {BlockedSite} from '../Models/blocked-site';

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});

async function initSetup(): Promise<void> {
  const data = await browser.storage.sync.get('blockedSites');

  if (!Array.isArray(data.blockedSites)) {
    await browser.storage.sync.set({
      blockedSites: [
        {domain: 'youtube.com', timeLimitInMinutes: 5, id: uuidv4()},
        {domain: 'facebook.com', timeLimitInMinutes: 5, id: uuidv4()},
        {domain: 'twitter.com', timeLimitInMinutes: 5, id: uuidv4()},
        {domain: 'instagram.com', timeLimitInMinutes: 5, id: uuidv4()},
      ] as BlockedSite[],
    });
  }
}

initSetup().then(() => {
  console.emoji('🦄', 'setup successful');
});
