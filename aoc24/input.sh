#!/bin/sh

curl -o "./day$1/input.txt" "https://adventofcode.com/2024/day/$1/input" \
  -H 'cookie:  session=53616c7465645f5fb610625c5af90146e44ee16755358b394545b760226289140378dee95253385b6f8f39c5326e033adacfd3dbc3c164505e9e8c72fb5fa8e8' \
