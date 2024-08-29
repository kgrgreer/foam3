/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.input',
  name: 'Touch',

  topics: [
    'touch'
  ],

  properties: [
    {
      name: 'touches',
      factory: function() { return {}; }
    },
    {
      name: 'element',
      postSet: function(old, e) {
        if ( old ) {
          old.removeEventListener('touchstart', this.onTouchStart);
          old.removeEventListener('touchmove',  this.onTouchMove);
          old.removeEventListener('touchend',   this.onTouchEnd);
        }
        e.addEventListener('touchstart', this.onTouchStart);
        e.addEventListener('touchmove',  this.onTouchMove);
        e.addEventListener('touchend',   this.onTouchEnd);
      }
    }
  ],

  listeners: [
    function onTouchStart(e) {
      var newTouches = e.changedTouches;
      var bounds     = this.element.getBoundingClientRect();

      for ( var i = 0 ; i < newTouches.length ; i++ ) {
        var touch = newTouches.item(i);

        var touchEvent = foam.input.TouchEvent.create({
          x: touch.clientX - bounds.left,
          y: touch.clientY - bounds.top
        });

        this.touch.pub(touchEvent);
        if ( touchEvent.claimed ) e.preventDefault();

        this.touches[touch.identifier] = touchEvent;
      }
    },

    function onTouchMove(e) {
      var changed = e.changedTouches;
      var bounds  = this.element.getBoundingClientRect();

      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        var event = this.touches[touch.identifier];
        event.x = touch.clientX - bounds.left;
        event.y = touch.clientY - bounds.top;
        if ( event.claimed ) e.preventDefault();
      }
    },

    function onTouchEnd(e) {
      var changed = e.changedTouches;
      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        this.touches[touch.identifier].detach();
        delete this.touches[touch.identifier];
      }
    }
  ]
});
