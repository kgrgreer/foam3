foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
  ],

  properties: [
    {
      name: 'completionTime',
      class: 'Long'
    }
  ]
});
