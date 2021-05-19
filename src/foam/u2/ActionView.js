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
  package: 'foam.u2',
  name: 'ActionView',
  extends: 'foam.u2.tag.Button',

  documentation: `
    A button View for triggering Actions.

    Icon Fonts
    If using icon-fonts a css stylesheet link to the fonts is required in index.html.
    The default of foam.core.Action.js is 'Material Icons' supported by the following
    link: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
  `,

  requires: [
    'foam.u2.ButtonSize',
    'foam.u2.ButtonStyle',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'ctrl'
  ],

  enums: [
    {
      name: 'ButtonState',
      values: [
        { name: 'NO_CONFIRM' }, // No confirmation required, fire on click
        { name: 'CONFIRM' },    // Confirmation required, debounce on click
        { name: 'DEBOUNCE' },   // Move to Armed after delay, NOP on click
        { name: 'ARMED' }       // Waiting for confirmation, fire on click
      ]
    }
  ],

  messages: [
    { name: 'CONFIRM', message: 'Confirm' }
  ],

  properties: [
    {
      name: 'icon',
      factory: function(action) { return this.action.icon; }
    },
    {
      name: 'iconFontFamily',
      factory: function(action) { return this.action.iconFontFamily; }
    },
    {
      name: 'iconFontClass',
      factory: function(action) { return this.action.iconFontClass; }
    },
    {
      name: 'iconFontName',
      factory: function(action) { return this.action.iconFontName; }
    },
    {
      name: 'labelPlaceholder',
      expression: function(label) { return this.action.label; }
    },
    {
      name: 'buttonState',
      factory: function() { return this.ButtonState.NO_CONFIRM; }
    },
    {
      name: 'data',
      postSet: function() {
        // Reset state
        this.buttonState = undefined;
      }
    },
    'action',
    {
      name: 'label',
      factory: function(action) { return this.action.label; }
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonStyle',
      name: 'buttonStyle',
      factory: function(action) { return this.action.buttonStyle || 'SECONDARY'; }
    },
    {
      class: 'Boolean',
      name: 'isDestructive',
      documentation: `
        When set to true, this action should be styled in a way that indicates
        that data is deleted in some way.
      `,
      factory: function() {
        return false;
      }
    },
    {
      class: 'String',
      name: 'styleClass_',
      expression: function(isDestructive, buttonStyle) {
        var s = buttonStyle.name.toLowerCase();
        return isDestructive ? s + '-destructive' : s;
      }
    }
  ],

  methods: [
    function initE() {
      this.tooltip = this.action.toolTip;

      this.SUPER();

      if ( this.action ) {
        if ( this.action.confirmationRequired ) {
          var cRSlot$ = this.action.createConfirmationRequired$(this.__context__, this.data);
          this.onDetach(cRSlot$.sub(() => this.setConfirm(cRSlot$.get())));
          this.setConfirm(cRSlot$.get());
        }
        this.attrs({name: this.action.name, 'aria-label': this.action.ariaLabel });

        this.enableClass(this.myClass('unavailable'), this.action.createIsAvailable$(this.__context__, this.data), true);
        this.attrs({ disabled: this.action.createIsEnabled$(this.__context__, this.data).map((e) => e ? false : 'disabled') });
      }
    },

    function initCls() {
      this.addClass(this.myClass());
      this.addClass(this.myClass(this.action.name));
    },

  ],

  listeners: [
    function click(e) {
      try {
        if ( this.action && this.action.confirmationView && this.buttonState == this.ButtonState.NO_CONFIRM ) {
          this.ctrl.add(this.Popup.create().tag(this.action.confirmationView, {
            action: this.action,
            data: this.data
          }));
        } else if ( this.buttonState == this.ButtonState.NO_CONFIRM ) {
          this.action && this.action.maybeCall(this.__subContext__, this.data);
        } else if ( this.buttonState == this.ButtonState.CONFIRM ) {
          this.buttonState = this.ButtonState.DEBOUNCE;
          this.removeAllChildren();
          this.start().addClass('h600').add(this.CONFIRM).end();
          this.debounce();
        } else if ( this.buttonState == this.ButtonState.ARMED ) {
          this.buttonState = this.ButtonState.CONFIRM;
          this.removeAllChildren();
          this.addContent();
          this.action && this.action.maybeCall(this.__subContext__, this.data);
        }
      } catch (x) {
        console.warn('Unexpected Exception in Action: ', x);
      }

      e.preventDefault();
      e.stopPropagation();
    },
    {
      name: 'debounce',
      isMerged: true,
      mergeDelay: 200,
      code: function() {
        if ( this.buttonState != this.ButtonState.DEBOUNCE ) return;

        this.buttonState = this.ButtonState.ARMED;
        this.deactivateConfirm();
      }
    },
    {
      name: 'deactivateConfirm',
      isMerged: true,
      mergeDelay: 6000,
      code: function() {
        if ( this.buttonState != this.ButtonState.ARMED ) return;
        this.removeAllChildren();
        this.addContent();
        this.buttonState = this.ButtonState.CONFIRM;
      }
    },
    {
      name: 'setConfirm',
      code: function(confirm) {
        let newState = confirm ? this.ButtonState.CONFIRM : this.ButtonState.NO_CONFIRM;
        let stateChange = this.buttonState != newState;
        this.buttonState = newState;
        this.isDestructive = confirm;
        if ( stateChange ) {
          this.removeAllChildren();
          this.addContent();
        }
      }
    }
  ]
});
