nextDir=~/work/dev/next.js/packages/next
changeRoot=cd ./using-preact/node_modules/next &&
main:
	${changeRoot} ln -s ${nextDir}/bin .
	${changeRoot} ln -s ${nextDir}/build .
	${changeRoot} ln -s ${nextDir}/cli .
	${changeRoot} ln -s ${nextDir}/client .
	${changeRoot} ln -s ${nextDir}/compiled .
	${changeRoot} ln -s ${nextDir}/export .
	${changeRoot} ln -s ${nextDir}/lib .
	${changeRoot} ln -s ${nextDir}/next-server .
	${changeRoot} ln -s ${nextDir}/pages .
	${changeRoot} ln -s ${nextDir}/server .
	${changeRoot} ln -s ${nextDir}/telemetry .
	${changeRoot} ln -s ${nextDir}/types .
link:
	ln -s ${nextDir} .
clean:
	${changeRoot} rm -rf ./bin ./build ./cli ./client ./compiled ./export ./lib ./next-server ./pages ./server ./telemetry ./types