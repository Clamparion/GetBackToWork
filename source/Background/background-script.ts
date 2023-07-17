import {BackgroundMessages, MessageListener} from '../Messenger';
import {BlockedSites} from './blocked-sites/blocked-sites';
import {BackgroundMessageHandler} from './background-message-handler';
import {BlockedSiteDto} from '../Models/blocked-site.dto';
import {BlockedSitesTimer} from './blocked-sites/blocked-sites-timer';
import {
  BlockedSitesToday,
  IsBlockedMessagePayload,
} from './blocked-sites/blocked-sites-today';
import {BlockedSitesMatcher} from './blocked-sites/blocked-sites-matcher';

export class BackgroundScript {
  requests = new Map<BackgroundMessages, MessageListener>();

  blockedSites: BlockedSites;

  blockedSitesToday: BlockedSitesToday;

  blockedSitesTimer: BlockedSitesTimer;

  blockedSitesMatcher: BlockedSitesMatcher;

  messageHandler?: BackgroundMessageHandler;

  private isInitialized = false;

  constructor() {
    this.blockedSites = new BlockedSites();
    this.blockedSitesMatcher = new BlockedSitesMatcher();
    this.blockedSitesToday = new BlockedSitesToday(this.blockedSitesMatcher);
    this.blockedSitesTimer = new BlockedSitesTimer(
      this.blockedSitesToday,
      this.blockedSitesMatcher
    );

    this.blockedSites.addSubscribers([
      this.blockedSitesTimer,
      this.blockedSitesToday,
      this.blockedSitesMatcher,
    ]);
  }

  async init() {
    if (this.isInitialized) return;

    await this.blockedSites.initializeBlockedSites();

    await this.blockedSitesTimer.init();

    this.messageHandler = new BackgroundMessageHandler(this);
    await this.messageHandler.init();

    this.registerMessageReceivers();

    this.isInitialized = true;
  }

  private async checkStartBlockedSiteTimer(
    self: BackgroundScript
  ): Promise<any> {
    self.blockedSitesTimer.checkStartTimer();
    return {};
  }

  private async updateBlockedSites(
    blockedSites: BlockedSiteDto[],
    self: BackgroundScript
  ): Promise<BlockedSiteDto[]> {
    //need to use self to get reference
    return self.blockedSites.setBlockedSites(blockedSites);
  }

  private async getBlockedSites(
    self: BackgroundScript
  ): Promise<BlockedSiteDto[]> {
    return self.blockedSites.getBlockedSites();
  }

  private isSiteBlocked(
    self: BackgroundScript,
    url: string
  ): Promise<IsBlockedMessagePayload> {
    return self.blockedSitesToday.isSiteBlocked(url);
  }

  private registerMessageReceivers() {
    this.messageHandler?.registerUpdateBlockSitesReceiver(
      this.updateBlockedSites
    );
    this.messageHandler?.registerGetBlockSitesReceiver(this.getBlockedSites);

    this.messageHandler?.registerStartSiteTimerReceiver(
      this.checkStartBlockedSiteTimer
    );

    this.messageHandler?.registerCheckIsSiteBlockedReceiver(this.isSiteBlocked);
  }
}
