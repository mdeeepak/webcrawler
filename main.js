/**
 * Created by dshukla on 2/3/2018.
 */


var Crawler = require( './crawlerMain' );

var url = 'http://medium.com';

new Crawler().startCrawling( url, function onSuccess( page ) {
    console.log( page.url );
} );








