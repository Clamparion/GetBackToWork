import {Runtime, browser} from 'webextension-polyfill-ts';
import {BackgroundMessages, IMessage, MessageListener} from '../Messenger';
import {BackgroundScript} from './background-script';
import {BlockedSiteDto} from '../Models/blocked-site.dto';

export class BackgroundMessageHandler {
  requests = new Map<BackgroundMessages, MessageListener>();

  constructor(private readonly backgroundScript: BackgroundScript) {}

  async init() {
    this.listenForMessages();
  }

  registerUpdateBlockSitesReceiver(
    receiver: (
      blockedSites: BlockedSiteDto[],
      self: BackgroundScript
    ) => Promise<BlockedSiteDto[]>
  ) {
    this.requests.set(
      BackgroundMessages.UPDATE_BLOCKED_SITES,
      async (
        _sender: Runtime.MessageSender,
        data: IMessage<{message: BlockedSiteDto[]}>,
        script: BackgroundScript
      ) => {
        return await receiver(data.data.message, script);
      }
    );
  }

  registerGetBlockSitesReceiver(
    receiver: (self: BackgroundScript) => Promise<BlockedSiteDto[]>
  ) {
    this.requests.set(
      BackgroundMessages.GET_BLOCKED_SITES,
      async (
        _sender: Runtime.MessageSender,
        _data: IMessage<any>,
        script: BackgroundScript
      ) => {
        return await receiver(script);
      }
    );
  }

  listenForMessages() {
    const script = this.backgroundScript;
    browser.runtime.onMessage.addListener((message, sender) => {
      const {type, data} = message;
      const requestSender = this.requests.get(type);
      if (requestSender !== undefined && requestSender !== null) {
        return requestSender(sender, {type, data}, script);
      }
    });
  }
}
