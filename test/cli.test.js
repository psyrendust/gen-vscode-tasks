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

test('help', macro, '');

test('1 workspace long', macro, '--workspace workspace-a');
test('1 workspace short', macro, '-w workspace-a');

test('2 workspaces long', macro, '--workspace workspace-a --workspace workspace-b');
test('2 workspaces short', macro, '-w workspace-a -w workspace-b');

test('1 workspace with 1 filter', macro, '-w workspace-a -f pkg1');
test('1 workspace with 2 filters', macro, '-w workspace-a -f pkg1 -f pkg3');

test('2 workspaces with 1 filter', macro, '-w workspace-a -w workspace-b -f pkg1');
test('2 workspaces with 2 filters', macro, '-w workspace-a -w workspace-b -f pkg1 -f pkg3');

test('1 workspace with npm flag', macro, '-w workspace-a --npm');

test('2 workspaces with no-sort flag', macro, '-w workspace-b -w workspace-a --no-sort');

test('1 workspace with override', macro, '-w workspace-a --override override.json');
