import {browser} from 'webextension-polyfill-ts';
import {BlockedSiteDto} from '../../Models/blocked-site.dto';
import {BlockedSitesSubscriber} from './blocked-sites-subscriber';
import {BlockedSitesToday} from './blocked-sites-today';
import {BlockedSitesMatcher} from './blocked-sites-matcher';

export class BlockedSitesTimer implements BlockedSitesSubscriber {
  private readonly timeIntervalMs = 5000;

  private timer?: any;

  private isInitialized = false;

  private blockedSites?: BlockedSiteDto[];

  private previousActiveBlockedSites = new Map<string, BlockedSiteDto>();

  constructor(
    private readonly blockedSitesToday: BlockedSitesToday,
    private readonly matcher: BlockedSitesMatcher
  ) {}

  async init() {
    if (this.isInitialized) return;

    browser.tabs.onActivated.addListener(() => {
      this.checkStartTimer();
    });

    browser.windows.onRemoved.addListener(() => {
      this.checkStartTimer();
    });

    this.isInitialized = true;
  }

  checkStartTimer() {
    this.getActiveBlockedSites().then((activeBlockedSites) => {
      if (activeBlockedSites.size === 0) {
        this.stopTimer();
      } else {
        this.previousActiveBlockedSites = activeBlockedSites;
        this.startTimer();
      }
    });
  }

  async measureTimeForActiveBlockedSites() {
    const currentActiveBlockedSites = await this.getActiveBlockedSites();

    for (const domain of currentActiveBlockedSites.keys()) {
      if (this.previousActiveBlockedSites.get(domain)) {
        await this.blockedSitesToday.addElapsedTimeForDomain(
          domain,
          this.timeIntervalMs
        );
      }
    }

    this.previousActiveBlockedSites = currentActiveBlockedSites;

    await this.blockedSitesToday.saveAll();
  }

  blockedSitesUpdated(blockedSites: BlockedSiteDto[]): void {
    this.blockedSites = blockedSites;
    this.checkStartTimer();
  }

  private async getActiveBlockedSites(): Promise<Map<string, BlockedSiteDto>> {
    const activeBlockedSites = new Map<string, BlockedSiteDto>();

    if (this.blockedSites === undefined || this.blockedSites.length === 0)
      return activeBlockedSites;

    const tabs = await browser.tabs.query({active: true});

    for (const tab of tabs) {
      const matchedBlockedSite = this.matcher.matchesTab(tab);

      if (matchedBlockedSite !== null) {
        activeBlockedSites.set(matchedBlockedSite.domain, matchedBlockedSite);
      }
    }

    return activeBlockedSites;
  }

  private startTimer() {
    if (this.timer !== undefined) return;
    this.timer = setInterval(() => {
      this.measureTimeForActiveBlockedSites();
    }, this.timeIntervalMs);
  }

  private stopTimer() {
    if (this.timer === undefined) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
