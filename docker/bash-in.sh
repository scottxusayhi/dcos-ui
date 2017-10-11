#!/bin/bash
#set -ex
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. ${SCRIPT_DIR}/image

docker run -it --rm --entrypoint=/bin/sh ${IMAGE}
