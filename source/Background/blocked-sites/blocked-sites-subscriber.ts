import {BlockedSiteDto} from '../../Models/blocked-site.dto';

export interface BlockedSitesSubscriber {
  blockedSitesUpdated(blockedSites: BlockedSiteDto[]): void;
}
