changeRoot=cd .. &&
srcDir=babel/
buildDir=babel/build
cliConfig=--presets=@babel/env
config:
	$(changeRoot) node $(srcDir)$@.mjs
%:
	$(changeRoot) npx babel $(srcDir)$@.js $(cliConfig)