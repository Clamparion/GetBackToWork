import {BlockedSiteDto} from '../../Models/blocked-site.dto';
import {BlockedSitesSubscriber} from './blocked-sites-subscriber';

export class BlockedSitesMatcher implements BlockedSitesSubscriber {
  private blockedSites: BlockedSiteDto[] = [];

  private hostNameBlockCache = new Map<string, BlockedSiteDto>();

  blockedSitesUpdated(blockedSites: BlockedSiteDto[]): void {
    this.blockedSites = blockedSites;
    this.hostNameBlockCache = new Map<string, BlockedSiteDto>();
    for (const blockedSite of this.blockedSites) {
      this.hostNameBlockCache.set(blockedSite.domain, blockedSite);
    }
  }

  matchesTab(
    tab: {url?: string | undefined} | undefined
  ): BlockedSiteDto | null {
    if (tab === undefined || typeof tab.url !== 'string') return null;
    return this.matchesUrl(tab.url);
  }

  matchesUrl(rawUrl: string): BlockedSiteDto | null {
    try {
      const url = new URL(rawUrl);
      if (typeof url.hostname !== 'string') return null;
      const cachedSite = this.hostNameBlockCache.get(url.hostname);
      if (cachedSite !== undefined) return cachedSite;

      for (const blockedSite of this.blockedSites) {
        if (url.hostname.endsWith(blockedSite.domain)) {
          this.hostNameBlockCache.set(url.hostname, blockedSite);
          return blockedSite;
        }
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
