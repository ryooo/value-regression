import { readFileSync } from 'fs';

import { log } from './logger';
import { components } from '@octokit/openapi-types';

export type Event = {
  before: string | null;
  after: string | null;
  pull_request: components['schemas']['pull-request'] | null;
  app: components['schemas']['nullable-integration'];
  repository: components['schemas']['minimal-repository'];
  number?: number;
};

const readEvent = (): Event | undefined => {
  try {
    if (process.env.GITHUB_EVENT_PATH) {
      return JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    }
  } catch (e) {
    // noop
  }
};

export const getEvent = (): Event => {
  const event = readEvent();
  log.debug(`event = `, event);
  if (!event) {
    throw new Error('Failed to get github event.json.');
  }

  return event;
};
