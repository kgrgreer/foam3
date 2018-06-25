foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'EFTReturnFileCredentials',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'user',
      value: 'mintchip'
    },
    {
      class: 'String',
      name: 'password',
      value: '8mmPHuqI'
    },
    {
      class: 'String',
      name: 'host',
      value: 'ftp.eftcanada.com'
    },
    {
      class: 'Int',
      name: 'port',
      value: 22
    }
  ]
});
