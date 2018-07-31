/*!
 * # Semantic UI - Colorpicker
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

  'use strict';

  window = (typeof window != 'undefined' && window.Math == Math)
    ? window
    : (typeof self != 'undefined' && self.Math == Math)
      ? self
      : Function('return this')()
  ;

  $.fn.colorpicker = function(parameters) {

  };

  $.fn.colorpicker.settings = {

    name                : 'Colorpicker',
    namespace           : 'colorpicker',

    silent              : false,
    debug               : false,
    verbose             : true,
    performance         : true,

    // delegated event context

    className       : {
    },

    error     : {
      method       : 'The method you called is not defined'
    },

    selector : {
    }

  };

})( jQuery, window, document );
