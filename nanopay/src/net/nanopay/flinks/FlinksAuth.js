foam.INTERFACE({
  package: 'net.nanopay.flinks',
  name: 'FlinksAuth',

  methods: [
  {
    name: 'authorize',
    returns: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException'],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'institution',
        javaType: 'String'
      },
      {
        name: 'username',
        javaType: 'String'
      },
      {
        name: 'password',
        javaType: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  },
  {
    name: 'challengeQuestion',
    returns: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'institution',
        javaType: 'String'
      },
      {
        name: 'username',
        javaType: 'String'
      },
      {
        name: 'requestId',
        javaType: 'String'
      },
      {
        name: 'map1',
        javaType: 'java.util.Map'
      },
      {
        name: 'type',
        javaType: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  },
  {
    name: 'getAccountSummary',
    returns: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'requestId',
        javaType: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  },
  {
    name: 'pollAsync',
    javaReturns: 'net.nanopay.flinks.model.FlinksResponse',
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        javaType: 'foam.core.X'
      },
      {
        name: 'requestId',
        javaType: 'String'
      },
      {
        class: 'FObjectProperty',
        of: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  }
  ]
 });
