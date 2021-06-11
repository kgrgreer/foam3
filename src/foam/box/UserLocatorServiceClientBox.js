/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'UserLocatorServiceClientBox',
  extends: 'foam.box.ProxyBox',

  documentation: 'ClientBox which does not wrap replyBox in SessionReplyBox',

//  imports: [ 'sessionID' ],
//
//  constants: [ // do we need this? if we use " UserLocatorService" before login?
//    {
//      name: 'SESSION_KEY',
//      value: 'sessionId'
//    }
//  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
//        msg.attributes[this.SESSION_KEY] = this.sessionID;
        this.delegate.send(msg);
      }
    }
  ]
});
