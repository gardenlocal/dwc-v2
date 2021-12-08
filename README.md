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

# Troubleshooting
Bug with db getting out of sync leading to the frontend not showing up --> deleting main.db and restarting server.

# Development Instructions

This project is split up into two main components, frontend and backend, both of which can be found in this repository. The server code is under the `server` folder, and the frontend code is under the `canvas` folder. A third folder, `tests`, allows for running automated stress-tests of the project, and is described in a later section of this document.

## Code structure and main components

### Server

At a high level, the role of the server is to keep track of the state of the entire app, such that the visuals end up being synchronized among all clients. In this context, "state" includes information about which garden slots are occupied and by whom, where each creature is currently and where it is headed, what generative parameters each creature was built with, information about the animation sequence for each user garden background, and more. Pretty much everything visual that is happening in the frontend has been abstracted into this state, and all updates happen via the server.

#### Data management

In order to keep track of this state, the server uses in-memory JSON objects, as well as `nedb`: a simple no-sql database, saved on the server's hard drive as a JSON file. Using the database allows us to keep state between different runs of the server (e.g. restarting the server, restarting the Raspberry PI), and use a simple mechanism to detect returning users: a randomly assigned ID on the frontend, which is saved in the browser's local storage and in the database.

There are three types of objects in the database: `users`, `creatures` and `gardenSections`.

The `user` object type holds the previously mentioned unique id, as well as references to a user's garden section and creature. There is a one-to-one relationship between a user and a garden section (i.e. a user gets assigned exactly one garden section,) and also a one-to-one relationship between a user and a creature (a user gets assigned exactly one creature.) 

The `gardenSection` object type contains information about where a user's garden is located. At a high level, we treat the entire garden space as an infinite grid (bird's eye view.) On this infinite grid, each user gets assigned a free square of dimensions 1000 x 1000. Garden section assignment happens whenever a user connects to the server. When the user disconnects, their garden section gets cleared out, so future users who use the website can get the same spot. Garden sections only exist at coordinates multiple of 1000 (e.g. `0, 0`, `4000, 2000`, `-12000, 3000`). 
Assigning a garden section to a user is done using a depth-first search on the existing garden structure. We start from the section located at (0, 0). If any of its four neighbors on the grid are free, we assign the first free neighbor to the user. If not, we recursively apply this search to each neighbor, until we find an empty spot. This ensures that the garden sections we assign stay clustered and close to the center of the grid.
Specifically, the `gardenSection` object type holds the coordinates of its assignment (`(x, y)` position and `(width, height)` pair, with the note that `width` and `height` are always `1000` in the current version.) It also holds a reference to the user that's currently assigned to that garden section. The other important thing that is being stored in the `gardenSection` object is a sequence of values which serve as animation parameters to the frontend (stored in the `noTiles` and `tileProps`.)

### Client

## Development setup
