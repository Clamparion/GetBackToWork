import {browser} from 'webextension-polyfill-ts';
import {BlockedSiteDto} from '../../Models/blocked-site.dto';
import {BlockedSitesSubscriber} from './blocked-sites-subscriber';
import {Dates} from './dates';
import {BlockedSitesMatcher} from './blocked-sites-matcher';
import {ContentScriptMessages, Messenger} from '../../Messenger';

export type IsBlockedMessagePayload = {
  message: {
    isBlocked: boolean;
    domain: string;
  };
};

export class BlockedSitesToday implements BlockedSitesSubscriber {
  private blockedSitesTimeBudgetMap = new Map<string, number>();
  private blockedSitesElapsedTimeMap = new Map<string, number>();
  private blockedSitesForToday = new Map<string, boolean>();

  constructor(private readonly matcher: BlockedSitesMatcher) {}

  blockedSitesUpdated(blockedSites: BlockedSiteDto[]): void {
    this.blockedSitesTimeBudgetMap = new Map<string, number>();
    for (const blockedSite of blockedSites) {
      this.blockedSitesTimeBudgetMap.set(
        blockedSite.domain,
        Dates.minutesToMilliseconds(blockedSite.timeLimitInMinutes)
      );
    }

    console.log('BlockedSitesStats sites updated', blockedSites);

    this.loadTodayElapsedTimeMap().then(() => {});
  }

  addElapsedTimeForDomain(domain: string, elapsedTimeInMs: number) {
    if (!this.blockedSitesTimeBudgetMap.has(domain)) return;

    const totalElapsedTime = this.blockedSitesElapsedTimeMap.get(domain);
    if (totalElapsedTime === undefined) return;

    this.blockedSitesElapsedTimeMap.set(
      domain,
      totalElapsedTime + elapsedTimeInMs
    );

    this.checkRemainingTimeForDomain(domain);
  }

  checkRemainingTimeForDomain(domain: string) {
    const elapsedTime = this.blockedSitesElapsedTimeMap.get(domain);
    const timeBudget = this.blockedSitesTimeBudgetMap.get(domain);
    if (elapsedTime === undefined || timeBudget === undefined) return;

    if (elapsedTime >= timeBudget) {
      const currentBlockState = this.blockedSitesForToday.get(domain);
      if (currentBlockState === undefined || currentBlockState === false) {
        this.blockedSitesForToday.set(domain, true);
        this.sendBlockSitesMessages().then(() => {});
      }
    } else {
      this.blockedSitesForToday.set(domain, false);
    }
  }

  isSiteBlocked(url: string): IsBlockedMessagePayload {
    const matchedBlockedSite = this.matcher.matchesUrl(url);

    if (matchedBlockedSite) {
      this.checkRemainingTimeForDomain(matchedBlockedSite.domain);

      const isBlocked = this.blockedSitesForToday.get(
        matchedBlockedSite.domain
      );

      if (isBlocked === true) {
        return {
          message: {
            isBlocked: true,
            domain: matchedBlockedSite.domain,
          },
        };
      }
    }

    return {
      message: {
        isBlocked: false,
        domain: '',
      },
    };
  }

  async sendBlockSitesMessages() {
    console.log('TODO block these sites', this.blockedSitesForToday);

    // query all tabs
    const tabs = await browser.tabs.query({});

    const messagePromises: Promise<any>[] = [];
    for (const tab of tabs) {
      const matchedBlockedSite = this.matcher.matchesTab(tab);
      if (matchedBlockedSite !== null && tab.id) {
        const isBlocked = this.blockedSitesForToday.get(
          matchedBlockedSite.domain
        );
        if (isBlocked === true) {
          const payload: IsBlockedMessagePayload = {
            message: {
              isBlocked: true,
              domain: matchedBlockedSite.domain,
            },
          };
          console.log('sending message to content', payload);
          messagePromises.push(
            Messenger.sendMessageToContentScript(
              tab.id,
              ContentScriptMessages.BLOCK_DOMAIN,
              payload
            )
          );
        }
      }
    }
    await Promise.all(messagePromises);
  }

  async saveAll() {
    await this.saveData(this.blockedSitesElapsedTimeMap);
  }

  private async loadTodayElapsedTimeMap() {
    const browserData = await browser.storage.sync.get(
      this.getTodayStorageKey()
    );
    const data = browserData[this.getTodayStorageKey()];
    let saveChanges = false;
    const map = new Map<string, number>();
    for (const domain of this.blockedSitesTimeBudgetMap.keys()) {
      if (data[domain] === undefined) {
        map.set(domain, 0);
        saveChanges = true;
      } else {
        map.set(domain, data[domain]);
      }
    }

    if (saveChanges) {
      await this.saveData(map);
    }
    this.blockedSitesElapsedTimeMap = map;

    for (const domain of this.blockedSitesElapsedTimeMap.keys()) {
      this.checkRemainingTimeForDomain(domain);
    }

    return map;
  }

  private async saveData(elapsedTimeMap: Map<string, number>) {
    const data: any = {};
    for (const [domain, elapsedTime] of elapsedTimeMap.entries()) {
      data[domain] = elapsedTime;
    }
    const storeData: any = {};
    storeData[this.getTodayStorageKey()] = data;
    await browser.storage.sync.set(storeData);
  }

  private getTodayStorageKey() {
    const todayStr = Dates.getTodayDate();
    return `blockedSite-${todayStr}`;
  }
}
