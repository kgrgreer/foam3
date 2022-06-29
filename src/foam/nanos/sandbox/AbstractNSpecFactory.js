foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'AbstractNSpecFactory',
  javaImplements: ['foam.core.XFactory'],
  abstract: true,

  properties: [
    {
      class: 'Object',
      javaType: 'foam.core.X',
      name: 'hostX'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec',
      name: 'nSpec'
    }
  ]
});
