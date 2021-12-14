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

// TODO: Maybe promote to Notifications
 foam.ENUM({
  package: 'foam.u2.dialog',
  name: 'InlineNotificationStyles',

  values: [
    {
      name: 'DEFAULT',
      color: '/*%PRIMARY3%*/ #406DEA',
      glyph: 'checkmark'
    },
    {
      name: 'ERROR',
      color: '/*%DESTRUCTIVE3%*/ #A61414',
      glyph: 'exclamation'
    },
    {
      name: 'WARN',
      color: '/*%WARNING3%*/ #EEDC00',
      glyph: 'exclamation'
    },
    {
      name: 'SUCCESS',
      color: ' /*%APPROVAL3%*/ #117A41',
      glyph: 'checkmark'
    },
    {
      name: 'UNSTYLED',
      color: ' /*%WHITE%*/ #FFFFFF'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'InlineNotificationMessage',
  extends: 'foam.u2.View',

  documentation: `
    Inline RO notification message container.
  `,

  requires: [
    'foam.u2.ControllerMode',
    'foam.u2.tag.CircleIndicator'
  ],

  imports: [ 'returnExpandedCSS' ],

  properties: [
    {
      name: 'icon',
      factory: function() {
        if ( ! this.type.glyph ) return undefined;
        // Colors flipped to make sure icon backgrounds have the right color inside circle indicator
        var props = {
          size: 16,
          backgroundColor: this.accentColor,
          icon: this.type.glyph.clone(this).getDataUrl({
            fill: this.iconColor
          })
        };
        return { class: 'foam.u2.tag.CircleIndicator', ...props }
      }
    },
    {
      class: 'Enum',
      of: 'foam.u2.dialog.InlineNotificationStyles',
      name: 'type'
    },
    {
      name: 'accentColor',
      factory: function() {
        return this.type && this.returnExpandedCSS(this.type.color);
      },
      documentation: 'Border color for the view and icon background. Defaults to type color'
    },
    {
      name: 'iconColor',
      factory: function() {
        return this.returnExpandedCSS(this.type.background) || '#FFFFFF';
      },
      documentation: 'Icon color. Defaults to type background or white'
    },
    {
      name: 'isVisible',
      value: true,
      documentation: 'Can be used to hide the view in case this.content is not populated synchronously'
    }
  ],

  css: `
    ^outer {
      align-items: center;
      border: 1px solid;
      border-radius: 3px;
      border-left-width: 8px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
    }
    ^outer > * + * {
      padding-left: 16px;
    }
    ^status-icon {
      flex: 0 0 16px;
    }
    ^content {
      flex: 1;
    }
  `,

  methods: [
    function init() {
      var self = this;
      this
        .show(this.isVisible$)
        .addClass(this.myClass('outer'))
        .style({ 'border-color': this.accentColor$ })
        .call(function() {
          if ( ! self.icon ) return;
          if ( foam.core.String.isInstance(this.icon) == 'String' ) {
            this.start('img')
            .addClass(self.myClass('status-icon'))
            .attrs({ src: self.icon$ })
            .end();
          } else {
            this.tag(self.icon)
          }
        })
        .startContext({ controllerMode: this.ControllerMode.VIEW })
          .start('', null, this.content$).addClass(this.myClass('content')).end()
        .endContext();
    }
  ]
});
