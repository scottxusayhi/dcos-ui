#!/bin/bash
set -ex
#SCRIPT_DIR=$(dirname $(readlink -e $0))
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_HOME=${SCRIPT_DIR}/../
PROJECT_HOME=${SCRIPT_DIR}/../../
. ${SCRIPT_DIR}/image

# clean build dir
rm -rf $BUILD_HOME/web

pushd ${PROJECT_HOME}/web
rm -rf web/build
npm run build
mkdir -p $BUILD_HOME/web
cp -r build ${BUILD_HOME}/web/
popd

pushd ${PROJECT_HOME}
export GOOS=linux
export GOARCH=amd64
bin=jarvis_master_${GOOS}_${GOARCH}.bin
rm -rf $bin
go clean && go build -o $bin
cp $bin ${BUILD_HOME}/
popd

echo "jarvis master build done"
