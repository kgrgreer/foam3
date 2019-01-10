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
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: ' return this.getFixedFee(); ',
      swiftCode: ' return fixedFee ',
      code: function() {
        return this.fixedFee;
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
