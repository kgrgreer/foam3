/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FeeLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'amount',
      class: 'Long',
      //javaType: 'Long',
      //javaType: 'Object',
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      name: 'currency',
      class: 'String',
      value: 'CAD'
    },
    {
      name: 'feeAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      hidden: true
    },
 ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'old',
          javaType: 'Transaction'
        },
        {
          name: 'nu',
          javaType: 'Transaction'
        },
      ],
      javaReturns: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        if ( getAmount() == 0 ||
             getFeeAccount() == 0 ) {
           return new Transfer[0];
        }
        return new Transfer [] {
          new Transfer.Builder(x).setAccount(nu.getSourceAccount())
              .setAmount(-getAmount()).build(),
          new Transfer.Builder(x).setAccount(getFeeAccount())
              .setAmount(getAmount()).build()
        };
      `
    }
  ]
});
