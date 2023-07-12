import {browser} from 'webextension-polyfill-ts';

export class Logger {
  static log(message: string) {
    /*const bg = browser.extension.getBackgroundPage() as any;
    if (bg.console) {
      bg.console.log(message);
    }*/
    /*browser.tabs.executeScript({
    
      code: `console.log("${message}")`,
    });*/
    console.log(message);
    this.sendMessageToBackground(message).then();
  }

  private static async sendMessageToBackground(data: string | null = null) {
    try {
      const response = await browser.runtime.sendMessage({data});
      return response;
    } catch (error) {
      console.error('sendMessageToBackground error: ', error);
      return null;
    }
  }
}
