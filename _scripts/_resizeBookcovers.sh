#!/usr/bin/env bash

find uploads/bookcovers -type f -iname "*.jpg" -print0 | while IFS= read -r -d $'\0' line; do

    # Directory of the file
    DIRECTORY=$(dirname $line)

   convert ${line} -resize 250x ${line}
done