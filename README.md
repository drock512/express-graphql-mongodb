# express-graphql-mongodb

## Vagrant box setup/config on puphpet
 - OS: Ubuntu Trusty
 - Folder Source: /Users/dalemcneill/Projects/express-graphql-mongodb

### NGINX
 - contacts.dev (and www.contacts.dev)
 - project root: /var/www
 - location root: /var/www
 - proxy: http://localhost:3000
 - proxy set header:
 -- Upgrade $http_upgrade
 -- Connection "upgrade"
 -- Host $host

### NODE
 - Install version 7

### MongoDB
 - Install with defaults

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

### Upgrade to latest npm
 - sudo npm install npm -g

### Upgrade to latest node
 - sudo npm cache clean -f
 - sudo npm install -g n
 - sudo n stable

### Extra to fix npm install hangs
 - sudo chown -R $USER:$(id -gn $USER) /home/vagrant/.config

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
