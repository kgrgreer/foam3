foam.CLASS({
  package: 'net.nanopay.tx.rbc.ftps',
  name: 'RbcFTPSCredential',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'Boolean',
      name: 'enable'
    },
    {
      class: 'Boolean',
      name: 'skipSendFile'
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'networkGatewayId'
    },
    {
      class: 'String',
      name: 'networkGatewayClientId'
    },
  ]
});