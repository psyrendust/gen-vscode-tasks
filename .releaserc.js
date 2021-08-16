module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'prettier ./CHANGELOG.md --write',
      },
    ],
    '@semantic-release/npm',
    '@semantic-release/github',
    '@semantic-release/git',
  ],
  preset: 'conventionalcommits',
};
