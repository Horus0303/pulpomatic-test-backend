#!/bin/bash
cd /usr/src/app

if echo "${1}" | grep -q 'shell' ;then
    exec /usr/bin/env bash
fi