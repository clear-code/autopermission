PACKAGE_NAME = autopermission

all: xpi

xpi: buildscript/makexpi.sh
	buildscript/makexpi.sh -n $(PACKAGE_NAME) -o

buildscript/makexpi.sh:
	git submodule update --init

signed: xpi
	buildscript/sign_xpi.sh -k $(JWT_KEY) -s $(JWT_SECRET) -p ./$(PACKAGE_NAME)_noupdate.xpi
