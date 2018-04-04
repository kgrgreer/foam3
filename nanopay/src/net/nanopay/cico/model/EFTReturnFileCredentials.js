foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'EFTReturnFileCredentials',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'user',
      value: 'eftcadtest2'
    },
    {
      class: 'String',
      name: 'password',
      value: '1a2$3d4f'
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