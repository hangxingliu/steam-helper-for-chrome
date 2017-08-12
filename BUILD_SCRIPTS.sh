#!/usr/bin/env bash

BUILDER="browserify"
SOURCE_DIR="extension/src/"
TARGET_DIR="extension/dist/"

if [[ -z `which ${BUILDER}` ]]; then
	echo -e "\n  error: ${BUILDER} is missing! please execute: \"npm i ${BUILDER} -g\"\n"
	exit 1
fi

if [[ ! -d "${SOURCE_DIR}" ]]; then
	echo -e "\n  error: source folder ${SOURCE_DIR} is missing! \n"
	exit 2
fi

[[ ! -e "${TARGET_DIR}" ]] && mkdir -p "${TARGET_DIR}"

find "${SOURCE_DIR}" -maxdepth 1 -type f -iname "*.js" | 
	awk -v src="${SOURCE_DIR}" '{gsub(src, "", $0); print $0;}' |
	xargs -I __file__ "${BUILDER}" "${SOURCE_DIR}__file__" -o "${TARGET_DIR}__file__"

if [[ $? == "0" ]]; then
	echo -e "\n  success!\n"
else
	echo -e "\n  failed!\n"
	exit 3
fi
