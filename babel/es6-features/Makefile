changeRoot=cd .. &&
srcDir=es6-features/
buildDir=es6-features/build
cliConfig=--presets=@babel/env
config:
	$(changeRoot) node $(srcDir)$@.mjs
%:
	$(changeRoot) BABEL_SHOW_CONFIG_FOR=$(srcDir)$@.js npx babel --source-root babel  $(srcDir)$@.js