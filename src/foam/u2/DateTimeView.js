/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

// TODO: Add datalist support.

foam.CLASS({
  package: 'foam.u2',
  name: 'DateTimeView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing DateTime values.',

  mixins: [ 'foam.u2.TextInputCSS' ],

  css: `
    ^ {
      height: $inputHeight;
    }
  `,

  properties: [
    [ 'placeholder', 'yyyy/mm/dd hh:mm' ],
    [ 'type', 'datetime-local' ]
  ],

  methods: [
    function link() {
      if ( this.linked ) return;
      this.linked = true;
      var self    = this;
      var focused = false;
      var slot    = this.attrSlot(); //null, this.onKey ? 'input' : null);

      function updateSlot() {
        var date = self.data;
        if ( ! date ) {
          slot.set('');
        } else {
          slot.set(date ? date.toISOString().substring(0,16) : '');
        }
      }

      function updateData() {
        var value = slot.get();

        var date;
        if ( value ) {
          date = Date.parse(value);
          if ( isNaN(date) ) date = undefined;
        } else {
          date = null;
        }

        self.data = date;
      }

      if ( this.onKey ) {
        var focused = false;
        this.on('focus', () => { focused = true; });
        this.on('blur',  () => { focused = false; });
        this.on('change', updateData);
      } else {
        this.on('blur', updateData);
      }

      updateSlot();
      this.onDetach(this.data$.sub(updateSlot));
    }
  ]
});
