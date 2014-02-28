var phantom = require('node-phantom');
// see the README.md file for additional clarification

exports = module.exports = function(options) {
  options = options || {};
  options.allowCrawling = options.allowCrawling || true;
  options.trigger = options.trigger || '?_escaped_fragment_=';
  options.append = options.append || '?phantom=true';
  options.delay = options.delay || 1000;
  options.protocol = options.protocol || 'http';
  options.host = options.host || undefined;
  options.canonical = options.canonical || undefined;
  options.evaluate = options.evaluate || function(){};
  options.restrictGet = options.restrictGet || true;
  options.delimiter = options.delimiter || '';
  function testUrl(req) {
    // #IMPROVE allow for the trigger to be an array of triggers instead of a string
    var urlParts = req.url.split(options.trigger);

    // if the trigger is not present in the url we return undefined so the
    // normal process continues
    // #IMPROVE
    if (urlParts.length !== 2) return undefined;

    // Express adds a protocol property to the req object.
    var protocol = req.protocol || options.protocol;

    var url = {
      protocol : protocol + '://' ,
      host : (options.host || req.headers.host),
      delimiter: options.delimiter,
      // the part before the hashbang or trigger
      path: urlParts[0],
      // the part after the trigger
      fragment : urlParts[1],
      append : options.append
    };

    /* The hash fragment is for those pages that store their state in it
     * if (url.fragment.length === 0) {
    // We are dealing with crawlable an ajax page without a hash fragment
    url.append = options.append;
    url.hashbang = false;
    } else {
    url.hashbang = true;
    url.path += '#!';
    }*/
    return url;
  }

  function runPhantom(url,callback){
    phantom.create(function(err,ph) {
      ph.createPage(function(err,page) {
        if(err) callback(err,undefined);
        crawling_url = url.protocol + url.host + url.path + url.delimiter + url.fragment + url.append;
        page.open( crawling_url , function(err,status) {
          setTimeout( function() {
            page.evaluate(function(){
              // this code is executed in the page after loading it,
              // whatever is returned here is passed to the callback as result, so
              // we must extract the resulting html after js changed it
              // and execute any additional processes
              // options.evaluate();
              return document.getElementsByTagName('html')[0].innerHTML;
            }, function(err,result){
              if(err) callback(err,undefined);
              // result is the resulting html after loading the request and executing its js
              callback(undefined,result);
              ph.exit();
            });
          },
          options.delay );
        });
      });
    });
  }


  return function(req, res, next) {
    // only respond this way if a GET request was issued, just in case
    if(options.restrictGet){
      if ('GET' !== req.method ) return next();
    }

    // Find out whether this request requires phantom to render comparing the request.url
    // with the trigger
    // url is an object containing different parts of the url
    var url = testUrl(req);

    // If we aren't being crawled continue to next middleware
    if (!url) return next();

    // a canonical link header tells the google crawler which is the prefered url to index
    res.set('Link', '<'+(options.canonical || url.protocol + url.host ) +url.path + url.fragment +'>; rel="canonical"');

    console.log("crawling " + url.fragment );
    runPhantom(url, function(err,snapshot){
      if(err){
        console.log('phantomError :'+err);
        return next(err);
      }
      res.set("Content-Type","text/html; charset=utf-8");
      res.send(snapshot);
      res.end();
    });
  }
}


