#!/bin/sh
set -e
pushd bootstrap-3.2.0
grunt dist
cp dist/css/bootstrap.min.css ../css/
popd
