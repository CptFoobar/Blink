(function(){

    



    var contentHandler = {};

    // HACK: Shouldn't set contentHandler as a window attribute (or should we?)
    // There's gotta be a better way to pass the feedHandler object around
    window.contentHandler = contentHandler;

}());
