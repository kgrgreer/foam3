foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'AuthServiceClientBox',
  extends: 'foam.box.ProxyBox',

  documentation: 'ClientBox which does not wrap replyBox in SessionReplyBox',

  constants: [
    {
      name: 'SESSION_KEY',
      value: 'sessionId'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'sessionName',
      value: 'defaultSession'
    },
    {
      class: 'String',
      name: 'sessionID',
      factory: function() {
        return localStorage[this.sessionName] ||
            ( localStorage[this.sessionName] = foam.uuid.randomGUID() );
      }
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        msg.attributes[this.SESSION_KEY] = this.sessionID;
        this.delegate.send(msg);
      }
    }
  ]
});
