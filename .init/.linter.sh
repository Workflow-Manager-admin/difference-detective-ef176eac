#!/bin/bash
cd /home/kavia/workspace/code-generation/difference-detective-ef176eac/spot_the_difference_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

