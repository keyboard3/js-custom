nextDir=../../../next.js/packages/next
absoluteSourceDirs := $(shell cd ${nextDir} && find * -type d -depth 0 ! -name "node_modules" | xargs -I % echo `pwd`/% | xargs -n 100 echo)
sourceDirs := $(shell cd ${nextDir} && find * -type d -depth 0 ! -name "node_modules" -print0| xargs -0 echo)
projNodeModuleDir=$(PWD)/using-preact/node_modules/next
main:
	make clean
	cd ${nextDir} && ln -sf ${absoluteSourceDirs} ${projNodeModuleDir}
clean:
	cd ${projNodeModuleDir} && rm -rf ${sourceDirs}