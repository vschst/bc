# bc
Bans Control

# Introduction
The resource is a web-based interface for managing bans.
The following options are available: ban player by IP address or Serial, removal of bans, edit ban data (Nickname, reason, unban time). All actions occur in the interface in asynchronous mode.
The design of the web interface is based on the use of stylistic packages, Bootstrap and Font Awesome.
In the logical part of the interface uses the JavaScript library jQuery and Moment.js.

# Installation
Create a new directory with name **bc** in resource directory of your MTA server.
Download the repository files to this folder
```
git clone https://github.com/vschst/bc path/to/directory/bc
```
To start resource, enter the following command in the server console
```
start bc
```
In case of successful start you will see the message
```
[BC] Resource was successfully loaded!
```
otherwise, you will see a message with the place and the error code.
If you want to run a resource with the server running, then edit the configuration file *mtaserver.conf*, adding following string
```
<resource src="bc" startup="1" protected="0"/>
```
# ACL access and language
## ACL access
Resource requires ACL access to the following functions:
* **addBan** (Add new ban),
* **removeBan** (Removal of ban),
* **setBanNick** (Edit ban nick),
* **setBanAdmin** (Edit ban admin),
* **setBanReason** (Edit ban reason),
* **setUnbanTime** (Edit unban time of ban).
To open access, enter in the server console the command
```
aclrequest allow bc all
```
## Language
To install English language, open a resource directory, and go to the `texts/data` directory.
Replace all xml files on the files from **en** folder and restart resource.

# Access to web interface
To access for web interface, open a browser and visit `http://address:port/resource/web/index.html`, where **address** - the IP address of your MTA server, **port** - the HTTP port of your MTA server, **resource** - name of resource Bans Control in your resource directory (default: bc).
For example, on a locally hosted server using default http port:
```
http://127.0.0.1:22005/bc/web/index.html
```
Next you need to enter the username and password of your account from Admin ACL group.
In case of successful authorization you will be redirected to the index page of the bans web management interface.

## Access through resources browser
If your MTA server is running the default resource **resourcebrowser**, you can access the web interface directly.
To do this, open a browser and visit `http://address:port/` and login.
In case of successful authorization you will be redirected to the index page of the resources browser.
To access the bans web management interface, click on the left side of the page the link Bans Control.

# Settings
Resource settings are available in the `meta.xml` file.
* **WebMaxNumberOfBansToShow**
  
  The maximum number of ban list columns to display on the index page of the web interface.
  The value must be an integer greater than zero.
