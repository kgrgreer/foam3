foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Fee',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.FeeType',
      name: 'type'
    }
  ],

  methods: [
    {
      name: 'getFee',
      args: [
        {
          name: 'transactionAmount',
          javaType: 'Long'
        }
      ],
      javaReturns: 'Long',
      javaCode: ' return 0L; ',
      code: function() {
        return 0;
      }
    },
    {
      name: 'getTotalAmount',
      args: [
        {
          name: 'transactionAmount',
          javaType: 'Long'
        }
      ],
      javaReturns: 'Long',
      javaCode: ' return transactionAmount; ',
      code: function() {
        return transactionAmount;
      }
    }
  ]
 });