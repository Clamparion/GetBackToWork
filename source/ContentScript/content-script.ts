import {browser} from 'webextension-polyfill-ts';
import {
  BackgroundMessages,
  ContentScriptMessages,
  MessageListener,
  Messenger,
} from '../Messenger';
import {BlockSite} from './block-site';

export class ContentScript {
  requests = new Map<ContentScriptMessages, MessageListener>();

  async receiveContentBlocked(sender: any, data: any) {
    console.log(`receiveContentBlocked: `, sender, data);
    ContentScript.processBlockedMessage(data);
  }

  registerMessengerRequests() {
    this.requests.set(
      ContentScriptMessages.BLOCK_DOMAIN,
      this.receiveContentBlocked
    );
  }

  listenForMessages() {
    const script = this;
    browser.runtime.onMessage.addListener((message, sender) => {
      const {type, data} = message;
      const requestSender = this.requests.get(type);
      if (requestSender !== undefined && requestSender !== null) {
        return requestSender(sender, {type, data}, script);
      }
    });
  }

  private static blockCurrentSite(domain: string) {
    const site = new BlockSite();
    site.block(domain);
  }

  private static processBlockedMessage(response: any) {
    let data = response;
    if (data.data !== undefined) {
      data = data.data;
    }
    if (data.data !== undefined) {
      data = data.data;
    }

    if (
      data.message &&
      data.message.isBlocked === true &&
      typeof data.message.domain === 'string'
    ) {
      ContentScript.blockCurrentSite(data.message.domain);
    }
  }

  init() {
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();

    Messenger.sendMessageToBackground(
      BackgroundMessages.CHECK_START_SITE_TIMER,
      {}
    ).then((response: any) => {
      console.log('CHECK_START_SITE_TIMER response', response);
    });

    let currentUrl = window.location.hostname;
    if (!currentUrl.startsWith('http')) {
      currentUrl = `http://${currentUrl}`.replace('www.', '');
    }

    Messenger.sendMessageToBackground(
      BackgroundMessages.CHECK_IS_SITE_BLOCKED,
      {
        message: {
          url: currentUrl,
        },
      }
    ).then((response: any) => {
        console.log('CHECK_IS_SITE_BLOCKED response', response);
      ContentScript.processBlockedMessage(response);
    });
  }
}
