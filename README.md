# Distributed Web of Care: Client and Server

## On-Site Installation

Install `node`, and once you have that installed, get `pm2` as well (`npm install pm2 -g`).
Clone this repository on the PI, and make sure to run `npm install` in both the `canvas` and `server` folders.

### First time setup: Frontend

We are going to serve the frontend using `nginx`. In order to set that up, you need to follow the steps below *once*, the first time when setting a PI up.

1. Install nginx: `sudo apt update` and `sudo apt install nginx`.
2. Make sure nginx installed properly, by navigating to the PI's IP (port 80) in the browser. You should see an `nginx` default webpage.
3. Create a folder called `dwc` for the frontend, inside of `/var/www`: `mkdir /var/www/dwc`. You might need `sudo`.
4. Point nginx to the `dwc` folder as a default, by editing the file at `/etc/nginx/sites-enabled/default`. You need to change the `root` and `location` properties. `root` should point to `/var/www/dwc` instead of the default `/var/www/html`. `location` should be `try_files $uri $uri/ /index.html =404`.
5. Restart nginx: `sudo service nginx restart`.

Since the folder is currently empty, if you navigate to the PI's IP in the browser you won't see anything.

### First time setup: Server

We will start the process once using `pm2`, and then starting and stopping the server will be as easy as running `pm2 start server` or `pm2 stop server`.

**TODO: Ask Donghoon for exact pm2 start command from the Pi history, I forgot the syntax**.


### (Re-)Deploying the latest code

0. For sanity, make sure there aren't any browsers open with the website.
1. Stop the server by running `pm2 stop server`. 
2. Navigate to this repository's folder on the Pi (`~/works/dwc-2/`), first run `git stash` and then run `git pull` to get the latest changes.
3. Restart the server: `pm2 start server`.
4. Navigate to the `canvas` directory, and run `npm run deploy`. This will build the latest version of the frontend and copy it to the `/var/www/dwc` folder, where nginx will pick it up. You might get asked for your sudo password.
5. Restart nginx: `sudo service nginx restart`.
6. That's it! Use your browser to navigate to the Pi's PI and make sure the site loads, and isn't stuck on the `Loading...` screen. If it is stuck on the loading screen, either the server didn't properly start, or there are errors in the frontend.



# Old version of this document

This repository holds both the server and the client for DWC v2. After cloning this repository, the installation instructions below for getting the prototype running:

## For server

```
cd server
npm install
npm run dev
```

`localhost:3000`

This will start the server. If it's the first time you are installing it, the server will create a database and populate it with the `admin` user. The password for the default `admin` user is `dwc!`.

## For client (new version. pixi + vanilla js)
```
cd canvas
npm install
npm start
```
- Open `localhost:1234` 

Routes
- /: home
  - if logged in, show canvas page
  - if not, show login/signup page
- /signup: sign up page
  - if sucessfully signed up, redirect to home
- /user: user info and logout button
  - show when logged in
  - click the button to switch between canvas('/') and user('/user')

## For client (old version. React)

```
cd client
npm install
npm run start
```

`localhost:3001`

This will start the frontend. Make sure the server is running when starting the frontend, otherwise you will not be able to register / login.
If you login as `admin`, you have access to the entire garden map of all users in the `Admin Garden` tab.
Regular users have access to their garden sections.

**We are in the process of re-writing this frontend prototype in PIXI.js, so this setup is temporary.**
