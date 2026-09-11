#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const skillDir = fileURLToPath(new URL('../skills/ppt-master/', import.meta.url));
const help = `Usage: ppt-master-for-mgr <path|doctor|setup> [--python <executable>] [--python-root <directory>]

path    Print the absolute installed skill directory.
doctor  Check Python 3.10+ and core PPTX dependencies; install nothing.
setup   Explicitly install the bundled Python requirements with pip.

Use --python or PPT_MASTER_PYTHON to select an exact interpreter. Use
--python-root or PPT_MASTER_PYTHON_ROOT to select the managed root containing
envs/ppt-master. Activate a virtual environment to select it implicitly.
`;

function managedPythonCandidates(root) {
  if (!root) return [];
  return process.platform === 'win32'
    ? [join(root, 'envs', 'ppt-master', 'Scripts', 'python.exe')]
    : [join(root, 'envs', 'ppt-master', 'bin', 'python3'), join(root, 'envs', 'ppt-master', 'bin', 'python')];
}

function activatedPythonCandidates(root) {
  if (!root) return [];
  return process.platform === 'win32'
    ? [join(root, 'Scripts', 'python.exe')]
    : [join(root, 'bin', 'python3'), join(root, 'bin', 'python')];
}

function main() {
  const { values, positionals } = parseArgs({
    options: {
      python: { type: 'string' },
      'python-root': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });
  if (values.help) {
    console.log(help);
    return 0;
  }
  const [command] = positionals;
  if (positionals.length !== 1 || !['path', 'doctor', 'setup'].includes(command)) {
    console.error(help);
    return 2;
  }
  if (command === 'path') {
    console.log(skillDir);
    return 0;
  }
  const explicit = values.python || process.env.PPT_MASTER_PYTHON;
  const managedRoot = values['python-root'] || process.env.PPT_MASTER_PYTHON_ROOT;
  const activeEnvironment = process.env.VIRTUAL_ENV;
  const candidates = explicit
    ? [explicit]
    : managedRoot
      ? managedPythonCandidates(managedRoot)
      : activeEnvironment
        ? activatedPythonCandidates(activeEnvironment)
        : process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
  const python = candidates.find((executable) => spawnSync(executable, [
    '-c', 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)',
  ], { encoding: 'utf8', timeout: 10000, windowsHide: true }).status === 0);
  if (!python) {
    console.error('Python 3.10+ was not found. Install Python, then use --python <executable> or --python-root <directory>.');
    return 1;
  }
  const args = command === 'setup'
    ? ['-m', 'pip', 'install', '-r', join(skillDir, 'requirements.txt')]
    : ['-c', [
      'import importlib, json, sys',
      'modules = ["pptx", "xlsxwriter", "PIL", "lxml", "yaml", "numpy", "pathops", "uharfbuzz"]',
      'missing = []',
      'for name in modules:',
      '    try: importlib.import_module(name)',
      '    except ImportError: missing.append(name)',
      'print(json.dumps({"python": sys.executable, "version": sys.version.split()[0], "missingCoreModules": missing}))',
      'raise SystemExit(1 if missing else 0)',
    ].join('\n')];
  console.error(`Skill directory: ${skillDir}`);
  const result = spawnSync(python, args, { stdio: 'inherit', windowsHide: true });
  if (result.error) console.error(result.error.message);
  if (command === 'doctor' && result.status !== 0) {
    console.error('Run ppt-master-for-mgr setup with the same --python to install dependencies.');
  }
  return result.status ?? 1;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
