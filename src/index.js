const chalk = require('chalk');
const fs = require('fs');
const { EOL } = require('os');
const path = require('path');

let isVerbose = false;

const logWS = fs.createWriteStream(path.join(process.cwd(), 'get-vscode-tasks.log'));
function logAll(...messages) {
  logWS.write(
    messages
      .map(message => {
        if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
          return JSON.stringify(message, null, 2);
        }

        return message;
      })
      .join(' ') + EOL
  );
}

function verbose(...message) {
  logAll('[verbose]', ...message);
  console.log(chalk.black.bgBlue(' gen-vscode-tasks '), ...message);
}

function info(...message) {
  logAll('[info]', ...message);
  if (isVerbose === true) {
    console.log(chalk.black.bgBlue(' gen-vscode-tasks '), ...message);
  }
}

function warn(...message) {
  logAll('[warn]', ...message);
  if (isVerbose === true) {
    console.log(chalk.black.bgYellow(' gen-vscode-tasks '), ...message);
  }
}

function plain(...message) {
  logAll(...message);
  console.log(...message);
}

function success() {
  logAll('[success]');
  console.log(EOL + chalk.black.bgGreen(' gen-vscode-tasks '), 'success');
  plain(`

  Usage:
    1. In VSCode open Command Palette (⇧⌘P) => Tasks: Run Task
    2. Select the task you wish to run

  See https://code.visualstudio.com/docs/editor/tasks#_custom-tasks
`);
}

function createTask(config, workspacePath, name) {
  const workspaceFolder = '${workspaceFolder}'; // eslint-disable-line no-template-curly-in-string
  const { type, isBackground, options, args, group, presentation, problemMatcher, runOptions } = config.overrides;

  // Long way of ensuring that we get the correct projectRoot relative to the workspace root.
  const projectPath = path.resolve(workspacePath, name);
  const projectPathRelative = path.relative(config.workspaceRoot, projectPath);
  const projectRoot = path
    .normalize(projectPathRelative)
    .replace(`${config.workspaceRoot}/`, '')
    .replace(`/${name}`, '');
  const projectPkgPath = path.join(projectPath, 'package.json');
  info({
    projectPath,
    projectPathRelative,
    workspaceRoot: config.workspaceRoot,
    projectRoot,
    projectPkgPath,
  });

  try {
    fs.accessSync(projectPkgPath);
  } catch {
    warn(`Skipping, no such file or directory, '${projectPkgPath}'`);
    return '';
  }

  const pkg = JSON.parse(fs.readFileSync(projectPkgPath));
  if (pkg.scripts === undefined) {
    return '';
  }

  return Object.keys(pkg.scripts).map(command => {
    return {
      label: `[${name}] ${command}`,
      type,
      command: `${config.runCmd} ${command}`,
      isBackground,
      options: {
        ...(options || {}),
        cwd: `${workspaceFolder}/${projectRoot}/${name}`,
      },
      args,
      group,
      presentation,
      problemMatcher,
      runOptions,
    };
  });
}

function writeTasksJSON(config, tasks) {
  const template = JSON.stringify(
    {
      version: '2.0.0',
      tasks,
    },
    null,
    2
  );
  const output = `// See https://go.microsoft.com/fwlink/?LinkId=733558
// for the documentation about the tasks.json format
// Auto-generated with gen-vscode-tasks
${template}`;

  if (config.save) {
    info(`creating '${config.tasksFile}'`);
    fs.writeFileSync(config.tasksFile, output);
    success();
  } else {
    console.log(EOL + output);
  }
}

function main(config) {
  isVerbose = config.verbose;
  info('config', config);
  const { filters, sort, workspaces } = config;
  let tasks = [];
  for (const workspace of workspaces) {
    const workspacePath = path.resolve(process.cwd(), workspace);
    try {
      fs.accessSync(workspacePath);
    } catch {
      verbose(`Error: ENOENT: no such file or directory, '${workspacePath}'`);
      continue;
    }

    info(`processing '${workspacePath}'`);
    const names = fs
      .readdirSync(workspacePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => {
        if (filters.length > 0) {
          return filters.includes(name);
        }

        return true;
      });

    tasks.push(
      ...names
        .map(name => createTask(config, workspacePath, name))
        .filter(tasks => Array.isArray(tasks))
        .flat()
    );
  }

  if (sort) {
    tasks = tasks.sort((a, b) => {
      const labelA = a.label.toUpperCase();
      const labelB = b.label.toUpperCase();
      if (labelA < labelB) {
        return -1;
      }

      if (labelA > labelB) {
        return 1;
      }

      return 0;
    });
  }

  writeTasksJSON(config, tasks);
}

module.exports = main;
