/*
 v2.2.0
 2017 Julian Garnier
 Released under the MIT license
*/
// Required for Meteor package, the use of window prevents export by Meteor
(function(window) {
    if (window.Package) {
      M = {};
    } else {
      window.M = {};
    }
  
    // Check for jQuery
    M.jQueryLoaded = !!window.jQuery;
  })(window);

  // AMD
  if (typeof define === 'function' && define.amd) {
    define('M', [], function() {
      return M;
    });
  
    // Common JS
  } else if (typeof exports !== 'undefined' && !exports.nodeType) {
    if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = M;
    }
    exports.default = M;
  }
  
  M.version = '1.0.0';

  M.keys = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    ARROW_UP: 38,
    ARROW_DOWN: 40
  };
  
  /**
   * TabPress Keydown handler
   */
  M.tabPressed = false;
  M.keyDown = false;
  let docHandleKeydown = function(e) {
    M.keyDown = true;
    if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
      M.tabPressed = true;
    }
  };
  let docHandleKeyup = function(e) {
    M.keyDown = false;
    if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
      M.tabPressed = false;
    }
  };
  let docHandleFocus = function(e) {
    if (M.keyDown) {
      document.body.classList.add('keyboard-focused');
    }
  };
  let docHandleBlur = function(e) {
    document.body.classList.remove('keyboard-focused');
  };
  document.addEventListener('keydown', docHandleKeydown, true);
  document.addEventListener('keyup', docHandleKeyup, true);
  document.addEventListener('focus', docHandleFocus, true);
  document.addEventListener('blur', docHandleBlur, true);
  
  /**
   * Initialize jQuery wrapper for plugin
   * @param {Class} plugin  javascript class
   * @param {string} pluginName  jQuery plugin name
   * @param {string} classRef  Class reference name
   */
  M.initializeJqueryWrapper = function(plugin, pluginName, classRef) {
    jQuery.fn[pluginName] = function(methodOrOptions) {
      // Call plugin method if valid method name is passed in
      if (plugin.prototype[methodOrOptions]) {
        let params = Array.prototype.slice.call(arguments, 1);
  
        // Getter methods
        if (methodOrOptions.slice(0, 3) === 'get') {
          let instance = this.first()[0][classRef];
          return instance[methodOrOptions].apply(instance, params);
        }
  
        // Void methods
        return this.each(function() {
          let instance = this[classRef];
          instance[methodOrOptions].apply(instance, params);
        });
  
        // Initialize plugin if options or no argument is passed in
      } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
        plugin.init(this, arguments[0]);
        return this;
      }
  
      // Return error if an unrecognized  method name is passed in
      jQuery.error(`Method ${methodOrOptions} does not exist on jQuery.${pluginName}`);
    };
  };
  
  /**
   * Generate approximated selector string for a jQuery object
   * @param {jQuery} obj  jQuery object to be parsed
   * @returns {string}
   */
  M.objectSelectorString = function(obj) {
    let tagStr = obj.prop('tagName') || '';
    let idStr = obj.attr('id') || '';
    let classStr = obj.attr('class') || '';
    return (tagStr + idStr + classStr).replace(/\s/g, '');
  };
  
  // Unique Random ID
  M.guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
  })();
  
  /**
   * Escapes hash from special characters
   * @param {string} hash  String returned from this.hash
   * @returns {string}
   */
  M.escapeHash = function(hash) {
    return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, '\\$1');
  };
  
  /**
   * Get closest ancestor that satisfies the condition
   * @param {Element} el  Element to find ancestors on
   * @param {Function} condition  Function that given an ancestor element returns true or false
   * @returns {Element} Return closest ancestor or null if none satisfies the condition
   */
  M.getClosestAncestor = function(el, condition) {
    let ancestor = el.parentNode;
    while (ancestor !== null && !$(ancestor).is(document)) {
      if (condition(ancestor)) {
        return ancestor;
      }
      ancestor = ancestor.parentNode;
    }
    return null;
  };
  
  M.elementOrParentIsFixed = function(element) {
    let $element = $(element);
    let $checkElements = $element.add($element.parents());
    let isFixed = false;
    $checkElements.each(function() {
      if ($(this).css('position') === 'fixed') {
        isFixed = true;
        return false;
      }
    });
    return isFixed;
  };
  
  /**
   * @typedef {Object} Edges
   * @property {Boolean} top  If the top edge was exceeded
   * @property {Boolean} right  If the right edge was exceeded
   * @property {Boolean} bottom  If the bottom edge was exceeded
   * @property {Boolean} left  If the left edge was exceeded
   */
  
  /**
   * @typedef {Object} Bounding
   * @property {Number} left  left offset coordinate
   * @property {Number} top  top offset coordinate
   * @property {Number} width
   * @property {Number} height
   */
  
  /**
   * Escapes hash from special characters
   * @param {Element} container  Container element that acts as the boundary
   * @param {Bounding} bounding  element bounding that is being checked
   * @param {Number} offset  offset from edge that counts as exceeding
   * @returns {Edges}
   */
  M.checkWithinContainer = function(container, bounding, offset) {
    let edges = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };
  
    let containerRect = container.getBoundingClientRect();
    // If body element is smaller than viewport, use viewport height instead.
    let containerBottom =
      container === document.body
        ? Math.max(containerRect.bottom, window.innerHeight)
        : containerRect.bottom;
  
    let scrollLeft = container.scrollLeft;
    let scrollTop = container.scrollTop;
  
    let scrolledX = bounding.left - scrollLeft;
    let scrolledY = bounding.top - scrollTop;
  
    // Check for container and viewport for each edge
    if (scrolledX < containerRect.left + offset || scrolledX < offset) {
      edges.left = true;
    }
  
    if (
      scrolledX + bounding.width > containerRect.right - offset ||
      scrolledX + bounding.width > window.innerWidth - offset
    ) {
      edges.right = true;
    }
  
    if (scrolledY < containerRect.top + offset || scrolledY < offset) {
      edges.top = true;
    }
  
    if (
      scrolledY + bounding.height > containerBottom - offset ||
      scrolledY + bounding.height > window.innerHeight - offset
    ) {
      edges.bottom = true;
    }
  
    return edges;
  };
  
  M.checkPossibleAlignments = function(el, container, bounding, offset) {
    let canAlign = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      spaceOnTop: null,
      spaceOnRight: null,
      spaceOnBottom: null,
      spaceOnLeft: null
    };
  
    let containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
    let containerRect = container.getBoundingClientRect();
    let containerHeight = Math.min(containerRect.height, window.innerHeight);
    let containerWidth = Math.min(containerRect.width, window.innerWidth);
    let elOffsetRect = el.getBoundingClientRect();
  
    let scrollLeft = container.scrollLeft;
    let scrollTop = container.scrollTop;
  
    let scrolledX = bounding.left - scrollLeft;
    let scrolledYTopEdge = bounding.top - scrollTop;
    let scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;
  
    // Check for container and viewport for left
    canAlign.spaceOnRight = !containerAllowsOverflow
      ? containerWidth - (scrolledX + bounding.width)
      : window.innerWidth - (elOffsetRect.left + bounding.width);
    if (canAlign.spaceOnRight < 0) {
      canAlign.left = false;
    }
  
    // Check for container and viewport for Right
    canAlign.spaceOnLeft = !containerAllowsOverflow
      ? scrolledX - bounding.width + elOffsetRect.width
      : elOffsetRect.right - bounding.width;
    if (canAlign.spaceOnLeft < 0) {
      canAlign.right = false;
    }
  
    // Check for container and viewport for Top
    canAlign.spaceOnBottom = !containerAllowsOverflow
      ? containerHeight - (scrolledYTopEdge + bounding.height + offset)
      : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
    if (canAlign.spaceOnBottom < 0) {
      canAlign.top = false;
    }
  
    // Check for container and viewport for Bottom
    canAlign.spaceOnTop = !containerAllowsOverflow
      ? scrolledYBottomEdge - (bounding.height - offset)
      : elOffsetRect.bottom - (bounding.height + offset);
    if (canAlign.spaceOnTop < 0) {
      canAlign.bottom = false;
    }
  
    return canAlign;
  };
  
  M.getOverflowParent = function(element) {
    if (element == null) {
      return null;
    }
  
    if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
      return element;
    }
  
    return M.getOverflowParent(element.parentElement);
  };
  
  /**
   * Gets id of component from a trigger
   * @param {Element} trigger  trigger
   * @returns {string}
   */
  M.getIdFromTrigger = function(trigger) {
    let id = trigger.getAttribute('data-target');
    if (!id) {
      id = trigger.getAttribute('href');
      if (id) {
        id = id.slice(1);
      } else {
        id = '';
      }
    }
    return id;
  };
  
  /**
   * Multi browser support for document scroll top
   * @returns {Number}
   */
  M.getDocumentScrollTop = function() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  };
  
  /**
   * Multi browser support for document scroll left
   * @returns {Number}
   */
  M.getDocumentScrollLeft = function() {
    return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  };
  
  /**
   * @typedef {Object} Edges
   * @property {Boolean} top  If the top edge was exceeded
   * @property {Boolean} right  If the right edge was exceeded
   * @property {Boolean} bottom  If the bottom edge was exceeded
   * @property {Boolean} left  If the left edge was exceeded
   */
  
  /**
   * @typedef {Object} Bounding
   * @property {Number} left  left offset coordinate
   * @property {Number} top  top offset coordinate
   * @property {Number} width
   * @property {Number} height
   */
  
  /**
   * Get time in ms
   * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
   * @type {function}
   * @return {number}
   */
  let getTime =
    Date.now ||
    function() {
      return new Date().getTime();
    };
  
  /**
   * Returns a function, that, when invoked, will only be triggered at most once
   * during a given window of time. Normally, the throttled function will run
   * as much as it can, without ever going more than once per `wait` duration;
   * but if you'd like to disable the execution on the leading edge, pass
   * `{leading: false}`. To disable execution on the trailing edge, ditto.
   * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
   * @param {function} func
   * @param {number} wait
   * @param {Object=} options
   * @returns {Function}
   */
  M.throttle = function(func, wait, options) {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    options || (options = {});
    let later = function() {
      previous = options.leading === false ? 0 : getTime();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      let now = getTime();
      if (!previous && options.leading === false) previous = now;
      let remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
class Component {
    /**
     * Generic constructor for all components
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(classDef, el, options) {
      // Display error if el is valid HTML Element
      if (!(el instanceof Element)) {
        console.error(Error(el + ' is not an HTML Element'));
      }
  
      // If exists, destroy and reinitialize in child
      let ins = classDef.getInstance(el);
      if (!!ins) {
        ins.destroy();
      }
  
      this.el = el;
      this.$el = $(el);
    }
  
    /**
     * Initializes components
     * @param {class} classDef
     * @param {Element | NodeList | jQuery} els
     * @param {Object} options
     */
    static init(classDef, els, options) {
      let instances = null;
      if (els instanceof Element) {
        instances = new classDef(els, options);
      } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
        let instancesArr = [];
        for (let i = 0; i < els.length; i++) {
          instancesArr.push(new classDef(els[i], options));
        }
        instances = instancesArr;
      }
  
      return instances;
    }
  }
  (function($) {
    'use strict';
  
    let _defaults = {
      duration: 200, // ms
      dist: -100, // zoom scale TODO: make this more intuitive as an option
      shift: 0, // spacing for center image
      padding: 0, // Padding between non center items
      numVisible: 5, // Number of visible items in swiper
      fullWidth: false, // Change to full width styles
      indicators: false, // Toggle indicators
      noWrap: false, // Don't wrap around and cycle through items.
      onCycleTo: null // Callback for when a new slide is cycled to.
    };
  
    /**
     * @class
     *
     */
    class swiper extends Component {
      /**
       * Construct swiper instance
       * @constructor
       * @param {Element} el
       * @param {Object} options
       */
      constructor(el, options) {
        super(swiper, el, options);
  
        this.el.M_swiper = this;
  
        /**
         * Options for the swiper
         * @member swiper#options
         * @prop {Number} duration
         * @prop {Number} dist
         * @prop {Number} shift
         * @prop {Number} padding
         * @prop {Number} numVisible
         * @prop {Boolean} fullWidth
         * @prop {Boolean} indicators
         * @prop {Boolean} noWrap
         * @prop {Function} onCycleTo
         */
        this.options = $.extend({}, swiper.defaults, options);
  
        // Setup
        this.hasMultipleSlides = this.$el.find('.swiper-item').length > 1;
        this.showIndicators = this.options.indicators && this.hasMultipleSlides;
        this.noWrap = this.options.noWrap || !this.hasMultipleSlides;
        this.pressed = false;
        this.dragged = false;
        this.offset = this.target = 0;
        this.images = [];
        this.itemWidth = this.$el
          .find('.swiper-item')
          .first()
          .innerWidth();
        this.itemHeight = this.$el
          .find('.swiper-item')
          .first()
          .innerHeight();
        this.dim = this.itemWidth * 2 + this.options.padding || 1; // Make sure dim is non zero for divisions.
        this._autoScrollBound = this._autoScroll.bind(this);
        this._trackBound = this._track.bind(this);
  
        // Full Width swiper setup
        if (this.options.fullWidth) {
          this.options.dist = 0;
          this._setswiperHeight();
  
          // Offset fixed items when indicators.
          if (this.showIndicators) {
            this.$el.find('.swiper-fixed-item').addClass('with-indicators');
          }
        }
  
        // Iterate through slides
        this.$indicators = $('<ul class="indicators"></ul>');
        this.$el.find('.swiper-item').each((i,el) => {
          this.images.push(el);
          if (this.showIndicators) {
            let $indicator = $('<li class="indicator-item"></li>');
  
            // Add active to first by default.
            if (i === 0) {
              $indicator[0].classList.add('active');
            }
  
            this.$indicators.append($indicator);
          }
        });
        if (this.showIndicators) {
          this.$el.append(this.$indicators);
        }
        this.count = this.images.length;
  
        // Cap numVisible at count
        this.options.numVisible = Math.min(this.count, this.options.numVisible);
  
        // Setup cross browser string
        this.xform = 'transform';
        ['webkit', 'Moz', 'O', 'ms'].every((prefix) => {
          var e = prefix + 'Transform';
          if (typeof document.body.style[e] !== 'undefined') {
            this.xform = e;
            return false;
          }
          return true;
        });
  
        this._setupEventHandlers();
        this._scroll(this.offset);
      }
  
      static get defaults() {
        return _defaults;
      }
  
      static init(els, options) {
        return super.init(this, els, options);
      }
  
      /**
       * Get Instance
       */
      static getInstance(el) {
        let domElem = !!el.jquery ? el[0] : el;
        return domElem.M_swiper;
      }
  
      /**
       * Teardown component
       */
      destroy() {
        this._removeEventHandlers();
        this.el.M_swiper = undefined;
      }
  
      /**
       * Setup Event Handlers
       */
      _setupEventHandlers() {
        this._handleswiperTapBound = this._handleswiperTap.bind(this);
        this._handleswiperDragBound = this._handleswiperDrag.bind(this);
        this._handleswiperReleaseBound = this._handleswiperRelease.bind(this);
        this._handleswiperClickBound = this._handleswiperClick.bind(this);
  
        if (typeof window.ontouchstart !== 'undefined') {
          this.el.addEventListener('touchstart', this._handleswiperTapBound);
          this.el.addEventListener('touchmove', this._handleswiperDragBound);
          this.el.addEventListener('touchend', this._handleswiperReleaseBound);
        }
  
        this.el.addEventListener('mousedown', this._handleswiperTapBound);
        this.el.addEventListener('mousemove', this._handleswiperDragBound);
        this.el.addEventListener('mouseup', this._handleswiperReleaseBound);
        this.el.addEventListener('mouseleave', this._handleswiperReleaseBound);
        this.el.addEventListener('click', this._handleswiperClickBound);
  
        if (this.showIndicators && this.$indicators) {
          this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
          this.$indicators.find('.indicator-item').each((el, i) => {
            el.addEventListener('click', this._handleIndicatorClickBound);
          });
        }
  
        // Resize
        let throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);
  
        window.addEventListener('resize', this._handleThrottledResizeBound);
      }
  
      /**
       * Remove Event Handlers
       */
      _removeEventHandlers() {
        if (typeof window.ontouchstart !== 'undefined') {
          this.el.removeEventListener('touchstart', this._handleswiperTapBound);
          this.el.removeEventListener('touchmove', this._handleswiperDragBound);
          this.el.removeEventListener('touchend', this._handleswiperReleaseBound);
        }
        this.el.removeEventListener('mousedown', this._handleswiperTapBound);
        this.el.removeEventListener('mousemove', this._handleswiperDragBound);
        this.el.removeEventListener('mouseup', this._handleswiperReleaseBound);
        this.el.removeEventListener('mouseleave', this._handleswiperReleaseBound);
        this.el.removeEventListener('click', this._handleswiperClickBound);
  
        if (this.showIndicators && this.$indicators) {
          this.$indicators.find('.indicator-item').each((el, i) => {
            el.removeEventListener('click', this._handleIndicatorClickBound);
          });
        }
  
        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }
  
      /**
       * Handle swiper Tap
       * @param {Event} e
       */
      _handleswiperTap(e) {
        // Fixes firefox draggable image bug
        if (e.type === 'mousedown' && $(e.target).is('img')) {
          e.preventDefault();
        }
        this.pressed = true;
        this.dragged = false;
        this.verticalDragged = false;
        this.reference = this._xpos(e);
        this.referenceY = this._ypos(e);
  
        this.velocity = this.amplitude = 0;
        this.frame = this.offset;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(this._trackBound, 100);
      }
  
      /**
       * Handle swiper Drag
       * @param {Event} e
       */
      _handleswiperDrag(e) {
        let x, y, delta, deltaY;
        if (this.pressed) {
          x = this._xpos(e);
          y = this._ypos(e);
          delta = this.reference - x;
          deltaY = Math.abs(this.referenceY - y);
          if (deltaY < 30 && !this.verticalDragged) {
            // If vertical scrolling don't allow dragging.
            if (delta > 2 || delta < -2) {
              this.dragged = true;
              this.reference = x;
              this._scroll(this.offset + delta);
            }
          } else if (this.dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          } else {
            // Vertical scrolling.
            this.verticalDragged = true;
          }
        }
  
        if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
  
      /**
       * Handle swiper Release
       * @param {Event} e
       */
      _handleswiperRelease(e) {
        if (this.pressed) {
          this.pressed = false;
        } else {
          return;
        }
  
        clearInterval(this.ticker);
        this.target = this.offset;
        if (this.velocity > 10 || this.velocity < -10) {
          this.amplitude = 0.9 * this.velocity;
          this.target = this.offset + this.amplitude;
        }
        this.target = Math.round(this.target / this.dim) * this.dim;
  
        // No wrap of items.
        if (this.noWrap) {
          if (this.target >= this.dim * (this.count - 1)) {
            this.target = this.dim * (this.count - 1);
          } else if (this.target < 0) {
            this.target = 0;
          }
        }
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);
  
        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }
  
      /**
       * Handle swiper CLick
       * @param {Event} e
       */
      _handleswiperClick(e) {
        // Disable clicks if swiper was dragged.
        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        } else if (!this.options.fullWidth) {
          let clickedIndex = $(e.target)
            .closest('.swiper-item')
            .index();
          let diff = this._wrap(this.center) - clickedIndex;
  
          // Disable clicks if swiper was shifted by click
          if (diff !== 0) {
            e.preventDefault();
            e.stopPropagation();
          }
          this._cycleTo(clickedIndex);
        }
      }
  
      /**
       * Handle Indicator CLick
       * @param {Event} e
       */
      _handleIndicatorClick(e) {
        e.stopPropagation();
  
        let indicator = $(e.target).closest('.indicator-item');
        if (indicator.length) {
          this._cycleTo(indicator.index());
        }
      }
  
      /**
       * Handle Throttle Resize
       * @param {Event} e
       */
      _handleResize(e) {
        if (this.options.fullWidth) {
          this.itemWidth = this.$el
            .find('.swiper-item')
            .first()
            .innerWidth();
          this.imageHeight = this.$el.find('.swiper-item.active').height();
          this.dim = this.itemWidth * 2 + this.options.padding;
          this.offset = this.center * 2 * this.itemWidth;
          this.target = this.offset;
          this._setswiperHeight(true);
        } else {
          this._scroll();
        }
      }
  
      /**
       * Set swiper height based on first slide
       * @param {Booleam} imageOnly - true for image slides
       */
      _setswiperHeight() {
        /*let firstSlide = this.$el.find('.swiper-item.active').length
          ? this.$el.find('.swiper-item.active').first()
          : this.$el.find('.swiper-item').first();
          let slideHeight = firstSlide.height();
          this.$el.css('height', this.$el.parent().parent().parent().height() + 'px');*/
      }
  
      /**
       * Get x position from event
       * @param {Event} e
       */
      _xpos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }
  
        // mouse event
        return e.clientX;
      }
  
      /**
       * Get y position from event
       * @param {Event} e
       */
      _ypos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientY;
        }
  
        // mouse event
        return e.clientY;
      }
  
      /**
       * Wrap index
       * @param {Number} x
       */
      _wrap(x) {
        return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + x % this.count) : x;
      }
  
      /**
       * Tracks scrolling information
       */
      _track() {
        let now, elapsed, delta, v;
  
        now = Date.now();
        elapsed = now - this.timestamp;
        this.timestamp = now;
        delta = this.offset - this.frame;
        this.frame = this.offset;
  
        v = 1000 * delta / (1 + elapsed);
        this.velocity = 0.8 * v + 0.2 * this.velocity;
      }
  
      /**
       * Auto scrolls to nearest swiper item.
       */
      _autoScroll() {
        let elapsed, delta;
  
        if (this.amplitude) {
          elapsed = Date.now() - this.timestamp;
          delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
          if (delta > 2 || delta < -2) {
            this._scroll(this.target - delta);
            requestAnimationFrame(this._autoScrollBound);
          } else {
            this._scroll(this.target);
          }
        }
      }
  
      /**
       * Scroll to target
       * @param {Number} x
       */
      _scroll(x) {
        // Track scrolling state
        if (!this.$el.hasClass('scrolling')) {
          this.el.classList.add('scrolling');
        }
        if (this.scrollingTimeout != null) {
          window.clearTimeout(this.scrollingTimeout);
        }
        this.scrollingTimeout = window.setTimeout(() => {
          this.$el.removeClass('scrolling');
        }, this.options.duration);
  
        // Start actual scroll
        let i,
          half,
          delta,
          dir,
          tween,
          el,
          alignment,
          zTranslation,
          tweenedOpacity,
          centerTweenedOpacity;
        let lastCenter = this.center;
        let numVisibleOffset = 1 / this.options.numVisible;
  
        this.offset = typeof x === 'number' ? x : this.offset;
        this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
        delta = this.offset - this.center * this.dim;
        dir = delta < 0 ? 1 : -1;
        tween = -dir * delta * 2 / this.dim;
        half = this.count >> 1;
  
        if (this.options.fullWidth) {
          alignment = 'translateX(0)';
          centerTweenedOpacity = 1;
        } else {
          alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
          alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
          centerTweenedOpacity = 1 - numVisibleOffset * tween;
        }
  
        // Set indicator active
        if (this.showIndicators) {
          let diff = this.center % this.count;
          let activeIndicator = this.$indicators.find('.indicator-item.active');
          if (activeIndicator.index() !== diff) {
            activeIndicator.removeClass('active');
            this.$indicators
              .find('.indicator-item')
              .eq(diff)[0]
              .classList.add('active');
          }
        }
  
        // center
        // Don't show wrapped items.
        if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
          el = this.images[this._wrap(this.center)];
  
          // Add active class to center item.
          if (!$(el).hasClass('active')) {
            this.$el.find('.swiper-item').removeClass('active');
            el.classList.add('active');
          }
          let transformString = `${alignment} translateX(${-delta / 2}px) translateX(${dir *
            this.options.shift *
            tween *
            i}px) translateZ(${this.options.dist * tween}px)`;
          this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
        }
  
        for (i = 1; i <= half; ++i) {
          // right side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 + tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center + i < this.count) {
            el = this.images[this._wrap(this.center + i)];
            let transformString = `${alignment} translateX(${this.options.shift +
              (this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
            this._updateItemStyle(el, tweenedOpacity, -i, transformString);
          }
  
          // left side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 - tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center - i >= 0) {
            el = this.images[this._wrap(this.center - i)];
            let transformString = `${alignment} translateX(${-this.options.shift +
              (-this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
            this._updateItemStyle(el, tweenedOpacity, -i, transformString);
          }
        }
  
        // center
        // Don't show wrapped items.
        if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
          el = this.images[this._wrap(this.center)];
          let transformString = `${alignment} translateX(${-delta / 2}px) translateX(${dir *
            this.options.shift *
            tween}px) translateZ(${this.options.dist * tween}px)`;
          this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
        }
  
        // onCycleTo callback
        let $currItem = this.$el.find('.swiper-item').eq(this._wrap(this.center));
        if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
          this.options.onCycleTo.call(this, $currItem[0], this.dragged);
        }
  
        // One time callback
        if (typeof this.oneTimeCallback === 'function') {
          this.oneTimeCallback.call(this, $currItem[0], this.dragged);
          this.oneTimeCallback = null;
        }
      }
  
      /**
       * Cycle to target
       * @param {Element} el
       * @param {Number} opacity
       * @param {Number} zIndex
       * @param {String} transform
       */
      _updateItemStyle(el, opacity, zIndex, transform) {
        el.style[this.xform] = transform;
        el.style.zIndex = zIndex;
        el.style.opacity = opacity;
        el.style.visibility = 'visible';
      }
  
      /**
       * Cycle to target
       * @param {Number} n
       * @param {Function} callback
       */
      _cycleTo(n, callback) {
        let diff = this.center % this.count - n;
  
        // Account for wraparound.
        if (!this.noWrap) {
          if (diff < 0) {
            if (Math.abs(diff + this.count) < Math.abs(diff)) {
              diff += this.count;
            }
          } else if (diff > 0) {
            if (Math.abs(diff - this.count) < diff) {
              diff -= this.count;
            }
          }
        }
  
        this.target = this.dim * Math.round(this.offset / this.dim);
        // Next
        if (diff < 0) {
          this.target += this.dim * Math.abs(diff);
  
          // Prev
        } else if (diff > 0) {
          this.target -= this.dim * diff;
        }
  
        // Set one time callback
        if (typeof callback === 'function') {
          this.oneTimeCallback = callback;
        }
  
        // Scroll
        if (this.offset !== this.target) {
          this.amplitude = this.target - this.offset;
          this.timestamp = Date.now();
          requestAnimationFrame(this._autoScrollBound);
        }
      }
  
      /**
       * Cycle to next item
       * @param {Number} [n]
       */
      next(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }
  
        let index = this.center + n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }
  
          index = this._wrap(index);
        }
        this._cycleTo(index);
      }
  
      /**
       * Cycle to previous item
       * @param {Number} [n]
       */
      prev(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }
  
        let index = this.center - n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }
  
          index = this._wrap(index);
        }
  
        this._cycleTo(index);
      }
  
      /**
       * Cycle to nth item
       * @param {Number} [n]
       * @param {Function} callback
       */
      set(n, callback) {
        if (n === undefined || isNaN(n)) {
          n = 0;
        }
  
        if (n > this.count || n < 0) {
          if (this.noWrap) {
            return;
          }
  
          n = this._wrap(n);
        }
  
        this._cycleTo(n, callback);
      }
    }
  
    M.swiper = swiper;
  
    if (M.jQueryLoaded) {
      M.initializeJqueryWrapper(swiper, 'swiper', 'M_swiper');
    }
  })(jQuery);
  
  (function($) {
      'use strict';
    
      let _defaults = {
        duration: 300,
        onShow: null,
        swipeable: false,
        responsiveThreshold: Infinity // breakpoint for swipeable
      };
    
      /**
       * @class
       *
       */
      class Tabs extends Component {
        /**
         * Construct Tabs instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        constructor(el, options) {
          super(Tabs, el, options);
    
          this.el.M_Tabs = this;
    
          /**
           * Options for the Tabs
           * @member Tabs#options
           * @prop {Number} duration
           * @prop {Function} onShow
           * @prop {Boolean} swipeable
           * @prop {Number} responsiveThreshold
           */
          this.options = $.extend({}, Tabs.defaults, options);
    
          // Setup
          this.$tabLinks = this.$el.children('li.tab').children('a');
          this.index = 0;
          this._setupActiveTabLink();
    
          // Setup tabs content
          if (this.options.swipeable) {
            this._setupSwipeableTabs();
          } else {
            this._setupNormalTabs();
          }
    
          // Setup tabs indicator after content to ensure accurate widths
          this._setTabsAndTabWidth();
          this._createIndicator();
    
          this._setupEventHandlers();
        }
    
        static get defaults() {
          return _defaults;
        }
    
        static init(els, options) {
          return super.init(this, els, options);
        }
    
        /**
         * Get Instance
         */
        static getInstance(el) {
          let domElem = !!el.jquery ? el[0] : el;
          return domElem.M_Tabs;
        }
    
        /**
         * Teardown component
         */
        destroy() {
          this._removeEventHandlers();
          this._indicator.parentNode.removeChild(this._indicator);
    
          if (this.options.swipeable) {
            this._teardownSwipeableTabs();
          } else {
            this._teardownNormalTabs();
          }
    
          this.$el[0].M_Tabs = undefined;
        }
    
        /**
         * Setup Event Handlers
         */
        _setupEventHandlers() {
          this._handleWindowResizeBound = this._handleWindowResize.bind(this);
          window.addEventListener('resize', this._handleWindowResizeBound);
    
          this._handleTabClickBound = this._handleTabClick.bind(this);
          this.el.addEventListener('click', this._handleTabClickBound);
        }
    
        /**
         * Remove Event Handlers
         */
        _removeEventHandlers() {
          window.removeEventListener('resize', this._handleWindowResizeBound);
          this.el.removeEventListener('click', this._handleTabClickBound);
        }
    
        /**
         * Handle window Resize
         */
        _handleWindowResize() {
          this._setTabsAndTabWidth();
        }
    
        /**
         * Handle tab click
         * @param {Event} e
         */
        _handleTabClick(e) {
          let tab = $(e.target).closest('li.tab');
          let tabLink = $(e.target).closest('a');
    
          // Handle click on tab link only
          if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
            return;
          }
    
          if (tab.hasClass('disabled')) {
            e.preventDefault();
            return;
          }
    
          // Act as regular link if target attribute is specified.
          if (!!tabLink.attr('target')) {
            return;
          }
    
          // Make the old tab inactive.
          this.$activeTabLink.removeClass('active');
          let $oldContent = this.$content;
    
          // Update the variables with the new link and content
          this.$activeTabLink = tabLink;
          this.$content = $(M.escapeHash(tabLink[0].hash));
          this.$tabLinks = this.$el.children('li.tab').children('a');
    
          // Make the tab active.
          this.$activeTabLink.addClass('active');
          let prevIndex = this.index;
          this.index = Math.max(this.$tabLinks.index(tabLink), 0);
    
          // Swap content
          if (this.options.swipeable) {
            if (this._tabsswiper) {
              this._tabsswiper.set(this.index, () => {
                if (typeof this.options.onShow === 'function') {
                  this.options.onShow.call(this, this.$content[0]);
                }
              });
            }
          } else {
            if (this.$content.length) {
              this.$content[0].style.display = 'block';
              this.$content.addClass('active');
              if (typeof this.options.onShow === 'function') {
                this.options.onShow.call(this, this.$content[0]);
              }
    
              if ($oldContent.length && !$oldContent.is(this.$content)) {
                $oldContent[0].style.display = 'none';
                $oldContent.removeClass('active');
              }
            }
          }
    
          // Update widths after content is swapped (scrollbar bugfix)
          this._setTabsAndTabWidth();
    
          // Update indicator
          this._animateIndicator(prevIndex);

          if (typeof this.options.onTabClick === 'function') {
            this.options.onTabClick.call(this, tabLink);
          }
          // Prevent the anchor's default click action
          e.preventDefault();
        }
    
        /**
         * Generate elements for tab indicator.
         */
        _createIndicator() {
          let indicator = document.createElement('li');
          indicator.classList.add('indicator');
    
          this.el.appendChild(indicator);
          this._indicator = indicator;
    
          setTimeout(() => {
            this._indicator.style.width = (100/this.$tabLinks.length) + '%';
          }, 0);
        }

        /**
         * Setup first active tab link.
         */
        _setupActiveTabLink() {
          // If the location.hash matches one of the links, use that as the active tab.
          this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));
    
          // If no match is found, use the first link or any with class 'active' as the initial active tab.
          if (this.$activeTabLink.length === 0) {
            this.$activeTabLink = this.$el
              .children('li.tab')
              .children('a.active')
              .first();
          }
          if (this.$activeTabLink.length === 0) {
            this.$activeTabLink = this.$el
              .children('li.tab')
              .children('a')
              .first();
          }
    
          this.$tabLinks.removeClass('active');
          this.$activeTabLink[0].classList.add('active');
    
          this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);
    
          if (this.$activeTabLink.length) {
            this.$content = $(M.escapeHash(this.$activeTabLink[0].hash));
            this.$content.addClass('active');
          }
        }
    
        /**
         * Setup swipeable tabs
         */
        _setupSwipeableTabs() {
          // Change swipeable according to responsive threshold
          if (window.innerWidth > this.options.responsiveThreshold) {
            this.options.swipeable = false;
          }

          let $tabsContent = $();
          this.$tabLinks.each((i,link) => {
            let $currContent = $(M.escapeHash(link.hash));
            $currContent.addClass('swiper-item');
            $tabsContent = $tabsContent.add($currContent);
          });
    
          let $tabsWrapper = $('<div class="tabs-content swiper swiper-slider"></div>');
          $tabsContent.first().before($tabsWrapper);
          $tabsWrapper.append($tabsContent);
          $tabsContent[0].style.display = '';
    
          // Keep active tab index to set initial swiper slide
          let activeTabIndex = this.$activeTabLink.closest('.tab').index();
    
          this._tabsswiper = M.swiper.init($tabsWrapper[0], {
            fullWidth: true,
            noWrap: true,
            onCycleTo: (item) => {
              let prevIndex = this.index;
              this.index = $(item).index();
              this.$activeTabLink.removeClass('active');
              this.$activeTabLink = this.$tabLinks.eq(this.index);
              this.$activeTabLink.addClass('active');
              this._animateIndicator(prevIndex);
              if (typeof this.options.onShow === 'function') {
                this.options.onShow.call(this, this.$content[0]);
              }
            }
          });
    
          // Set initial swiper slide to active tab
          this._tabsswiper.set(activeTabIndex);
        }
    
        /**
         * Teardown normal tabs.
         */
        _teardownSwipeableTabs() {
          let $tabsWrapper = this._tabsswiper.$el;
          this._tabsswiper.destroy();
    
          // Unwrap
          $tabsWrapper.after($tabsWrapper.children());
          $tabsWrapper.remove();
        }

        /**
         * Setup normal tabs.
         */
        _setupNormalTabs() {
          // Hide Tabs Content
          this.$tabLinks.not(this.$activeTabLink).each((i,link) => {
            if (!!link.hash) {
              let $currContent = $(M.escapeHash(link.hash));
              if ($currContent.length) {
                $currContent[0].style.display = 'none';
              }
            }
          });
        }
    
        /**
         * Teardown normal tabs.
         */
        _teardownNormalTabs() {
          // show Tabs Content
          this.$tabLinks.each((i,link) => {
            if (!!link.hash) {
              let $currContent = $(M.escapeHash(link.hash));
              if ($currContent.length) {
                $currContent[0].style.display = '';
              }
            }
          });
        }

        /**
         * set tabs and tab width
         */
        _setTabsAndTabWidth() {
          this.tabsWidth = this.$el.width();
          this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
        }
    
        /**
         * Finds right attribute for indicator based on active tab.
         * @param {cash} el
         */
        _calcRightPos(el) {
          return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
        }
    
        /**
         * Finds left attribute for indicator based on active tab.
         * @param {cash} el
         */
        _calcLeftPos(el) {
          return Math.floor(el.position().left);
        }
    
        updateTabIndicator() {
          this._setTabsAndTabWidth();
          this._animateIndicator(this.index);
        }

        /**
         * Animates Indicator to active tab.
         * @param {Number} prevIndex
         */
        _animateIndicator(prevIndex) {
          let leftDelay = 0,
            rightDelay = 0;

          if (this.index - prevIndex >= 0) {
            leftDelay = 90;
          } else {
            rightDelay = 90;
          }

          // Animate
          if(this._indicator)this._indicator.style.transform = 'translateX('+(this.index*100)+'%)';
        }
    
        /**
         * Select tab.
         * @param {String} tabId
         */
        select(tabId) {
          let tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
          if (tab.length) {
            tab.trigger('click');
          }
        }
      }

      M.Tabs = Tabs;

      if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
      }
    })(jQuery);