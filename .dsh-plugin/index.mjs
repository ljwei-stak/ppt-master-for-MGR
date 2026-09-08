import { fileURLToPath } from 'node:url';
import * as filesystemSkills from '@deepseek-ai/dsh-skill-filesystem';

export const name = 'ppt-master-for-mgr';
export const inject = ['skills'];

export function apply(ctx) {
  return ctx.plugin(filesystemSkills, {
    providerName: '@ljwei-stak/ppt-master-for-mgr',
    includeDefaultRoots: false,
    bundledSkillDir: fileURLToPath(new URL('../skills/', import.meta.url)),
    watch: false,
  });
}
