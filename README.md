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

Under the `server` folder of this repository, you should see a `.env-sample.txt` file. This is the template for the server `.env` configuration. Rename this file into `.env` (with no other extension,) and make sure to change the parameters in there to match the type of garden you want. There are four garden types: `moss`, `mushroom`, `lichen` and `all`. The individual gardens only contain one type of creature, while the `all` one contains all three types of creatures.
Make sure to also update the `WEATHER_API` variable with the correct URL of the local weather server.

In order to start the server, you need to run the following in your terminal, in the server folder (with the appropriate name, i.e. change `moss` to `lichen`, `mushroom` or `all`):
```
pm2 start index.js --name "moss"
```

You can make sure that the server started by typing `pm2 ls` in your terminal. You should see a list of all running servers.
You can stop the server by running `pm2 stop moss`. (or `pm2 stop mushroom`, etc. Use the name you've assigned the server in the start command.)
After stopping, you can restart the server by running `pm2 start moss`.


### (Re-)Deploying the latest code

0. For sanity, make sure there aren't any browsers open with the website.
1. Stop the server by running `pm2 stop server`. 
2. Navigate to this repository's folder on the Pi (`~/works/dwc-2/`), first run `git stash` and then run `git pull` to get the latest changes.
3. Restart the server: `pm2 start server`.
4. Navigate to the `canvas` directory, and run `npm run deploy`. This will build the latest version of the frontend and copy it to the `/var/www/dwc` folder, where nginx will pick it up. You might get asked for your sudo password.
5. Restart nginx: `sudo service nginx restart`.
6. That's it! Use your browser to navigate to the Pi's PI and make sure the site loads, and isn't stuck on the `Loading...` screen. If it is stuck on the loading screen, either the server didn't properly start, or there are errors in the frontend.

# Troubleshooting

During the first install, we noticed a bug where maybe once a day the database would get corrupted, which would lead to frontend errors which prevented users from seeing the gardens and the creatures. We are still investigating the bug. As a temporary fix, one way to bring everything into a working state is to stop the server, remove the database, and restart the server. None of the information stored in the database is essential to the proper functioning of the app, so this operation is non-destructive.
From the repository's folder on the raspberry pi you're trying to fix, run:

```
pm2 stop moss
rm server/storage/main.db
pm2 start moss
```
(of course, you need to use the pm2 name you've given your server. If you forgot that, run `pm2 ls` to see all running `pm2` processes.)

# Development Setup

Install `node`, either from the official website, or using `nvm` (node version manager) if you would like a specific version. We developed this app using node 14, but it should run on newer versions as well.

Clone this repository, and run `npm install` in both the `canvas` and `server` folders.
Start the server by running `npm run dev` in the `server` folder.
In a different terminal, start the client by running `npm run start` in the `canvas` folder.
You should now be able to see the project in your browser, at `localhost:1234`.

## Test with multiple fake creatures
1. Dev environment: With `nodejs` only

- Case 1
  - Run `index.js` file
  - Edit `index.js` code to change the number of creatures
```
$ cd tests
$ node index.js
```

- Case 2
  - Run `synthUsers.js` and use `json` file for each creature
  - To run it locally (without pi-wifi setup), edit `synthUsers.js` code's `URL` into something like this: `const URL = "http://localhost:1234/test"` 
```
$ cd tests
$ node synthUsers.js ./all.json
// or 
$ node synthUsers.js ./mushroom.json
// or switch to moss.json, lichen.json
```
- *Caution* : Make sure your `server/.env` and `canvas/env.js` and `test/...json` are all configured into same `creature type` setting.

2. Production environment: With `pm2`
- Start the server for fake creatures and run `json` for each creature.
- Edit `json` file to change configuration of fake creatures
```
$ cd tests
$ pm2 start synthUsers.js --name "synthAll" -- ./all.json
// or
$ pm2 start synthUsers.js --name "synthMushroom" -- ./mushroom.json
// or
$ pm2 start synthUsers.js --name "synthMoss" -- ./moss.json
// or
$ pm2 start synthUsers.js --name "synthLichen" -- ./lichen.json
```

# Code Structure

This project is split up into two main components, frontend and backend, both of which can be found in this repository. The server code is under the `server` folder, and the frontend code is under the `canvas` folder. A third folder, `tests`, allows for running automated stress-tests of the project, and is described in a later section of this document.

## Code structure and main components

### Server

At a high level, the role of the server is to keep track of the state of the entire app, such that the visuals end up being synchronized among all clients. In this context, "state" includes information about which garden slots are occupied and by whom, where each creature is currently and where it is headed, what generative parameters each creature was built with, information about the animation sequence for each user garden background, and more. Pretty much everything visual that is happening in the frontend has been abstracted into this state, and all updates happen via the server.

**Data management**

In order to keep track of this state, the server uses in-memory JSON objects, as well as `nedb`: a simple no-sql database, saved on the server's hard drive as a JSON file. Using the database allows us to keep state between different runs of the server (e.g. restarting the server, restarting the Raspberry PI), and use a simple mechanism to detect returning users: a randomly assigned ID on the frontend, which is saved in the browser's local storage and in the database.

There are three types of objects in the database: `users`, `creatures` and `gardenSections`.

The `user` object type holds the previously mentioned unique id, as well as references to a user's garden section and creature. There is a one-to-one relationship between a user and a garden section (i.e. a user gets assigned exactly one garden section,) and also a one-to-one relationship between a user and a creature (a user gets assigned exactly one creature.) 
**You can find the logic for user creation under `server/controllers/user.controller.js`.**

The `gardenSection` object type contains information about where a user's garden is located. At a high level, we treat the entire garden space as an infinite grid (bird's eye view.) On this infinite grid, each user gets assigned a free square of dimensions 1000 x 1000. Garden section assignment happens whenever a user connects to the server. When the user disconnects, their garden section gets cleared out, so future users who use the website can get the same spot. Garden sections only exist at coordinates multiple of 1000 (e.g. `0, 0`, `4000, 2000`, `-12000, 3000`). 
Assigning a garden section to a user is done using a depth-first search on the existing garden structure. We start from the section located at (0, 0). If any of its four neighbors on the grid are free, we assign the first free neighbor to the user. If not, we recursively apply this search to each neighbor, until we find an empty spot. This ensures that the garden sections we assign stay clustered and close to the center of the grid.
Specifically, the `gardenSection` object type holds the coordinates of its assignment (`(x, y)` position and `(width, height)` pair, with the note that `width` and `height` are always `1000` in the current version.) It also holds a reference to the user that's currently assigned to that garden section. The other important thing that is being stored in the `gardenSection` object is a sequence of values which serve as animation parameters to the frontend (stored in the `noTiles` and `tileProps`.)
**You can find the logic for garden section assignment and clearing under `server/controllers/garden.controller.js`.**

The `creature` object type contains information about a creature's type (`mushroom`, `lichen` or `moss`,) data for how to generatively spawn each creature in the frontend, data for how each creature "evolves" when a user taps it, and information about the creature's movement on screen. By storing all of this information, the server is able to broadcast any changes to the state of a creature to all connected clients, and creatures' shapes and positions stay synchronized with each other across all devices.
Regarding movement, the server doesn't fully "animate" the creatures, meaning that it doesn't communicate the creature positions to all clients at every frame. Rather, it sends messages when creatures are changing direction, and instructs the clients to animate movement to a certain position, with a given duration. (e.g. creature #12 moves to the coordinate `5024, 719` over 25 seconds, starting now.) The client code becomes responsible for making sure it respects the instructions received from the server. While there might be small timing inaccuracies in doing things this way, they haven't proven to be a problem in production.
**You can find the logic for creature management under `server/controllers/creature.controller.js`.**

**Web socket communication with the clients**

In order to communicate state changes to the clients (and receive events from the clients, such as user taps, etc. which alter the state) we use web sockets, with the `socket.io` library. The important websocket messages the server receives from clients are:

* when a user connects to the site; this leads to assigning a new, empty, garden section for the user, retrieving their old creature from the database (or creating a new one if it's their first time on the website,) and beginning to animate the position of the creature, using the method specified above.
* when a user disconnects from the site; this leads to emptying out the previous garden section of the user, and marking their creature as "offline";
* when a user taps (clicks) on their own creature; this leads to the creature "evolving" -- changing shape, using the generative system. On the server side, we update the `creatureObject` with its new parameters, and communicate this change to all clients for on-screen animation
* when a user taps (clicks) on their garden; this "summons" the creature at the tap position, meaning that the creature's animation is cancelled and its current position is updated to the tap position.

The important websocket messages the server sends to the clients are:

* after a new user is connected, the server broadcasts the updated list of online users, as well as the updated list of online creatures (these have the same number of elements, since each user has one creature and one creature only). These are the `usersUpdate` and `creatures` messages.
* when a creature is instructed to start moving in a different direction, or changes its position due to a garden tap, the server broadcasts the new position & motion data to all clients. This is done using the `creaturesUpdate` message.
* when a creature evolves after being tapped, the server broadcasts the creature id and the evolution parameters to all clients. This is done using the `creatureEvolveBroadcast` message.
**All of the websocket communication logic can be found under `server/controllers/socket.controller.js`**


### Client
Sosun has made a wonderful technical diagram of the frontend [here](https://www.figma.com/file/w2HzFecg65sds39SEc4S6Z/Software-Diagram?node-id=0%3A1) and [here](https://www.figma.com/file/w2HzFecg65sds39SEc4S6Z/Software-Diagram?node-id=9%3A4).
