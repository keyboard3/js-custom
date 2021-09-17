changeRoot=cd .. &&
srcDir=plugins/
buildDir=plugins/build
cliConfig=--presets=@babel/env
config:
	$(changeRoot) node $(srcDir)$@.mjs
%:
	$(changeRoot) BABEL_SHOW_CONFIG_FOR=$(srcDir)$@.js npx babel --source-root babel  $(srcDir)$@.js