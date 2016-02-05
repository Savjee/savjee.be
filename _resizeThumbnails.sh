#!/usr/bin/env bash

find uploads -type f -iname "thumb_master.jpg" -print0 | while IFS= read -r -d $'\0' line; do

    # Directory of the file
    DIRECTORY=$(dirname $line)

    # Generate a thumbnail for the timeline, should be 350px wide, height doesn't matter
    if [ ! -f ${DIRECTORY}/thumb_timeline.jpg ]; then
        convert ${line} -resize 350x ${DIRECTORY}/thumb_timeline.jpg
    fi

    # Generate a Twitter thumbnail if it does not exist yet
    if [ ! -f ${DIRECTORY}/thumb_twitter.jpg ]; then
        convert ${line} -resize 560x300 -background white -gravity center -extent 560x300 ${DIRECTORY}/thumb_twitter.jpg
    fi

    # Generate a Facebook thumbnail if it does not exist yet
    if [ ! -f ${DIRECTORY}/thumb_facebook.jpg ]; then
        convert ${line} -resize 600x315 -background white -gravity center -extent 600x315 ${DIRECTORY}/thumb_facebook.jpg
    fi

done