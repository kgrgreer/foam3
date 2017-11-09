foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'FixedFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Long',
      name: 'fixedFee'
    }
  ],

  methods: [
    {
      name: 'getFee',
      args: [
        {
          name: 'transactionAmount',
          javaType: 'long'
        }
      ],
      javaReturns: 'long',
      javaCode: ' return this.getFixedFee(); ',
      code: function() {
        return this.fixedFee;
      }
    },
    {
      name: 'getTotalAmount',
      args: [
        {
          name: 'transactionAmount',
          javaType: 'long'
        }
      ],
      javaReturns: 'long',
      javaCode: ' return getFee(transactionAmount) + transactionAmount; ',
      code: function() {
        return getFee(transactionAmount) + transactionAmount;
      }
    }
  ]
});
