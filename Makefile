PACKAGE_NAME = autopermission

all: xpi

xpi: buildscript/makexpi.sh
	buildscript/makexpi.sh -n $(PACKAGE_NAME) -o

buildscript/makexpi.sh:
	git submodule update --init
