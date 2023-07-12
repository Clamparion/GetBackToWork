import {BackgroundMessages, MessageListener} from '../Messenger';
import {BlockedSites} from './blocked-sites/blocked-sites';
import {BackgroundMessageHandler} from './background-message-handler';
import {BlockedSiteDto} from '../Models/blocked-site.dto';

export class BackgroundScript {
  requests = new Map<BackgroundMessages, MessageListener>();

  blockedSites = new BlockedSites();

  messageHandler?: BackgroundMessageHandler;

  async init() {
    await this.blockedSites.initializeBlockedSites();

    this.messageHandler = new BackgroundMessageHandler(this);
    await this.messageHandler.init();

    this.registerMessageReceivers();
  }

  registerMessageReceivers() {
    this.messageHandler?.registerUpdateBlockSitesReceiver(
      this.updateBlockedSites
    );
    this.messageHandler?.registerGetBlockSitesReceiver(this.getBlockedSites);
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
}
