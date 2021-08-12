#!/usr/bin/env node
const findUp = require('find-up');
const fs = require('fs');
const meow = require('meow');
const path = require('path');
const main = require('./index.js');

const cli = meow(
  `
  Usage
    $ gen-vscode-tasks [options]
    $ gen-vscode-tasks --workspace <workspace> --save <path>
    $ gen-vscode-tasks --workspace <workspace> --filter <filter> --save <path>
    $ gen-vscode-tasks --workspace <workspace> --filter <filter> --override <override> --save <path>

  Options
    --workspace, -w   Generate tasks for each package within a workspace.
    --filter, -f      Generate tasks for workspace packages that only match the filter.
    --save, -s        Save the output to <path>
    --override        Path to a json you wish to use to override each task config.
                      The following fields are not configurable: [label, command, options.cwd]

  Flags
    --npm             Use 'npm run' vs 'yarn'.
    --no-sort         Do not sort tasks alphabetically.
    --verbose         Verbose output.
    --help            Show this help message.

  Args
    <path>            The folder to save tasks.json to, typically '.vscode/tasks.json'.
    <workspace>       Workspace path.
    <filter>          Name of the package to include when searching a workspace.
    <override>        Path to a json you wish to use to override each task config.

  Examples
    Given the following project:

      ./test/fixtures/project
      ├── .vscode
      │   └── tasks.json
      ├── workspace-a
      │   ├── empty
      │   │   └── .keep
      │   ├── pkg1
      │   │   └── package.json
      │   └── pkg2
      │       └── package.json
      └── workspace-b
          ├── pkg3
          │   └── package.json
          └── pkg4
              └── package.json

    $ cd ./test/fixtures/project

    # Will write to stdout with tasks for pkg1,pkg2
    $ gen-vscode-tasks --workspace ./workspace-a

    # Will save to ./.vscode/tasks.json with tasks for pkg1,pkg2
    $ gen-vscode-tasks --workspace ./workspace-a --save ./.vscode/tasks.json
    $ gen-vscode-tasks -w ./workspace-a -s ./.vscode/tasks.json

    # Will save to ./.vscode/tasks.json with tasks for pkg1,pkg2,pkg3,pkg4
    $ gen-vscode-tasks -w ./workspace-a -w ./workspace-b -s ./.vscode/tasks.json

    # Will save to ./.vscode/tasks.json with tasks for pkg1,pkg4
    $ gen-vscode-tasks -w ./workspace-a -w ./workspace-b -f pkg1 -f pkg4  -s ./.vscode/tasks.json

    $ gen-vscode-tasks --help
`,
  {
    flags: {
      workspace: {
        isMultiple: true,
        isRequired: true,
        type: 'string',
        alias: 'w',
      },
      filter: {
        isMultiple: true,
        isRequired: false,
        type: 'string',
        alias: 'f',
      },
      override: {
        default: path.join(__dirname, 'defaultOverrides.json'),
        isMultiple: false,
        isRequired: false,
        type: 'string',
      },
      save: {
        isMultiple: false,
        isRequired: false,
        type: 'string',
        alias: 's',
      },
      npm: {
        isMultiple: false,
        isRequired: false,
        type: 'boolean',
      },
      sort: {
        default: true,
        isMultiple: false,
        isRequired: false,
        type: 'boolean',
      },
      verbose: {
        isMultiple: false,
        isRequired: false,
        type: 'boolean',
      },
    },
  }
);

function checkPathError(...values) {
  const pathname = path.resolve(...values);
  try {
    fs.accessSync(pathname);
    return pathname;
  } catch {
    console.error(`Error: ENOENT: no such file or directory, '${pathname}'`);
    cli.showHelp();
    process.exit(1);
  }
}

const config = {
  cwd: process.cwd(),
  runCmd: cli.flags.npm ? 'npm run' : 'yarn',
  sort: cli.flags.sort,
  save: cli.flags.save,
  overrides: {},
  vscode: '',
  tasksFile: '',
  workspaceRoot: '',
  workspaces: cli.flags.workspace,
  filters: cli.flags.filter,
  verbose: cli.flags.verbose,
};

const { workspaces } = config;
const results = workspaces.map(workspace => {
  return findUp.sync('.vscode', {
    cwd: path.resolve(process.cwd(), workspace),
    type: 'directory',
  });
});

config.vscode = checkPathError(results[0]);
config.overrides = JSON.parse(fs.readFileSync(checkPathError(cli.flags.override)));
config.workspaceRoot = path.join(config.vscode, '..');
config.tasksFile = path.resolve(config.vscode, 'tasks.json');

main(config);
