// change ...
window.dbug = false;
// ... change


// current server
if (window.dbug === true) {
  window.serv = 'https://jquerymobilesink-c9-louisking.c9.io';
  window.showPanoClose = true;
  window.showPegMan = true;
}
else {
  window.serv = 'http://tnmem.com:8081';
  window.showPanoClose = false;
  window.showPegMan = false;
}

// Avoid 'console' errors in browsers that lack a console.
// From Twitter source code.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if ((!console[method]) || (!window.dbug)) {
            console[method] = noop;
        }
    }
}());
