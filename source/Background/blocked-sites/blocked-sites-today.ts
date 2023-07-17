import {browser} from 'webextension-polyfill-ts';
import {BlockedSiteDto} from '../../Models/blocked-site.dto';
import {BlockedSitesSubscriber} from './blocked-sites-subscriber';
import {Dates} from './dates';
import {BlockedSitesMatcher} from './blocked-sites-matcher';
import {ContentScriptMessages, Messenger} from '../../Messenger';
import {Logger} from '../../Logger/logger';

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

  private previousStorageKey?: string;

  constructor(private readonly matcher: BlockedSitesMatcher) {}

  blockedSitesUpdated(blockedSites: BlockedSiteDto[]): void {
    this.blockedSitesTimeBudgetMap = new Map<string, number>();
    for (const blockedSite of blockedSites) {
      this.blockedSitesTimeBudgetMap.set(
        blockedSite.domain,
        Dates.minutesToMilliseconds(blockedSite.timeLimitInMinutes)
      );
    }

    this.loadTodayElapsedTimeMap().then(() => {});
  }

  async addElapsedTimeForDomain(domain: string, elapsedTimeInMs: number) {
    await this.checkIsDataNeedRefresh();

    if (!this.blockedSitesTimeBudgetMap.has(domain)) return;

    const totalElapsedTime = this.blockedSitesElapsedTimeMap.get(domain);
    if (totalElapsedTime === undefined) return;

    Logger.info(`${totalElapsedTime} ms elapsed for ${domain}`);

    this.blockedSitesElapsedTimeMap.set(
      domain,
      totalElapsedTime + elapsedTimeInMs
    );

    await this.checkRemainingTimeForDomain(domain);
  }

  async checkRemainingTimeForDomain(domain: string) {
    const elapsedTime = this.blockedSitesElapsedTimeMap.get(domain);
    const timeBudget = this.blockedSitesTimeBudgetMap.get(domain);
    if (elapsedTime === undefined || timeBudget === undefined) return;

    if (elapsedTime >= timeBudget) {
      const currentBlockState = this.blockedSitesForToday.get(domain);
      if (currentBlockState === undefined || currentBlockState === false) {
        this.blockedSitesForToday.set(domain, true);
        await this.sendBlockSitesMessages();
      }
    } else {
      this.blockedSitesForToday.set(domain, false);
    }
  }

  async checkIsDataNeedRefresh() {
    const currentStorageKey = this.getTodayStorageKey();
    if (this.previousStorageKey !== currentStorageKey) {
      Logger.info(
        `day changed to from ${this.previousStorageKey} to ${currentStorageKey}`
      );
      await this.loadTodayElapsedTimeMap();
      this.previousStorageKey = currentStorageKey;
    }
  } 

  async isSiteBlocked(url: string): Promise<IsBlockedMessagePayload> {

    const matchedBlockedSite = this.matcher.matchesUrl(url);

    if (matchedBlockedSite) {

      await this.checkIsDataNeedRefresh();
      await this.checkRemainingTimeForDomain(matchedBlockedSite.domain);

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
      await this.checkRemainingTimeForDomain(domain);
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
