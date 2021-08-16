const execa = require('execa');
const test = require('ava');
const path = require('path');

const cli = path.join(__dirname, '../src/cli.js');
const cwd = path.join(__dirname, 'fixtures/project');

const macro = async (t, args) => {
  const argsArray = args.length > 0 ? args.split(' ') : [];
  try {
    const { stdout } = await execa(cli, argsArray, { cwd });
    t.snapshot(stdout);
  } catch (error) {
    t.snapshot(error.stderr);
  }
};

const platform = 'win32';

test(`${platform} help`, macro, '');

test(`${platform} 1 workspace long`, macro, '--workspace workspace-a');
test(`${platform} 1 workspace short`, macro, '-w workspace-a');

test(`${platform} 2 workspaces long`, macro, '--workspace workspace-a --workspace workspace-b');
test(`${platform} 2 workspaces short`, macro, '-w workspace-a -w workspace-b');

test(`${platform} 1 workspace with 1 filter`, macro, '-w workspace-a -f pkg1');
test(`${platform} 1 workspace with 2 filters`, macro, '-w workspace-a -f pkg1 -f pkg3');

test(`${platform} 2 workspaces with 1 filter`, macro, '-w workspace-a -w workspace-b -f pkg1');
test(`${platform} 2 workspaces with 2 filters`, macro, '-w workspace-a -w workspace-b -f pkg1 -f pkg3');

test(`${platform} 1 workspace with npm flag`, macro, '-w workspace-a --npm');

test(`${platform} 2 workspaces with no-sort flag`, macro, '-w workspace-b -w workspace-a --no-sort');

test(`${platform} 1 workspace with override`, macro, '-w workspace-a --override override.json');
