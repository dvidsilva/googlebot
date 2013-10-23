## GoogleBot <small>ExpressJs</small>

This module implements a middleware for express that allows to render a full Html/JS/Css version of a
page when JS is not available in the client and the site relies heavily on it to render the site, like
when using ember/angular/jquery/backbone; I needed to code this for work to be able to deliver a
SEO friendly version of the website to the Google Crawler, and found no solution available.

## Docs
[Google Crawler](https://developers.google.com/webmasters/ajax-crawling/docs/specification) will
attempt a different url when certain characteristics are met, make sure your site complains with them, you have
two options for this
  * You must replace your # with #!
  * You can add a meta tag to your layout `<meta name="fragment" content="!">` this must be done server side,
  if this is not found in the initial response it won't work
Later we will try to figure out the user agent and make it available to more crawlers, or prevent crawling.

Google will replace the hashbang (or the url) with `?_escaped_fragment_= ` and append the rest of the url there
and expects a different, completely rendered version of the site, the middleware will realize when the request
has this and instead of retrieving the normal response it will return the full rendered version that phantomJS
creates.

The url fragment that triggers the rendering in phantom can be customized, and something can be appended to it
to create conditionals that will restrict crawling or hide certain parts from Google, this too can be
customized.

I tried to make it as custom as possible to create different uses withouth having to modify the core files,
so you can even serve static files from a different server if it was
the case; since this is technically a proxy you can use it for many things. Pull request are welcome and
encouraged tho.

## Getting Started

### Installing Phantom in a server
Since we are probably hosting this in a virtual machine installing a new program might not be as trivial as
installing it in our shiny macbooks. This is how you download phantom, uncompress it and add the binaries to
the path.

    cd ~/
    mkdir phantom
    cd phantom
    wget https://phantomjs.googlecode.com/files/phantomjs-1.9.2-linux-x86_64.tar.bz2
    sudo mv phantomjs-1.9.2-linux-x86_64.tar.bz2 /usr/local/share/.
    cd /usr/local/share
    sudo tar -xf phantomjs-1.9.2-linux-x86_64.tar.bz2
    sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64 /usr/local/share/phantomjs
    sudo ln -s /usr/local/share/phantomjs/bin/phantomjs /usr/local/bin/phantomjs

### Installing GoogleBot
Remember this is middleware for express, I don't know how it works in other frameworks, if you do fork it and
make it better :)

There's probably no point on installing globally, but if you wish to it will install

    npm install --save googlebot

To install locally, or add googlebot in your package.json

### Configuring the middleware
In your server.coffee o server.js when you launch the server add the line for googlebot, tada!

    app.use googlebot {option:value}

if javascript

    app.use(googlebot({option:'value', option2:'othervalue'}));

More complete example

    googlebot = require 'googlebot'
    express = require 'express'

    app = module.exports = express()
    app.configure ->
      app.set 'views', __dirname + '/views'
      app.use googlebot {delay: 5000, canonical: 'http://dvidsilva.com'}
      app.use (req, res) ->
        res.render 'app/index'

    app.startServer = (port) ->
      app.listen port, ->
        console.log 'Express server started on port %d in %s mode!',
          port, app.settings.env



## Options

### canonical
[ref](http://googlewebmastercentral.blogspot.com/2011/06/supporting-relcanonical-http-headers.html)
specify the preferred host for google to associate the page resulting, a header will be sent to tell Google
how to show the url to the page and make sure the ugly one is not the one indexed

## Dependencies <small>and notes</small>
* You need to install [PhantomJS](http://phantomjs.org/) and make it available in the PATH
* [Node Phantom](https://github.com/alexscheelmeyer/node-phantom) is used to communicate between
Node and the Phantom Browser
* [ExpressJS](http://expressjs.com/) is a Node web application framework and this GoogleBot is a middleware
for it, if you're using a different framework it might or not work, I have no idea, but at least you can
  get some inspiration and copy what's useful
* [Google Ajax Crawling](https://developers.google.com/webmasters/ajax-crawling/docs/specification) Google
will attempt a different url if certain characteristics are met, you must be complaint with them

## Thanks to
[Crawlme](https://github.com/OptimalBits/Crawlme/blob/master/lib/crawlme.js) That implements a simmilar module
to use with ZombieJS instead of Phantom
