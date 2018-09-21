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

  $.fn.colorpicker = function (parameters) {
    var
      $allModules    = $(this),

      moduleSelector = $allModules.selector || '',

      time           = new Date().getTime(),
      performance    = [],

      query          = arguments[0],
      methodInvoked  = (typeof query == 'string'),
      queryArguments = [].slice.call(arguments, 1),
      returnedValue
    ;

    $allModules
      .each(function () {
        var
          settings        = ($.isPlainObject(parameters))
            ? $.extend(true, {}, $.fn.colorpicker.settings, parameters)
            : $.extend({}, $.fn.colorpicker.settings),

          className       = settings.className,
          namespace       = settings.namespace,
          selector        = settings.selector,
          metadata        = settings.metadata,
          error           = settings.error,

          eventNamespace  = '.' + namespace,
          moduleNamespace = 'module-' + namespace,

          $module         = $(this),
          $input          = $module.find(selector.input),
          $container      = $module.find(selector.popup),
          $activator      = $module.find(selector.activator),

          element         = this,
          instance        = $module.data(moduleNamespace),

          isTouch,
          isTouchDown     = false,
          module
        ;

        module = {

          initialize: function () {
            module.debug('Initializing colorpicker for', element);

            isTouch = module.get.isTouch();
            module.setup.popup();
            module.setup.input();
            module.setup.color();
            module.create.colorpicker();

            module.bind.events();
            module.instantiate();
          },

          instantiate: function () {
            module.verbose('Storing instance of colorpicker');
            instance = module;
            $module.data(moduleNamespace, instance);
          },

          destroy: function () {
            module.verbose('Destroying previous colorpicker for', element);
            $module.removeData(moduleNamespace);
            module.unbind.events();
          },

          setup: {
            popup : function () {
              if (settings.inline) {
                return;
              }
              if (!$activator.length) {
                $activator = $module.children().first();
                if (!$activator.length) {
                  return;
                }
              }
              if ($.fn.popup === undefined) {
                module.error(error.popup);
                return;
              }
              if (!$container.length) {
                //prepend the popup element to the activator's parent so that it has less chance of messing with
                //the styling (eg input action button needs to be the last child to have correct border radius)
                $container = $('<div/>').addClass(className.popup).prependTo($activator.parent());
              }
              $container.addClass(className.colorpicker);
              var onVisible = settings.onVisible;
              var onHidden  = settings.onHidden;
              if (!$input.length) {
                //no input, $container has to handle focus/blur
                $container.attr('tabindex', '0');
                onVisible = function () {
                  module.focus();
                  return settings.onVisible.apply($container, arguments);
                };
                onHidden  = function () {
                  module.blur();
                  return settings.onHidden.apply($container, arguments);
                };
              }
              var onShow  = function () {
                //reset the focus date onShow
                /*module.set.focusDate(module.get.date());
                module.set.mode(settings.startMode);*/
                return settings.onShow.apply($container, arguments);
              };
              var on      = settings.on || ($input.length ? 'focus' : 'click');
              var options = $.extend({}, settings.popupOptions, {
                popup    : $container,
                on       : on,
                hoverable: on === 'hover',
                onShow   : onShow,
                onVisible: onVisible,
                onHide   : settings.onHide,
                onHidden : onHidden
              });
              module.popup(options);
            },
            inline: function () {
              if ($activator.length && !settings.inline) {
                return;
              }
              $container = $('<div/>').addClass(className.calendar).appendTo($module);
              if (!$input.length) {
                $container.attr('tabindex', '0');
              }
            },
            input : function () {
              if (settings.touchReadonly && $input.length && isTouch) {
                $input.prop('readonly', true);
              }
            },
            color : function () {
              if ($input.length) {
                var val = $input.val();
                // TODO parse color input value
              }
            }
          },

          create: {
            colorpicker: function () {
              if (settings.type === "simple") {

              } else if (settings.type === "pattern") {
                if (settings.palette === undefined || !$.isArray(settings.palette) || settings.palette.length === 0) {
                  module.error(error.emptyPalette);
                  return;
                }
              } else if (settings.type === "full") {

              }
            }
          },

          update: {},

          refresh: function () {
            module.create.colorpicker();
          },

          bind: {
            events: function () {

            }
          },

          unbind: {
            events: function () {
            }
          },

          event: {},

          get: {
            color  : function () {
              return $module.data(metadata.color) || null;
            },
            isTouch: function () {
              try {
                document.createEvent('TouchEvent');
                return true;
              } catch (e) {
                return false;
              }
            },
          },

          set: {
            color       : function (color, updateInput, fireChange) {
              updateInput = updateInput !== false;
              fireChange  = fireChange !== false;
              // TODO validate and sanitize color

              // TODO format color into text
              var text = '';
              if (fireChange && settings.onChange.call(element, color, text) === false) {
                return false;
              }

              module.set.dataKeyValue(metadata.color, color);
              if (updateInput && $input.length) {
                $input.val(text);
              }
            },
            dataKeyValue: function (key, value) {
              var oldValue = $module.data(key);
              if (value !== null && value !== undefined) {
                $module.data(key, value);
              } else {
                $module.removeData(key);
              }
              return oldValue !== value;
            }
          },

          has: {},

          popup: function () {
            return $activator.popup.apply($activator, arguments);
          },

          setting    : function (name, value) {
            module.debug('Changing setting', name, value);
            if ($.isPlainObject(name)) {
              $.extend(true, settings, name);
            }
            else if (value !== undefined) {
              if ($.isPlainObject(settings[name])) {
                $.extend(true, settings[name], value);
              }
              else {
                settings[name] = value;
              }
            }
            else {
              return settings[name];
            }
          },
          internal   : function (name, value) {
            if ($.isPlainObject(name)) {
              $.extend(true, module, name);
            }
            else if (value !== undefined) {
              module[name] = value;
            }
            else {
              return module[name];
            }
          },
          debug      : function () {
            if (!settings.silent && settings.debug) {
              if (settings.performance) {
                module.performance.log(arguments);
              }
              else {
                module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
                module.debug.apply(console, arguments);
              }
            }
          },
          verbose    : function () {
            if (!settings.silent && settings.verbose && settings.debug) {
              if (settings.performance) {
                module.performance.log(arguments);
              }
              else {
                module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
                module.verbose.apply(console, arguments);
              }
            }
          },
          error      : function () {
            if (!settings.silent) {
              module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
              module.error.apply(console, arguments);
            }
          },
          performance: {
            log    : function (message) {
              var
                currentTime,
                executionTime,
                previousTime
              ;
              if (settings.performance) {
                currentTime   = new Date().getTime();
                previousTime  = time || currentTime;
                executionTime = currentTime - previousTime;
                time          = currentTime;
                performance.push({
                  'Name'          : message[0],
                  'Arguments'     : [].slice.call(message, 1) || '',
                  'Element'       : element,
                  'Execution Time': executionTime
                });
              }
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 500);
            },
            display: function () {
              var
                title     = settings.name + ':',
                totalTime = 0
              ;
              time        = false;
              clearTimeout(module.performance.timer);
              $.each(performance, function (index, data) {
                totalTime += data['Execution Time'];
              });
              title += ' ' + totalTime + 'ms';
              if (moduleSelector) {
                title += ' \'' + moduleSelector + '\'';
              }
              if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
                console.groupCollapsed(title);
                if (console.table) {
                  console.table(performance);
                }
                else {
                  $.each(performance, function (index, data) {
                    console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');
                  });
                }
                console.groupEnd();
              }
              performance = [];
            }
          },
          invoke     : function (query, passedArguments, context) {
            var
              object        = instance,
              maxDepth,
              found,
              response
            ;
            passedArguments = passedArguments || queryArguments;
            context         = element || context;
            if (typeof query == 'string' && object !== undefined) {
              query    = query.split(/[\. ]/);
              maxDepth = query.length - 1;
              $.each(query, function (depth, value) {
                var camelCaseValue = (depth != maxDepth)
                  ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                  : query
                ;
                if ($.isPlainObject(object[camelCaseValue]) && (depth != maxDepth)) {
                  object = object[camelCaseValue];
                }
                else if (object[camelCaseValue] !== undefined) {
                  found = object[camelCaseValue];
                  return false;
                }
                else if ($.isPlainObject(object[value]) && (depth != maxDepth)) {
                  object = object[value];
                }
                else if (object[value] !== undefined) {
                  found = object[value];
                  return false;
                }
                else {
                  module.error(error.method, query);
                  return false;
                }
              });
            }
            if ($.isFunction(found)) {
              response = found.apply(context, passedArguments);
            }
            else if (found !== undefined) {
              response = found;
            }
            if ($.isArray(returnedValue)) {
              returnedValue.push(response);
            }
            else if (returnedValue !== undefined) {
              returnedValue = [returnedValue, response];
            }
            else if (response !== undefined) {
              returnedValue = response;
            }
            return found;
          }

        };

        if (methodInvoked) {
          if (instance === undefined) {
            module.initialize();
          }
          module.invoke(query);
        }
        else {
          if (instance !== undefined) {
            instance.invoke('destroy');
          }
          module.initialize();
        }
      })
    ;
    return (returnedValue !== undefined)
      ? returnedValue
      : this
      ;
  };

  $.fn.colorpicker.settings = {

    name     : 'Colorpicker',
    namespace: 'colorpicker',

    silent     : false,
    debug      : false,
    verbose    : true,
    performance: true,

    type   : 'simple', // picker type, can be 'simple', 'full', or 'palette'
                       // if picker type is 'palette' the palette option must be set
    inline : false,    // create the colorpicker inline instead of inside a popup
    palette: [],       // if picker type is 'palette' define all available colors here
    on     : null,     // when to show the popup (defaults to 'focus' for input, 'click' for others)

    // popup options ('popup', 'on', 'hoverable', and show/hide callbacks are overridden)
    popupOptions: {
      position    : 'bottom left',
      lastResort  : 'bottom left',
      prefer      : 'opposite',
      hideOnScroll: false
    },

    // delegated event context
    // callback when color changes, return false to cancel the change
    onChange: function (color, text) {
      return true;
    },

    // callback before show animation, return false to prevent show
    onShow: function () {
    },

    // callback after show animation
    onVisible: function () {
    },

    // callback before hide animation, return false to prevent hide
    onHide: function () {
    },

    // callback after hide animation
    onHidden: function () {
    },

    className: {
      colorpicker: 'colorpicker',
      active     : 'active',
      popup      : 'ui popup',
      grid       : 'ui equal width grid',
      column     : 'column',
      table      : 'ui celled center aligned unstackable table'
    },

    error: {
      popup       : 'UI Popup, a required component is not included in this page',
      emptyPalette: 'Palette option must be set, if type is set to \'palette\'',
      method      : 'The method you called is not defined'
    },

    metadata: {
      color: 'color'
    },

    selector: {
      popup    : '.ui.popup',
      input    : 'input',
      activator: 'input'
    }

  };

})(jQuery, window, document);
