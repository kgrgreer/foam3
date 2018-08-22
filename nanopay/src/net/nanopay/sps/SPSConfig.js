foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'SPSConfig',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'url',
      value: 'https://spaysys.com/cgi-bin/cgiwrap-noauth/dl4ub/tinqpstpbf.cgi'
    }
  ]
});
