foam.INTERFACE({
  package: 'net.nanopay.flinks',
  name: 'FlinksAuth',

  methods: [
  {
    name: 'authorize',
    javaReturns: 'net.nanopay.flinks.model.FlinksResponse',
    javaThrows: [ 'foam.nanos.auth.AuthenticationException'],
    args: [
      {
        name: 'x',
        javaType: 'foam.core.X'
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
        name: 'currentUser',
        javaType: 'foam.nanos.auth.User'
      }
    ]
  },
  {
    name: 'challengeQuestion',
    javaReturns: 'net.nanopay.flinks.model.FlinksResponse',
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        javaType: 'foam.core.X'
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
        name: 'currentUser',
        javaType: 'foam.nanos.auth.User'
      }
    ]
  },
  {
    name: 'getAccountSummary',
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
        name: 'currentUser',
        javaType: 'foam.nanos.auth.User'
      }
    ]
  }
  ]
 });
