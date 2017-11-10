# express-graphql-mongodb

## Install watchman on local machine (this is required to run 'npm run build')
 - brew update
 - brew install watchman

## Vagrant box setup/config on puphpet

Setting up a virtual machine is not necessary.  I did it so that I didn't clutter my computer with a MongoDB instance.
If you want to setup a VM, then you'll first need to install VirtualBox and Vagrant as the following steps assume you
have those installed.  For the rest of the steps in this section, go to www.puphpet.com and enter the values below.

 - OS: Ubuntu Trusty
 - Folder Source: /Users/dalemcneill/Projects/express-graphql-mongodb

### NGINX
 - contacts.dev (and www.contacts.com)
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

## Building the virtual machine

Once you download the puphpet config, unzip it and place it where ever you like to put VMs.  Then run the following.

```
> vagrant up
```

## Post Vagrant Up

### Setup Hosts

Add the following line to your /etc/hosts file

```
192.168.56.101  contacts.com www.contacts.com
```

### Upgrade to latest npm and node

```
> vagrant ssh
> sudo npm install npm -g
> sudo npm cache clean -f
> sudo npm install -g n
> sudo n stable
```

## Installation

```
> npm install
```

## Running

Set up generated files:

```
> npm run update-schema
```

From local machine:
This needs to be run from the local machine because the relay-compiler uses watchman to determine what files have changed.

```
> npm run build
```

Start a local server:

```
> npm start
```

## Developing

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.graphql`, and restart the server:

```
> npm run update-schema
> npm run build
> npm start
```
