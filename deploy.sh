#!/bin/bash

npm run build
rm -rf firebase/public
mkdir firebase/public
cp -a dist/* firebase/public/
cd firebase
firebase deploy --only hosting
cd ..