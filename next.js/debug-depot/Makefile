nextDir=~/dev/next.js/packages/next
changeRoot=cd ${nextDir}/dist &&
main:
	mkdir node_modules && cd node_modules && ln -s ${nextDir} .
	cd ${nextDir} && mkdir -p dist
	${changeRoot} ln -s ../bin .
	${changeRoot} ln -s ../build .
	${changeRoot} ln -s ../cli .
	${changeRoot} ln -s ../client .
	${changeRoot} ln -s ../compiled .
	${changeRoot} ln -s ../export .
	${changeRoot} ln -s ../lib .
	${changeRoot} ln -s ../license.md .
	${changeRoot} ln -s ../next-server .
	${changeRoot} ln -s ../pages .
	${changeRoot} ln -s ../server .
	${changeRoot} ln -s ../telemetry .
	${changeRoot} ln -s ../types .
	node changeMain.js
clean:
	cd ${nextDir} && rm -rf dist
	rm -rf node_modules