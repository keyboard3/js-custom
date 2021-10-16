nextDir=../../../next.js/packages/next
sourceDirs=bin build cli client compiled export lib next-server pages server telemetry types
projNodeModuleDir=$(PWD)/using-preact/node_modules/next
main:
	cd ${nextDir} && ln -sf ${sourceDirs} ${projNodeModuleDir}
clean:
	cd ${projNodeModuleDir} && rm -rf ${sourceDirs}