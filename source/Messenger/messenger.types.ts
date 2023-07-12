import {Runtime} from 'webextension-polyfill-ts';
import {BackgroundMessages} from './background-messages';
import {ContentScriptMessages} from './content-messages';

export type IMessage<T> = {
  type: ContentScriptMessages | BackgroundMessages;
  data: T;
};

export type MessageListener = (
  sender: Runtime.MessageSender,
  data: IMessage<any>,
  script: any
) => any;
