nextDir=../../../next.js/packages/next
sourceDirs := $(shell cd ${nextDir} && find * -type d -depth 0 ! -name "node_modules" -print0 | xargs -0 echo)
projNodeModuleDir=$(PWD)/using-preact/node_modules/next
main:
	make clean
	cd ${nextDir} && ln -sf ${sourceDirs} ${projNodeModuleDir}
clean:
	cd ${projNodeModuleDir} && rm -rf ${sourceDirs}