/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  name: 'NotificationMessage',
  extends: 'foam.u2.View',

  documentation: `
    A notification message is a UI element to give a user immediate
    feedback. Notification messages are only visible for a few seconds.
  `,

  requires: [
    'foam.log.LogLevel',
    'foam.u2.tag.CircleIndicator'
  ],

  imports: [
    'translationService',
    'theme'
  ],

  css: `
    ^ {
      display: flex;
      justify-content: center;
      position: fixed;
      /* TODO: reduce max width when notification messages are updated */
      max-width: max(30vw, 480px);
      min-width: max(16vw, 300px);
      right: 32px;
      top: 24px;
      z-index: 15000;
    }
    ^inner {
      align-items: center;
      animation-name: fade;
      animation-duration: 10s;
      background: /*%WHITE%*/ white;
      border: 1px solid /*%GREY4%*/ #DADDE2;
      border-radius: 3px;
      box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      margin: auto;
      min-height: 64px;
      padding: 12px 16px;
      width: -webkit-fill-available;
    }
    @keyframes fade {
      0% { opacity: 0; transform: translateX(300px);}
      10% { opacity: 1; transform: translateX(0px);}
      80% { opacity: 1; }
      100% { opacity: 0; }
    }
    ^outer-content{
      align-items: center;
      display: flex;
      margin-right: 1em;
      width: -webkit-fill-available;
    }
    ^status-icon {
      align-items: center;
      height: 32px;
      justify-content: center;
      margin-right: 1em; 
      max-width: max(10%, 32px);
      width: 32px;
    }
    ^content {
      max-width: 90%;
      vertical-align: middle;
      white-space: nowrap;
      word-wrap: break-word;
    }
    ^title{
      overflow: hidden;
      text-overflow: ellipsis;
      width: -webkit-fill-available;
    }
    ^description {
      color: /*%GREY2%*/ #6B778C;
      overflow: hidden;
      text-overflow: ellipsis;
      width: -webkit-fill-available;
    }
    ^close-icon {
      position: absolute;
      right: 0.5em;
      top: 0.5em;
    }
    ^close-icon > *{
      width: 20px;
      height: 20px;
      padding: 0;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    'err',
    'message',
    'description',
    'icon'
  ],

  methods: [

    function render() {
      var self = this;
      var indicator;
      if ( this.err ) {
        // Create notification message and description from
        // exception name and message.
        var ex = this.err.exception || this.err;
        if ( ex.id ) {
          this.message = ex.id.split('.').pop();
          if ( this.message.endsWith('Exception') ) {
            this.message = this.message.replace('Exception', '');
          }
          this.message = foam.String.capitalize(foam.String.labelize(this.message).toLowerCase());
          this.message = this.translationService.getTranslation(foam.locale, ex.id, this.message);
        }
        if ( ex.getTranslation ) {
          this.description = ex.getTranslation();
        } else {
          this.description = this.translationService.getTranslation(foam.locale, ex.id+'.'+ex.message, ex.message);
        }
        if ( this.message == this.description ) {
          this.description = null;
        }
      }
      if ( ! this.icon ) {
        if ( this.type == this.LogLevel.ERROR ) {
          console.error('notification: ' + this.message);
          indicator = {
            size: 32,
            backgroundColor: this.theme.destructive3,
            borderColor: this.theme.destructive3,
            icon: this.theme.glyphs.exclamation.getDataUrl({
              fill: this.theme.white
            })
          };
        } else if ( this.type == this.LogLevel.WARN ) {
          console.warn('notification: ' + this.message);
          indicator = {
            size: 32,
            icon: 'images/baseline-warning-yellow.svg'
          };
        } else {
          console.info('notification: ' + this.message);
          indicator = {
            size: 32,
            backgroundColor: this.theme.approval3,
            borderColor: this.theme.approval3,
            icon: this.theme.glyphs.checkmark.getDataUrl({
              fill: this.theme.white
            })
          };
        }
      } else {
        indicator = {
          size: 32,
          icon$: this.icon$
        };
      }
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('inner'))
          .start()
            .addClass(this.myClass('outer-content'))
            .start()
              .addClass(this.myClass('status-icon'))
              .tag(this.CircleIndicator, indicator)
            .end()
            .start().addClass(this.myClass('content'))
              .start().addClasses(['h600', this.myClass('title')])
                .callIfElse(foam.String.isInstance(this.message), function() {
                  this.add(self.message);
                  console.log(self.message);
                }, function() {
                  this.tag(self.message);
                  console.log(self.message);
                })
              .end()
              .start().addClasses(['p', this.myClass('description')])
                .callIfElse(foam.String.isInstance(this.description), function() {
                  this.add(self.description);
                  console.log(self.description);
                }, function() {
                  this.tag(self.description);
                  console.log(self.description);
                })
              .end()
            .end()
          .end()
          .startContext({ data: this })
            .start()
                .addClass(this.myClass('close-icon'))
                .tag(self.REMOVE_NOTIFICATION, { buttonStyle: 'TERTIARY', label: '' })
            .end()
          .endContext()
        .end();

      setTimeout(() => {
        this.remove();
      }, 9900);
    }
  ],

  actions: [
    {
      name: 'removeNotification',
      themeIcon: 'close',
      icon: 'images/ic-cancelblack.svg',
      code: function() { this.remove(); }
    }
  ]
});
