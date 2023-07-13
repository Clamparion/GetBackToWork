import {Runtime, browser} from 'webextension-polyfill-ts';
import {BackgroundMessages, IMessage, MessageListener} from '../Messenger';
import {BackgroundScript} from './background-script';
import {BlockedSiteDto} from '../Models/blocked-site.dto';
import {IsBlockedMessagePayload} from './blocked-sites/blocked-sites-today';

export class BackgroundMessageHandler {
  requests = new Map<BackgroundMessages, MessageListener>();

  private isInitialized = false;

  constructor(private readonly backgroundScript: BackgroundScript) {}

  async init() {
    if (this.isInitialized) return;

    this.listenForMessages();

    this.isInitialized = true;
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

  registerStartSiteTimerReceiver(
    receiver: (self: BackgroundScript) => Promise<any>
  ) {
    this.requests.set(
      BackgroundMessages.CHECK_START_SITE_TIMER,
      async (
        _sender: Runtime.MessageSender,
        _data: IMessage<any>,
        script: BackgroundScript
      ) => {
        return await receiver(script);
      }
    );
  }

  registerCheckIsSiteBlockedReceiver(
    receiver: (
      self: BackgroundScript,
      url: string
    ) => Promise<IsBlockedMessagePayload>
  ) {
    this.requests.set(
      BackgroundMessages.CHECK_IS_SITE_BLOCKED,
      async (
        _sender: Runtime.MessageSender,
        data: IMessage<{message: {url: string}}>,
        script: BackgroundScript
      ) => {
        try {
          return receiver(script, data.data.message.url);
        } catch (error) {
          console.log(error);
          throw error;
        }
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

  /* sendHelloToActiveTab() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      tabs.forEach((tab) => {
        this.sayHelloToContentScript(tab.id);
      });
    });
  } */
}
