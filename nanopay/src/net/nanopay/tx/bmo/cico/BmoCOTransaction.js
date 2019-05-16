foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
  ],

  properties: [
    {
      name: 'completionTime',
      class: 'Long'
    }
  ]
});
