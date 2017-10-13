# express-graphql-mongodb

## Download and get vagrant box running

## Post Vagrant Up

### Install watchman
 - git clone https://github.com/facebook/watchman.git
 - cd watchman
 - git checkout v4.9.0
 - sudo apt-get install -y autoconf automake build-essential python-dev
 - ./autogen.sh
 - ./configure
 - make
 - sudo make install

## Installation

```
npm install
```

## Running

Set up generated files:

```
npm run update-schema
npm run build
```

Start a local server:

```
npm start
```

## Developing

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.graphql`, and restart the server:

```
npm run update-schema
npm run build
npm start
```
