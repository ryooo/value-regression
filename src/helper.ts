import { globSync } from 'glob';
import { exec, ExecOptions } from '@actions/exec';
import { log } from './logger';
import { basename, join } from 'path';
import { mkdirP } from '@actions/io';

export const copyFiles = async (from: string, to: string): Promise<void> => {
  await mkdirP(to);

  const fromPaths = globSync(from);
  for (const fromPath of fromPaths) {
    const fileName = basename(fromPath);
    const toPath = join(to, fileName);
    log.info(`Start copy file, ${fromPath} to ${toPath}`);
    await capture('cp', [fromPath, toPath]);
  }
};

export interface ExecResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

export const capture = async (cmd: string, args: string[], options: ExecOptions = {}): Promise<ExecResult> => {
  const res: ExecResult = {
    stdout: '',
    stderr: '',
    code: null,
  };

  try {
    const code = await exec(cmd, args, {
      ...options,
      listeners: {
        stdout(data: Buffer) {
          res.stdout += data.toString();
        },
        stderr(data: Buffer) {
          res.stderr += data.toString();
        },
      },
    });
    res.code = code;
    return res;
  } catch (err) {
    const msg = `Command '${cmd}' failed with args '${args.join(' ')}': ${res.stderr}: ${err}`;
    log.debug(`@actions/exec.exec() threw an error: ${msg}`);
    throw new Error(msg);
  }
};
