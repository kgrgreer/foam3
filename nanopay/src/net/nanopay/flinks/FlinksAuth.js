foam.INTERFACE({
  package: 'net.nanopay.flinks',
  name: 'FlinksAuth',

  methods: [
  {
    name: 'authorize',
    type: 'net.nanopay.flinks.model.FlinksResponse',
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
    type: 'net.nanopay.flinks.model.FlinksResponse',
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
    type: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'requestId',
        type: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  },
  {
    name: 'pollAsync',
    javaType: 'net.nanopay.flinks.model.FlinksResponse',
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'requestId',
        type: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  }
  ]
 });
