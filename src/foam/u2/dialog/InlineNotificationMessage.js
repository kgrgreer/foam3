/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.u2.dialog',
  name: 'InlineNotificationMessage',
  extends: 'foam.u2.View',

  documentation: `
    Inline notification message container.
  `,

  requires: [
    'foam.u2.ControllerMode'
  ],

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    {
      name: 'isEmpty',
      expression: function(message) {
        return ! message || message.length === 0;
      }
    },
    {
      name: 'isError',
      expression: function(type) {
        return type === 'error';
      }
    },
    {
      name: 'isWarning',
      expression: function(type) {
        return type === 'warning';
      }
    },
    {
      name: 'iconImage',
      expression: function(isError, isWarning) {
        return isError ? this.ERROR_ICON : isWarning ?
            this.WARNING_ICON : this.SUCCESS_ICON;
      }
    },
    'message',
    {
      class: 'foam.u2.ViewSpec',
      name: 'customView',
      documentation: `enable to custom the view`
    },
  ],

  constants: {
    ERROR_ICON: 'images/inline-error-icon.svg',
    WARNING_ICON: 'images/baseline-warning-yellow.svg',
    SUCCESS_ICON: 'images/checkmark-small-green.svg'
  },

  css: `
    ^ {
      position: relative;
      justify-content: center;
      z-index: 15000;
    }
    ^inner {
      margin: auto;
      padding: 8px 24px;
      animation-name: fade;
      animation-duration: 10s;
      font-size: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      background: #f6fff2;
      border: 1px solid #03cf1f;
      justify-content: space-between;
    }
    ^status-icon {
      margin-right: 10px;
      vertical-align: middle;
    }
    ^message {
      display: inline-block;
      vertical-align: middle;
      width: 85%;
      margin-left: 10px;
    }
    ^error-background {
      background: /*%GREY5%*/ #f5f4ff;
      border: 1px solid /*%DESTRUCTIVE3%*/ #f91c1c;
    }
    ^warning-background {
      background: /*%GREY5%*/ #f5f4ff;
      border: 1px solid /*%WARNING3%*/ #604aff;
    }
    ^icon {
      display: inline-block;
    }
  `,

  methods: [
    function render() {
      var self = this
      this
        .hide(this.isEmpty$)
        .addClass(this.myClass())
        .start().addClass(this.myClass('inner'))
          .enableClass(this.myClass('error-background'), this.isError$)
          .enableClass(this.myClass('warning-background'), this.isWarning$)
          .start()
            .start().addClass(this.myClass('icon'))
              .start('img')
                .addClass(this.myClass('status-icon'))
                .attrs({ src: this.iconImage$ })
              .end()
            .end()
            .startContext({ controllerMode: this.ControllerMode.VIEW })
              .addClass(this.myClass('message'))
              .callIf(this.customView, function() {
                this.tag(self.customView,{ data$: self.message$})
              })
              .callIf(! this.customView, function() {
                this.tag(self.message$)
              })
            .endContext()
          .end()
        .end();
    }
  ]
});
