import {browser} from 'webextension-polyfill-ts';
import {BlockedSiteDto} from '../../Models/blocked-site.dto';
import {v4 as uuidv4} from 'uuid';
import {BlockedSitesSubscriber} from './blocked-sites-subscriber';

export class BlockedSites {
  private currentBlockedSites?: BlockedSiteDto[];

  private subscribers: BlockedSitesSubscriber[] = [];

  async initializeBlockedSites() {
    const data = await browser.storage.sync.get('blockedSites');

    if (!Array.isArray(data.blockedSites)) {
      await this.setBlockedSites([
        {domain: 'youtube.com', timeLimitInMinutes: 5, id: uuidv4()},
        {domain: 'facebook.com', timeLimitInMinutes: 5, id: uuidv4()},
        {domain: 'twitter.com', timeLimitInMinutes: 5, id: uuidv4()},
        {domain: 'instagram.com', timeLimitInMinutes: 5, id: uuidv4()},
      ] as BlockedSiteDto[]);
    }
    await this.loadCurrentBlockedSitesFromStorage();
  }

  async setBlockedSites(
    blockedSites: BlockedSiteDto[]
  ): Promise<BlockedSiteDto[]> {
    await browser.storage.sync.set({
      blockedSites: blockedSites,
    });
    return this.loadCurrentBlockedSitesFromStorage();
  }

  async getBlockedSites(): Promise<BlockedSiteDto[]> {
    if (this.currentBlockedSites !== undefined) {
      return this.currentBlockedSites;
    }
    return this.loadCurrentBlockedSitesFromStorage();
  }

  addSubscribers(subscribers: BlockedSitesSubscriber[]) {
    this.subscribers.push(...subscribers);
    this.updateSubscribers().then(() => {});
  }

  addSubscriber(subscriber: BlockedSitesSubscriber) {
    this.subscribers.push(subscriber);
    this.updateSubscribers().then(() => {});
  }

  async updateSubscribers(): Promise<void> {
    const currentBlockedSites = await this.getBlockedSites();
    this.subscribers.forEach((s) => {
      s.blockedSitesUpdated(currentBlockedSites);
    });
  }

  private async loadCurrentBlockedSitesFromStorage(): Promise<
    BlockedSiteDto[]
  > {
    let newBlockedSites: BlockedSiteDto[] = [];
    const data = await browser.storage.sync.get('blockedSites');
    if (Array.isArray(data.blockedSites)) {
      newBlockedSites = data.blockedSites as BlockedSiteDto[];
    }

    this.currentBlockedSites = newBlockedSites;
    await this.updateSubscribers();
    return this.currentBlockedSites;
  }
}
