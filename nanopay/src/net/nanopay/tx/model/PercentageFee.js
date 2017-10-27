foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'PercentageFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Float',
      name: 'percentage'
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
      javaCode: ' return ((Double) (this.getPercentage()/100 * transactionAmount)).longValue(); ',
      code: function() {
        return this.percentage/100 * transactionAmount;
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
