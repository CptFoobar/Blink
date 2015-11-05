/*!
* angular-post-message v1.3.1
* Copyright 2015 Kyle Welsby <kyle@mekyle.com>
* Licensed under The MIT License
*/
(function() {
  'use strict';
  var app;

  app = angular.module("ngPostMessage", ['ng']);

  app.run([
    '$window', '$postMessage', '$rootScope', '$log',
    function($window, $postMessage, $rootScope, $log) {

      $rootScope.$on('$messageOutgoing', function(event, message, domain) {
        var sender;
        if (domain == null) {
          domain = "*";
        }
        sender = $rootScope.sender || $window.parent;
        return sender.postMessage(message, domain);
      });

      angular.element($window).bind('message', function(event) {
        var error, response;
        event = event.originalEvent || event;
        if (event && event.data) {
          response = null;
          $rootScope.sender = event.source;
          try {
            response = angular.fromJson(event.data);
          } catch (_error) {
            error = _error;
            $log.error('ahem', error);
            response = event.data;
          }
          response.origin = event.origin;
          $rootScope.$root.$broadcast('$messageIncoming', response);
          return $postMessage.messages(response);
        }
      });
    }
  ]);

  app.factory("$postMessage", [
    '$rootScope',
    function($rootScope) {
      var $messages, api;
      $messages = [];
      api = {
        messages: function(_message_) {
          if (_message_) {
            $messages.push(_message_);
            $rootScope.$digest();
          }
          return $messages;
        },
        lastMessage: function() {
          return $messages[$messages.length - 1];
        },
        post: function(message, domain) {
          if (!domain) {
            domain = "*";
          }
          return $rootScope.$broadcast('$messageOutgoing', message, domain);
        }
      };
      return api;
    }
  ]);

}).call(this);
