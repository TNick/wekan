Package.describe({
  name: 'wekan:wekan',
  version: '1.18.0',
  summary: 'The open-source Trello-like kanban',
  git: 'git+https://github.com/wekan/wekan.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.0.1');
  api.use('ecmascript');
  api.mainModule('server/main.js', 'server');
  api.mainModule('client/main.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('wekan:wekan');
  api.mainModule('imports/api/checks/standalone.app-test.js');
});
