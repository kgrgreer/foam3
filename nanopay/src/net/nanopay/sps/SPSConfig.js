foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'SPSConfig',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'url',
      value: 'https://spaysys.com/cgi-bin/cgiwrap-noauth/dl4ub/tinqpstpbf.cgi'
    },
    {
      class: 'String',
      name: 'host',
      value: 'spaysys.com'
    },
    {
      class: 'String',
      name: 'user',
      value: 'ftpnnp'
    },
    {
      class: 'String',
      name: 'password',
      value: 'nAPyN0821'
    },
    {
      class: 'Int',
      name: 'port',
      value: 22
    },
    {
      class: 'String',
      name: 'sftpPathSegment',
      value: '/ftpnnp'
    }
  ]
});
