"use strict";

// ==UserScript==
// @name wtdwtf emoji inverter
// @namespace WTDWTF
// @grant none
// @match https://what.thedailywtf.com/*
// @match http://what.thedailywtf.com/*
// @description inverts emojis for dark themes
// @author hungrier
// @version 1.5
// ==/UserScript==
(function() {

  // TODO remove jquery

  var hoverms = 1000;
  var storageKey = 'wtdwtf-dark-emojicons';
  var emojiClassPrefix = "emoji--";
  var defaultEmojis = [
    "arrows_clockwise", "back", "copyright", "curly_loop", "currency_exchange", "dark_sunglasses", "eight_pointed_black_star", "end", 
    "eyeglasses", "headdesk", "heavy_check_mark", "heavy_division_sign", "heavy_dollar_sign", "heavy_minus_sign", "heavy_multiplication_x", 
    "heavy_plus_sign", "magnets_having_sex", "moving_goal_post", "mu", "musical_note", "notes", "on", "onion", "pen_fountain", "pendant", 
    "registered", "soon", "tm", "top", "wavy_dash", "whoosh"
  ];

  var storage = localStorage || {
    setItem: function setItem() {
      return null;
    },
    getItem: function getItem() {
      return null;
    }
  };

  var loadInvisibles = function loadInvisibles() {
    var keyString = storage.getItem(storageKey);

    var keys = keyString ? keyString.split(':') : defaultEmojis;

    return keys.reduce(function(ob, k) {
      ob[k] = 1;
      return ob;
    }, {});
  };

  var invisibles = loadInvisibles();

  var saveInvisibles = function saveInvisibles() {
    var keys = Object.keys(invisibles);
    console.log(keys);
    storage.setItem(storageKey, keys.join(':'));
  };

  var createCssRule = function createCssRule() {
    var wrapKey = function wrapKey(which) {
      return '.' + emojiClassPrefix + which;
    };
    var genFilter = function genFilter(prefix) {
      return prefix + 'filter: invert(1);';
    };

    var keys = Object.keys(invisibles);
    var prefixes = ['-webkit-', '-moz-', '-o-', '-ms-', '-khtml-', ''];

    var selector = keys.map(wrapKey).join(',');
    var rules = prefixes.map(genFilter).join(' ');

    var fullRule = selector + '{' + rules + '}';

    return fullRule;
  };

  var invertStyle = $('<style>').prop('type', 'text/css').html(createCssRule()).appendTo('head');

  var thinger = $('<div/>').css({
    border: '1px solid white',
    'background-color': 'black',
    padding: '8px 14px',
    'border-radius': '8px',
    position: 'fixed',
    display: 'none',
    'z-index': 100
  }).appendTo('body');

  var hideTimer = void 0;

  var startHide = function startHide() {
    hideTimer = setTimeout(function() {
      thinger.css('display', 'none');
    }, hoverms);
  };

  var stopHide = function stopHide() {
    clearTimeout(hideTimer);
  };

  var showHoverer = function showHoverer(id, text, x, y) {
    stopHide();

    // this doesn't even work anymore
    let displayedText = id === text? text: `${text} [${id}]`;

    thinger.attr('data-emoji-name', id);
    thinger.text(displayedText);

    thinger.css({
      left: x + 2,
      top: y + 2
    });

    thinger.css('display', 'block');
  };

  thinger.on('click', function() {
    var which = thinger.attr('data-emoji-name');

    if (invisibles[which]) {
      delete invisibles[which];
    } else {
      invisibles[which] = 1;
    }

    saveInvisibles();

    invertStyle.html(createCssRule());
  });

  thinger.on('mouseover', stopHide);
  thinger.on('mouseout', startHide);

  $('body').on('mouseover', '.emoji', function(mouseEvent) {
    let targets = [mouseEvent.target, mouseEvent.currentTarget];
    let target = targets.find((c)=>c.classList.length > 0);
    if (!target) { return console.log('no target',mouseEvent); }
    
    let emojiIdClass = Array.from(target.classList)
    .find((c)=>c.startsWith(emojiClassPrefix));
    
    if (!emojiIdClass) { return console.log('no eidc',mouseEvent); }

    var emojiId = emojiIdClass.substr(emojiClassPrefix.length);
    
    var emojiTitle = emojiId;
    var cx = mouseEvent.clientX;
    var cy = mouseEvent.clientY;

    showHoverer(emojiId, emojiTitle, cx, cy);
  });

  $('body').on('mouseout', '.emoji', startHide);
})();
