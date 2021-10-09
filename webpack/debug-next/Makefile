rootDir=~/dev
main:
	make clean
	ln -s ${rootDir}/webpack/node_modules .
	ln -s ${rootDir}/webpack .
	cd node_modules && mkdir webpack && cd webpack && ln -s ${rootDir}/webpack/lib .
clean:
	rm -rf node_modules/webpack
	rm -rf webpack node_modules
install:
	cd ${rootDir} && git clone git@github.com:webpack/webpack.git
v%:
	cd ${rootDir}/webpack && git reset --hard $@.0.0 && yarn
%:
	cd ${rootDir}/webpack && git reset --hard v$@ && yarn