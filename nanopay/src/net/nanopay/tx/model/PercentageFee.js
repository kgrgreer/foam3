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
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: ' return ((Double) (this.getPercentage()/100.0 * transactionAmount)).longValue(); ',
      swiftCode: ' return Int(floorf(percentage / 100.0 * Float(transactionAmount)))',
      code: function() {
        return this.percentage/100 * transactionAmount;
      }
    },
    {
      name: 'getTotalAmount',
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: ' return getFee(transactionAmount) + transactionAmount; ',
      swiftCode: ' return getFee(transactionAmount) + transactionAmount ',
      code: function() {
        return getFee(transactionAmount) + transactionAmount;
      }
    }
  ]
});
