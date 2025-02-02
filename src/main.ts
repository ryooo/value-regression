import { setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { createClient } from './client';
import { getConfig } from './config';
import { getEvent } from './event';
import { log } from './logger';
import { run as serviceRun } from './service';

export const run = async (): Promise<void> => {
  const config = getConfig();

  const { repo, runId } = context;
  log.info(`runid = ${runId}`);

  const date = new Date().toISOString().split('T')[0];
  const event = getEvent();
  log.info(`succeeded to get event, number = ${event.number}, before = ${event.before}, after = ${event.after}`);
  log.info(`pull_request.head.sha = ${event.pull_request?.head?.sha}`);
  const sha = event.after || context.sha;

  const octokit = getOctokit(config.githubToken);
  const client = createClient(repo, octokit);

  log.info(`start`);
  await serviceRun({ event, runId, sha, client, date, config });
  setOutput('result', 'ok');
};
