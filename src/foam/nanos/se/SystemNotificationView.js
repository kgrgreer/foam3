/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.se',
  name: 'SystemNotificationView',
  extends: 'foam.u2.View',

  documentation: `
    Displays a thin view that takes up 100% width of its container and displays a message.
  `,

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.se.SystemNotification'
  ],

  imports: [
    'systemNotificationService'
  ],

  css: `
    ^ .notification {
      width: calc(100% - 48px);
      height: 36px;
      padding: 0 24px;
      display: table;
      position: relative;
    }

    ^ .message {
      margin: 0;
      height: 36px;
      text-align: center;
      color: $black;
      display: table-cell;
      vertical-align: middle;
    }

    ^ .error {
      background-color: #fff6f6;
    }

    ^ .warning {
      background-color: #ffe2b3;
    }

    ^ .info {
      background-color: #ddf6e3;
    }

    ^ .hidden {
      display: none;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.se.SystemNotification',
      name: 'systemNotification'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.se.SystemNotification',
      name: 'systemNotifications'
    }
  ],

  // TODO: Render array of notifications
  // TODO: implement dismissed based on localStorage
  methods: [
    async function init() {
      // this.systemNotificationService.getSystemNotifications().then(function(notifications) {
      //   this.systemNotifications = notifications;
      // });
      this.systemNotifications = await this.systemNotificationService.getSystemNotifications();
    },

    function render() {
      var self = this;
      this.dynamic(function(systemNotification, systemNotifications) {
        this.removeAllChildren();
        var sn = systemNotification;
        if ( ! sn && systemNotifications ) {
          sn = systemNotifications[0];
        }
        if ( ! sn ) return;
        this.addClass(this.myClass())
          .start('div').addClass('notification')
          .start().addClass('text')
          .enableClass('error', sn.severity === self.LogLevel.ERROR)
          .enableClass('warning', sn.severity === self.LogLevel.WARN)
          .enableClass('info', sn.severity === self.LogLevel.INFO)
          .start('div').addClass('p', 'message')
          .add(sn.message)
          .end()
        // callif ( this.systemNotification.dismissable )
        //   .start().addClass('dismiss')
        //   .end()
          .end()
          .end();
      });
    }
  ]
});
