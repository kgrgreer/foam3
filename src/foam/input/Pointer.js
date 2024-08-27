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
  name: 'Pointer',

  requires: [
    'foam.input.Mouse',
    'foam.input.Touch'
  ],

  topics: [
    'touch'
  ],

  properties: [
    {
      name: 'element',
      required: true
    },
    {
      name: 'mouseInput',
      factory: function() {
        var m = this.Mouse.create();
        this.onDetach(m.element$.follow(this.element$));
        this.onDetach(m.touch.sub(this.onTouch));
        return m;
      }
    },
    {
      name: 'touchInput',
      factory: function() {
        var t = this.Touch.create();
        this.onDetach(t.element$.follow(this.element$));
        this.onDetach(t.touch.sub(this.onTouch));
        return t;
      }
    }
  ],

  methods: [
    function init() {
      // Assigning to unused variables to make Closure happy.
      var mi = this.mouseInput;
      var ti = this.touchInput;
    }
  ],

  listeners: [
    function onTouch(e, _, t) {
      this.touch.pub(t);
    }
  ]
});
