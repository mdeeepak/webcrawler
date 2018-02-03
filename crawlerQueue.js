/**
 * Created by dshukla on 2/3/2018.
 */

/**
 Queue for crawler request
 **/
function crawlerQueue(opts) {
    this.Requestqueue = [];
    this.maxRequestFrequency = opts.maxRequestFrequency;
    this.nextRequestTime = (1 / this.maxRequestFrequency) * 1000;
    this.canExecute = opts.canExecute || function () {return true};
}

crawlerQueue.prototype.AddToQueue = function(func, options, skipCallBack) {
    this.Requestqueue.push({
        func: func,
        options: options,
        skipCallBack: skipCallBack
    });
};

crawlerQueue.prototype.start = function() {
    this._processQueueItem();
};

crawlerQueue.prototype._processQueueItem = function() {
    var that = this;
    if(this.canExecute()) {
        if ( this.Requestqueue.length !== 0 ) {
            var nextExecution = this.Requestqueue.shift();
            var skipNextRequest = (nextExecution.skipCallBack && nextExecution.skipCallBack.call( this ));

            if ( skipNextRequest ) {
                setTimeout( function () {
                    that._processQueueItem();
                } );
                return;
            } else {
                nextExecution.func.apply( this, nextExecution.options );
            }
        }
    }
    if ( this.isRequestStopped ) {
        return;
    }
    setTimeout( function () {
        that._processQueueItem();
    }, this.nextRequestTime );
};

module.exports = crawlerQueue;