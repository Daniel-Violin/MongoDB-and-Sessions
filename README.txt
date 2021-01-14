

1. Navigate to location of the folder inside terminal (unzip the views folder as well)
2. Do what you do with the database on your end, not entirely sure how your setup will be. For me I had the database file in the same directory
   and would run the daemon when wanting to start up the server
3. Run 'npm install' at this location to install the dependencies needed
4  Initialize the database if you want the 10 initial users
5. Run 'node a4-server.js'
6. All of the navigation is handled in the header and by automatic redirects

Design Choices:

- Firstly, I decided not to use routers in this website, instead I opted to handle it through a single, bigger
  client.js and a larger server.js (the routes in the server were relatively small so for convenience I did not make
  new files for each route). I still included routes to handle the request but I didnt put them into different js files like
  we've observed in lecture and tutorials. Instead all my routes are in the same place (a4-server.js).

- Secondly, I chose to use a pug template engine to display my html pages so that I could have dynamic header based on whether
  the user is logged in or not. I have used a lot of pug files in this assignment to display the various pages we need.

- Thirdly, I added a paramter to the object that is passed from orderform.js to the server to keep track of the user that placed the
  order.

- Lastly, a couple of smaller design choices: I decided that usernames are case sensitive so something like daniel and Daniel would be two different
  users. Also I opted into having a "login" page in the header instead of textboxes because I thought it felt more natural that way.
