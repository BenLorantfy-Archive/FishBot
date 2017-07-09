#!/bin/bash

sudo ffmpeg -s 640x480 -f video4linux2 -i /dev/video0 -f mpegts -codec:v mpeg1video -codec:a mp2 -b 0 -r 30 http://benlorantfy.com:8081/supersecretpasswd/640/480/