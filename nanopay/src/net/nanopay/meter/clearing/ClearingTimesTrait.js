foam.INTERFACE({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTimesTrait',

  properties: [
    {
      class: 'Map',
      name: 'clearingTimes',
      documentation: 'Clearing times of a transaction.',
      help: 'A list of clearing times applied to the transaction when sent.',
      visibility: 'RO',
      permissionRequired: true,
      javaType: 'java.util.Map<String, Integer>',
      javaFactory: ''
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(
          foam.java.Method.create({
            name: 'copyClearingTimesFrom',
            type: 'void',
            visibility: 'default',
            args: [
              { name: 'obj', type: 'Object' }
            ],
            body: `
              if ( obj instanceof ClearingTimesTrait ) {
                setClearingTimes(((ClearingTimesTrait) obj).getClearingTimes());
              }
            `
          })
        );
      }
    }
  ]
});
