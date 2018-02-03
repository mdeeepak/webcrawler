/**
 * Created by dshukla on 2/3/2018.
 */

var request = require( 'request' );
var _ = require( 'underscore' );


var url = 'http://medium.com';

function Crawler() {
    this.visitedUrlsArray = [];
    this.depthForLink = 3;
    this.maxConcurrentRequest = 5;
    this._currentCrawlQueue = [];
    this._currentConcurrentReuqest = 0;
};

Crawler.prototype.startCrawling = function ( url, onSuccess ) {
    this._crawlUrls( [ url ], null, this.depthForLink );
    this.onSuccess = onSuccess;
    return this;
};

Crawler.prototype._crawlUrls = function ( urls, referer, depth ) {
    var that = this;

    _.each( urls, function ( url ) {
        // console.log(url);
        that._crawlUrl( url, referer, depth );
    } );
};

Crawler.prototype._removeUrlToCurrentCrawlQueue = function ( url ) {
    var index = this._currentCrawlQueue.indexOf( url );
    this._currentCrawlQueue.splice( index, 1 );
};

Crawler.prototype._MakeRequest = function ( options, callback ) {
    var that = this;
    var url = options.url;

    //check for already crawled url
    if ( _.contains( this._currentCrawlQueue, url ) || _.contains( this.visitedUrlsArray, url ) ) {
        return;
    }
    this._currentCrawlQueue.push( url );
    this._currentConcurrentReuqest++;
    if ( this._currentConcurrentReuqest < this.maxConcurrentRequest ) {
        request( options, function ( error, response, body ) {
            callback( error, response );
            that._removeUrlToCurrentCrawlQueue( url );
            that._currentConcurrentReuqest--;
        } );
    }
};

Crawler.prototype._getUrlsInBody = function ( body ) {
    body = body.replace( /<!--.*?-->/g, '' );     // strip the comments
    var linksRegex = /<a[^>]+?href=["'].*?:\/\/.*?["']/gmi;
    var links = body.match( linksRegex ) || [];

    var urls = _.chain( links )
        .map( function ( link ) {
            link = /href=[\"\'](.*?)[#\"\']/i.exec( link )[1];
            return link;
        } )
        .uniq()
        .filter( function ( link ) {
            return link.indexOf('http://') >= 0 || link.indexOf('https://') >= 0;
        } )
        .value();

    _.each(urls, function(url){
        console.log(url);
    });
    return urls;
};


Crawler.prototype._crawlUrl = function ( url, referer, depth ) {
    if ( (depth === 0) || _.contains( this.visitedUrlsArray, url ) ) {
        return;
    }
    var that = this;
    var options = {
        url: url,
        headers: {
            'Referer': referer
        }
    };
    this._MakeRequest( options, function ( error, response ) {
        if ( _.contains( this.visitedUrlsArray, url ) ) {
            return;
        }
        that.visitedUrlsArray.push( url );
        var body = response.body.toString();    // TODO: Decode the body and check for validBody

        if ( !error && (response.statusCode === 200) ) {
            var nextUrlToCrawl = response.request.uri.href;
            // console.log(nextUrlToCrawl);
            that.visitedUrlsArray.push( nextUrlToCrawl );
            that.onSuccess( {
                url: nextUrlToCrawl
            } );
            if ( depth > 1 ) {
                that._crawlUrls( that._getUrlsInBody( body ), nextUrlToCrawl, depth - 1 );
            }
        } else {
            console.log( 'Unable to make request' );
            that.visitedUrlsArray.push( url );
        }
    } );
};

new Crawler().startCrawling( url, function onSuccess( page ) {
    console.log( page.url );
} );








