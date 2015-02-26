Package.describe({
  name: 'zydor:pushform',
  version: '0.0.0',
  summary: "Form/Wizard pushing and extracting data direct from collection",
  git: 'https://github.com/zydor/pushform.git',
  summary: "Form/Wizard pushing and extracting data direct from collection",
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('reactive-var', 'client');
  api.versionsFrom('1.0.3.2');
  api.use('templating', 'client');
  api.use('jquery', 'client');
  api.use('underscore', 'client');

  api.addFiles('zydor:form.html', 'client');
  api.addFiles('zydor:pushpull.js', 'client');
  api.addFiles('zydor:styles.css', 'client');
  api.addFiles('zydor:both.js');
  api.addFiles('zydor:dbchecker.js', 'server');
});
