changeRoot=cd .. &&
srcDir=babel/src/
buildDir=babel/build
cliConfig=--presets=@babel/env
config:
	$(changeRoot) node $(srcDir)$@.mjs
arrowFun:
	$(changeRoot) npx babel $(srcDir)$@.js $(cliConfig)