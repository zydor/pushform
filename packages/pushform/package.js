
Package.describe({
  summary: "Form/Wizard pushing and extracting data direct from collection",
  documentation: 'https://github.com/zydor/pushform/blob/master/README.md',
  git: 'https://github.com/zydor/pushform.git'
});

Package.on_use(function (api) {

  api.use(['reactive-var','jquery','underscore','templating'], 'client');
  api.add_files(['both.js'], ['client', 'server']);
  api.add_files(['dbChecker.js'], 'server');
  api.add_files(['form.html','pushPull.js','styles.css'], 'client');

});
