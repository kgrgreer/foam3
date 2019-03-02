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
        type: 'String'
      },
      {
        name: 'username',
        type: 'String'
      },
      {
        name: 'password',
        type: 'String'
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
        type: 'String'
      },
      {
        name: 'username',
        type: 'String'
      },
      {
        name: 'requestId',
        type: 'String'
      },
      {
        name: 'map1',
        type: 'Map'
      },
      {
        name: 'type',
        type: 'String'
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
  }
  ]
 });
