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
          $icon           = $module.find(selector.icon),
          $container      = $module.find(selector.popup),
          $activator      = $module.find(selector.activator),

          element         = this,
          instance        = $module.data(moduleNamespace),

          isTouch,
          isTouchDown     = false,
          module,

          allColors       = undefined,
          colors          = undefined
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
              $container = $('<div/>').addClass(className.colorpicker).appendTo($module);
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
              $container.empty();

              // TODO remove before push
              $module.data(metadata.hueFilter, 0);
              $module.data(metadata.color, {r: 255, g: 0, b: 0, a: 1});
              if (module.is.list()) {
                module.create.hueFilter();
                module.create.list();
              } else if (module.is.grid()) {
                module.create.hueFilter();
                module.create.grid();
              } else if (module.is.full()) {
                module.create.full();
              } else {
                module.error(error.unsupportedType);
              }
            },

            hueFilter: function () {
              var hueSelection = $('<div/>').addClass('hue filter').addClass('ui twelve item menu').appendTo($container);
              var hues         = [
                {r: 255, g: 0, b: 0},
                {r: 255, g: 128, b: 0},
                {r: 255, g: 255, b: 0},
                {r: 128, g: 255, b: 0},
                {r: 0, g: 255, b: 0},
                {r: 0, g: 255, b: 128},
                {r: 0, g: 255, b: 255},
                {r: 0, g: 128, b: 255},
                {r: 0, g: 0, b: 255},
                {r: 128, g: 0, b: 255},
                {r: 255, g: 0, b: 255},
                {r: 255, g: 0, b: 128},
              ];

              hues.forEach(function (value) {
                var hue = $('<div/>)').addClass('link item').appendTo(hueSelection);
                hue.css({"background-color": module.formatter.hex(value)});
                hue.data(metadata.hueFilter, module.helper.rgbToHSL(value).h);
              });
            },

            list: function () {
              var colors = module.get.colors();
              if (colors === undefined || !$.isArray(colors) || colors.length === 0) {
                module.error(error.emptyColors);
                return;
              }

              var colorCount = colors.length,
                  container  = $('<div/>').addClass(className.container).appendTo($container),
                  menu       = $('<div/>').addClass(className.menu).appendTo(container)
              ;

              for (var i = 0; i < colorCount; i++) {
                var cellColor = colors[i];
                var item      = $('<div>').addClass(className.item).addClass(className.cell).appendTo(menu);
                item.data(metadata.color, cellColor);
                item.css({"background-color": module.formatter.hex(cellColor)});
                if (cellColor.l < 0.45) {
                  item.css({"color": "white"});
                }

                if (cellColor.name) {
                  $("<span/>").addClass("color name").text(cellColor.name).appendTo(item);
                }
                $("<span/>").addClass("color hex").text(module.formatter.hex(cellColor)).prependTo(item);
              }
            },

            grid: function () {
              var colors = module.get.colors();
              if (colors === undefined || !$.isArray(colors) || colors.length === 0) {
                module.error(error.emptyColors);
                return;
              }
              var colorCount      = colors.length,
                  horizontalCount = Math.min(10, Math.ceil(Math.sqrt(colorCount))),
                  container       = $('<div/>').addClass(className.container).appendTo($container),
                  table           = $('<table/>').addClass(className.table).appendTo(container),
                  tbody           = $('<tbody/>').appendTo(table),
                  row
              ;

              for (var i = 0; i < colorCount; i++) {
                if (i % horizontalCount === 0) {
                  row = $('<tr/>').appendTo(tbody);
                }
                var cell = $('<td/>').addClass(className.cell).appendTo(row);
                cell.data(metadata.color, colors[i]);
                var label = $("<span/>").addClass(className.label).appendTo(cell);
                label.css({"background-color": module.formatter.hex(colors[i])});
              }
            },

            full: function () {
              var container      = $('<div/>').addClass('container').appendTo($container);
              var colorSelection = $('<div/>').addClass('color selection').appendTo(container);
              var hueSelection   = $('<div/>').addClass('hue selection').appendTo(container);
              var alphaSelection = $('<div/>').addClass('alpha selection').appendTo(container);

              $container.find('.color.selection').css({"background-color": module.formatter.rgb(module.get.color())});
              $container.find('.alpha.selection').css({"background-color": module.formatter.rgb(module.get.color())});
            }
          },

          update: {
            focus: function () {
              if (module.is.list() || module.is.grid()) {
                var focusColor = module.get.focusColor();

                $container.find(settings.selector.cell).each(function () {
                  var cell      = $(this);
                  var cellColor = cell.data(metadata.color);
                  if (!cellColor) {
                    return;
                  }
                  var focused = cellColor === focusColor;
                  cell.toggleClass(className.focusCell, focused && (!isTouch || isTouchDown));
                  if (focused) {
                    // check if is not in view
                    var rect       = this.getBoundingClientRect(),
                        parentRect = $container.children('.scrolling.container')[0].getBoundingClientRect();

                    if (rect.top - parentRect.top < 0 || rect.bottom > parentRect.bottom) {
                      this.scrollIntoView();
                    }
                  }
                });
              }
            }
          },

          refresh: function () {
            module.create.colorpicker();
          },

          bind: {
            events: function () {
              $container.on('mousedown' + eventNamespace, module.event.mousedown);
              $container.on('touchstart' + eventNamespace, module.event.mousedown);
              $container.on('mouseup' + eventNamespace, module.event.mouseup);
              $container.on('touchend' + eventNamespace, module.event.mouseup);
              $container.on('mouseover' + eventNamespace, module.event.mouseover);
              $container.on('mousemove' + eventNamespace, module.event.mousemove);
              if ($input.length) {
                $input.on('keydown' + eventNamespace, module.event.keydown);
              } else {
                $container.on('keydown' + eventNamespace, module.event.keydown);
              }
            }
          },

          unbind: {
            events: function () {
              $container.off(eventNamespace);
              if ($input.length) {
                $input.off(eventNamespace);
              }
            }
          },

          event: {
            mouseover: function (event) {
              var target = $(event.target);
              var color  = target.data(metadata.color);
              if (color) {
                module.set.focusColor(color);
              }
            },
            mousemove: function (event) {
              var mousedown = event.buttons === 1;
              if (mousedown) {
                var target = $(event.target);
                if (target.is('.hue.selection')) {
                  var rect = event.target.getBoundingClientRect();
                  var relY = event.pageY - rect.top;
                  module.set.hueFilter(relY / rect.height * 360);
                }
                if (target.is('.alpha.selection')) {
                  var rect = event.target.getBoundingClientRect();
                  var relX = event.pageX - rect.left;
                  module.set.alpha(relX / rect.width);
                }
                if (target.is('.color.selection')) {
                  var rect = event.target.getBoundingClientRect();
                  var relX = event.pageX - rect.left;
                  var relY = event.pageY - rect.top;

                  var color = module.helper.hsvToRgb(
                    module.get.hueFilter(),
                    100 * relX / rect.width,
                    100 * (1 - (relY / rect.height))
                  );
                  color.a   = module.get.color().a;
                  module.set.color(color);
                }
              }
            },
            mousedown: function (event) {
              if ($input.length) {
                //prevent the mousedown on the color picker causing the input to lose focus
                event.preventDefault();
              }
              var target = $(event.target);
              var color  = target.data(metadata.color);
              if (color) {
                module.set.focusColor(color);
              }
            },
            mouseup  : function (event) {
              //ensure input has focus so that it receives keydown events for colorpicker navigation
              if ($input.length) {
                $input.focus();
              } else {
                $container.focus();
              }
              event.preventDefault();
              event.stopPropagation();

              var originalTarget = $(event.target),
                  target         = originalTarget;

              var color;
              if (target.is('.color.selection')) {
                var rect = event.target.getBoundingClientRect();
                var relX = event.pageX - rect.left;
                var relY = event.pageY - rect.top;

                color   = module.helper.hsvToRgb(
                  module.get.hueFilter(),
                  100 * relX / rect.width,
                  100 * (1 - (relY / rect.height))
                );
                color.a = module.get.color().a;
                module.set.color(color);
              } else {
                if (!target.data(metadata.color)) {
                  target = target.parent();
                }
                color = target.data(metadata.color);
                if (color) {
                  module.set.color(color);
                }

                var hueFilter = originalTarget.data(metadata.hueFilter);
                if (hueFilter !== undefined) {
                  module.set.hueFilter(hueFilter);
                }
              }
            },
            keydown  : function (event) {
              if (event.keyCode === 27 || event.keyCode === 9) { //esc || tab
                module.popup('hide');
              }

              if (module.popup('is visible')) {
                if (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) { //arrow keys
                  var colors     = module.get.colors(),
                      colorCount = colors.length,
                      focusColor = module.get.focusColor() || module.get.color(),
                      index      = colors.indexOf(focusColor),
                      newIndex;

                  if (module.is.list()) {
                    if (event.keyCode === 38) {
                      newIndex = module.helper.wrapAround(index - 1, colorCount);
                    } else if (event.keyCode === 40) {
                      newIndex = module.helper.wrapAround(index + 1, colorCount);
                    }
                  } else if (module.is.grid()) {
                    var horizontalCount = Math.min(10, Math.ceil(Math.sqrt(colorCount)));

                    if (event.keyCode === 37) {
                      newIndex = module.helper.wrapAround(index - 1, colorCount);
                    } else if (event.keyCode === 39) {
                      newIndex = module.helper.wrapAround(index + 1, colorCount);
                    } else if (event.keyCode === 38) {
                      newIndex = index - horizontalCount;
                      if (newIndex < 0) {
                        newIndex = (Math.ceil(colorCount / horizontalCount) * horizontalCount) + Math.abs(newIndex);
                        while (newIndex >= colorCount) {
                          newIndex = newIndex - horizontalCount;
                        }
                      }
                    } else if (event.keyCode === 40) {
                      newIndex = index + horizontalCount;
                      if (newIndex >= colorCount) {
                        newIndex = newIndex % horizontalCount;
                      }
                    }
                  }
                  if (newIndex !== undefined) {
                    module.set.focusColor(colors[newIndex]);
                  }
                  //enter
                } else if (event.keyCode === 13) {
                  var color = module.get.focusColor();
                  if (color) {
                    module.set.color(color);
                  }
                  //disable form submission:
                  event.preventDefault();
                  event.stopPropagation();
                }
              }

              if (event.keyCode === 38 || event.keyCode === 40) { //arrow-up || arrow-down
                event.preventDefault(); //don't scroll
                module.popup('show');
              }
            }
          },

          get: {
            color     : function () {
              return $module.data(metadata.color) || null;
            },
            focusColor: function () {
              return $module.data(metadata.focusColor) || null;
            },
            isTouch   : function () {
              try {
                document.createEvent('TouchEvent');
                return true;
              } catch (e) {
                return false;
              }
            },
            hueFilter : function () {
              return $module.data(metadata.hueFilter) !== undefined ? $module.data(metadata.hueFilter) : null;
            },
            colors    : function () {
              if (allColors === undefined) {
                allColors = [];

                var colorCount = settings.colors.length;
                for (var i = 0; i < colorCount; i++) {
                  var cellColor = settings.colors[i];
                  if (cellColor.hasOwnProperty("r") && cellColor.hasOwnProperty("g") && cellColor.hasOwnProperty("b")) {
                    cellColor = {
                      name: cellColor.name || "",
                      r   : parseInt(cellColor.r),
                      g   : parseInt(cellColor.g),
                      b   : parseInt(cellColor.b)
                    };
                  } else if ((typeof cellColor === 'string' || cellColor instanceof String) && cellColor.startsWith("#")) {
                    cellColor = module.helper.hexToObject(cellColor);
                  } else {
                    // log unsupported color
                    cellColor = undefined;
                  }
                  if (cellColor) {
                    allColors.push($.extend({}, cellColor, module.helper.rgbToHSL(cellColor)));
                  }
                }
              }

              if (module.get.hueFilter() !== null) {
                var targetHue = module.get.hueFilter();
                colors        = allColors.filter(function (color) {
                  var lowerBounds = module.helper.wrapAround(targetHue - 15 / 360, 1),
                      upperBounds = module.helper.wrapAround(targetHue + 15 / 360, 1);
                  return lowerBounds > upperBounds ? color.h > lowerBounds || color.h < upperBounds : color.h > lowerBounds && color.h < upperBounds;
                });
              } else {
                colors = allColors;
              }

              return colors;
            }
          },

          has: {},

          is: {
            list: function () {
              return settings.type === "list";
            },
            grid: function () {
              return settings.type === "grid";
            },
            full: function () {
              return settings.type === "full";
            }
          },

          set: {
            hue         : function (hue) {
              var hslColor = module.helper.rgbToHSL(module.get.color());
              if (typeof hue === 'string') {
                if (hue.startsWith('+')) {
                  hue = hslColor.h + parseFloat(hue.substring(1));
                } else if (hue.startsWith('-')) {
                  hue = hslColor.h - parseFloat(hue.substring(1));
                } else {
                  hue = parseFloat(hue);
                }
              }
              console.log(hslColor);

              var color = module.helper.hslToRGB(
                module.helper.wrapAround(hue, 360),
                hslColor.s,
                hslColor.l
              );
              color.a   = module.get.color().a;
              module.set.color(color);
            },
            alpha       : function (alpha) {
              var color = module.get.color();
              color.a   = alpha;
              module.set.color(color);
            },
            color       : function (color, updateInput, fireChange) {
              updateInput = updateInput !== false;
              fireChange  = fireChange !== false;
              // TODO validate and sanitize color

              // TODO format color into text
              var text;
              if ($.isFunction(settings.format)) {
                text = settings.format.call(element, color);
              } else if (typeof settings.format === 'string' && module.formatter[settings.format]) {
                text = module.formatter[settings.format].call(element, color);
              } else {
                // log error = unsupported formatter
              }

              if (fireChange && settings.onChange.call(element, color, text) === false) {
                return false;
              }

              module.set.dataKeyValue(metadata.color, color);
              if (updateInput && $input.length) {
                $input.val(text);
                console.log($icon);
                if ($icon) {
                  console.log(module.formatter.hex(color));
                  $icon.css({"background-color": module.formatter.rgba(color)});
                }
              }
            },
            focusColor  : function (color) {
              // TODO validate and sanitize color
              if (module.set.dataKeyValue(metadata.focusColor, color)) {
                module.update.focus();
              }
            },
            hueFilter   : function (hue) {
              if (module.set.dataKeyValue(metadata.hueFilter, hue)) {
                if (module.is.full()) {
                  // recalculate color
                  module.set.hue(hue);
                  var backgroundColor = module.helper.hslToRGB(hue, 1, 0.5);

                  $container.find('.color.selection')
                    .css({"background-color": module.formatter.rgb(backgroundColor)});
                  $container.find('.alpha.selection')
                    .css({"background-color": module.formatter.rgb(backgroundColor)});
                } else {
                  module.reset.colors();
                  module.create.colorpicker();
                }
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

          reset: {
            colors: function () {
              colors = undefined;
            }
          },

          helper: {
            round: function (number, precision) {
              precision = precision || 2;
              return number ? Math.round((number + (1 / Math.pow(10, precision + 2))) * Math.pow(10, precision)) / Math.pow(10, precision) : 0;
            },

            wrapAround: function (number, bound) {
              return (number % bound + bound) % bound;
            },

            hexToObject: function (hex, alpha) {
              alpha = alpha === undefined ? 1 : alpha;

              var regexp = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
              var result = regexp.exec(hex);

              if (result) {
                var code = result[1];
                var len  = code.length / 3;
                var r    = parseInt(code.substring(0, len), 16);
                var g    = parseInt(code.substring(len, len * 2), 16);
                var b    = parseInt(code.substring(len * 2), 16);
                return {
                  r: r,
                  g: g,
                  b: b,
                  a: alpha
                };
              }
              return null;
            },

            hsvToRgb: function (h, s, v) {
              h = h / 360 * 6;
              s = s / 100;
              v = v / 100;

              var i   = Math.floor(h),
                  f   = h - i,
                  p   = v * (1 - s),
                  q   = v * (1 - f * s),
                  t   = v * (1 - (1 - f) * s),
                  mod = i % 6,
                  r   = [v, q, p, p, t, v][mod],
                  g   = [t, v, v, q, p, p][mod],
                  b   = [p, p, t, v, v, q][mod];

              return {r: r * 255, g: g * 255, b: b * 255};
            },

            hslToRGB: function (h, s, l) {
              var r, g, b;

              h = h / 360;

              function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
              }

              if (s === 0) {
                r = g = b = l; // achromatic
              }
              else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r     = hue2rgb(p, q, h + 1 / 3);
                g     = hue2rgb(p, q, h);
                b     = hue2rgb(p, q, h - 1 / 3);
              }

              return {r: r * 255, g: g * 255, b: b * 255};
            },

            rgbToHSL: function (color) {
              var r = color.r,
                  g = color.g,
                  b = color.b;

              r /= 255, g /= 255, b /= 255;
              var max     = Math.max(r, g, b), min = Math.min(r, g, b);
              var h, s, l = (max + min) / 2;

              if (max === min) {
                h = s = 0; // achromatic
              } else {
                var d = max - min;
                s     = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                  case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                  case g:
                    h = (b - r) / d + 2;
                    break;
                  case b:
                    h = (r - g) / d + 4;
                    break;
                }
                h /= 6;
              }

              return {h: h, s: s, l: l};
            }
          },

          formatter: {
            hex : function (color) {
              return ("#" +
                Math.round(color.r).toString(16).padStart(2, '0') +
                Math.round(color.g).toString(16).padStart(2, '0') +
                Math.round(color.b).toString(16).padStart(2, '0')).toUpperCase();
            },
            rgb : function (color) {
              return "rgba(" + Math.round(color.r) + ", " + Math.round(color.g) + ", " + Math.round(color.b) + ")";
            },
            rgba: function (color) {
              return "rgba(" + Math.round(color.r) + ", " + Math.round(color.g) + ", " + Math.round(color.b) + ", " + module.helper.round(color.a) + ")";
            }
          },

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

    type  : 'grid', // picker type, can be 'list', 'grid', or 'full'
                    // if picker type is 'list' or 'grid' the colors option must be set
    inline: false,  // create the colorpicker inline instead of inside a popup
    colors: [],      // if picker type is 'colors' define all available colors here
    on    : null,   // when to show the popup (defaults to 'focus' for input, 'click' for others)
    format: 'hex',  // format of the output color
                    // supported: 'hex', 'rgb', 'rgba', function(color) {}
    alpha : false,  // alpha supported

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
      grid       : 'ui equal width padded grid',
      column     : 'column',
      menu       : 'ui fluid vertical menu',
      item       : 'item',
      container  : 'scrolling container',
      table      : 'ui compact table',
      cell       : 'link',
      label      : 'ui label',
      activeCell : 'active',
      focusCell  : 'focus'
    },

    error: {
      popup          : 'UI Popup, a required component is not included in this page',
      emptyColors    : 'Colors option must be set, if type is set to \'grid\' or \'list\'',
      unsupportedType: 'Unsupported type defined',
      method         : 'The method you called is not defined'
    },

    metadata: {
      color     : 'color',
      focusColor: 'focusColor',
      hueFilter : 'hueFilter'
    },

    selector: {
      popup    : '.ui.popup',
      input    : 'input',
      icon     : '.input > .ui.label',
      activator: 'input',
      cell     : '.link'
    }

  };

})(jQuery, window, document);
