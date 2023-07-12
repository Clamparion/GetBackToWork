import {browser} from 'webextension-polyfill-ts';
import {
  ContentScriptMessages,
  MessageListener,
  Messenger,
  BackgroundMessages,
} from '../Messenger';

export class ContentScript {
  requests = new Map<ContentScriptMessages, MessageListener>();

  async receiveHello(sender: any, data: any) {
    console.log(`receiveHelloFromBackground: `, sender, data);
    document
      ?.getElementById('__sample_ext_div')
      ?.appendChild(document.createTextNode(data.message));
  }

  async receiveBye(sender: any, data: any) {
    console.log(`receiveByeFromBackground: `, sender, data);
    document
      ?.getElementById('__sample_ext_div')
      ?.appendChild(document.createTextNode(data.message));
  }

  async sayHelloToBackground() {
    await Messenger.sendMessageToBackground(
      BackgroundMessages.SAY_HELLO_TO_BG,
      {message: 'Hello Background!!!'}
    );
  }

  async sayByeToBackground() {
    await Messenger.sendMessageToBackground(BackgroundMessages.SAY_BYE_TO_BG, {
      message: 'Bye Background!!!',
    });
  }

  registerMessengerRequests() {
    this.requests.set(ContentScriptMessages.SAY_HELLO_TO_CS, this.receiveHello);

    this.requests.set(ContentScriptMessages.SAY_BYE_TO_CS, this.receiveBye);
  }

  listenForMessages() {
    const script = this;
    browser.runtime.onMessage.addListener((message, sender) => {
      const {type, data} = message;
      const requestSender = this.requests.get(type);
      if (requestSender !== undefined && requestSender !== null) {
        return requestSender(sender, data, script);
      }
    });
  }

  attachUI() {
    const ui = document.createElement('div');
    ui.id = '__sample_ext_div';
    ui.style.position = 'absolute';
    ui.style.height = '100px';
    ui.style.width = '200px';
    ui.textContent =
      'From Content Script in Sample Extension. Click button and check console.';
    ui.style.background = 'lightgray';
    ui.style.border = '2px solid darkgray';

    const btn = document.createElement('button');
    btn.textContent = 'Send to Background';
    btn.id = '__sample_ext_btn';
    btn.addEventListener('click', async () => {
      try {
        const response = await Messenger.sendMessageToBackground(
          BackgroundMessages.SAY_HELLO_TO_BG,
          {
            from: 'Content Script',
            message: 'Hello from Content Script',
          }
        );
        console.log('response:', response);
        alert(response.message);
      } catch (error) {
        console.error('error: ', error);
      }
    });

    ui.appendChild(btn);
    document.body.appendChild(ui);
  }

  init() {
    this.attachUI();
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();
  }
}
