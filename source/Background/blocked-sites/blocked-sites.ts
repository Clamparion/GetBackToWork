import {browser} from 'webextension-polyfill-ts';
import {BlockedSiteDto} from '../../Models/blocked-site.dto';
import {v4 as uuidv4} from 'uuid';

export class BlockedSites {
  private currentBlockedSites?: BlockedSiteDto[];

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

  private async loadCurrentBlockedSitesFromStorage(): Promise<
    BlockedSiteDto[]
  > {
    const data = await browser.storage.sync.get('blockedSites');
    if (Array.isArray(data.blockedSites)) {
      this.currentBlockedSites = data.blockedSites as BlockedSiteDto[];
      return this.currentBlockedSites;
    }
    this.currentBlockedSites = [];
    return this.currentBlockedSites;
  }
}
