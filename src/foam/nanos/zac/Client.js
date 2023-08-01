/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Access with:
// http://localhost:8080/foam3/src/foam/nanos/zac/index.html (embedded)
// http://localhost:8080/src/foam/nanos/zac/index.html       (stand alone)

/*
group in foam.box.SessionReplyBox
loginSuccess in foam.box.SessionReplyBox
requestLogin in foam.box.SessionReplyBox
sessionTimer in foam.box.SessionReplyBox
crunchController in foam.nanos.crunch.box.CrunchClientReplyBox
group in foam.box.SessionReplyBox
pushMenu in foam.nanos.boot.NSpec
*/

foam.CLASS({
  package: 'foam.nanos.zac',
  name: 'MissingStuff',

  exports: [
    'group', 'loginSuccess', 'requestLogin', 'sessionTimer', 'crunchController', 'pushMenu'
  ],

  properties: [
    { name: 'group',            value: '' /*getter: function() { debugger; } */},
    { name: 'sessionTimer',     getter: function() { debugger; } },
    { name: 'crunchController', getter: function() { debugger; } }
  ],

  methods: [
    function loginSuccess() {
      debugger;
    },
    function requestLogin() {
      debugger;
    },
    function pushMenu() {
      debugger;
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.zac',
  name: 'Client',
  extends: 'foam.u2.Element',

  documentation: 'Zero-Admin Client',

  requires: [
    'foam.nanos.client.ClientBuilder'
  ],

  implements: [
    'foam.box.Context',
    'foam.nanos.zac.MissingStuff'
  ],

  imports: [
    'window'
  ],

  exports: [
    'as ctrl',
    'sessionID'
  ],

  properties: [
    {
      class: 'String',
      name: 'sessionName',
      value: 'defaultSession'
    },
    {
      name: 'sessionID',
      factory: function() {
        var urlSession = '';

        try {
          urlSession = this.window.location.search.substring(1).split('&')
           .find(element => element.startsWith("sessionId")).split('=')[1];
        } catch {
        }

        return urlSession !== "" ? urlSession : localStorage[this.sessionName] ||
          ( localStorage[this.sessionName] = foam.uuid.randomGUID() );
      }
    },
    {
      name: 'client'
    }
 ],

  methods: [
    async function render() {
      this.SUPER();

      var cls = await this.ClientBuilder.create({authenticate: false}, this).promise;
      this.client = cls.create(null, this);

      if ( ! globalThis.client ) globalThis.client = this.client;
    }
  ]
});
