/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      documentation: 'Assigned when line items are added to a transaction. All lineitems add at the same time are assigned to the same group so line items can be shown together.  For example, FX rate, expiry, fee can be grouped in the output.',
      name: 'group',
      class: 'String'
    },
    {
      documentation: 'By default, show Transaction Line Item class name - to distinguish sub-classes.',
      name: 'name',
      class: 'String',
      visibility: 'RO',
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: 'return getClass().getSimpleName();'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'type'
    },
    {
      name: 'note',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'Currency',
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      documentation: 'Used to format amount',
      name: 'currency',
      class: 'String',
      value: 'CAD',
      hidden: true
    },
    // {
    //   name: 'transaction',
    //   class: 'Long',
    //   // Can't use a Reference as Transaction has Lineitems.
    //   //class: 'Reference',
    //   //of: 'net.nanopay.tx.model.Transaction',
    //   hidden: true
    // }
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
        {
          name: 'reverse',
          javaType: 'Boolean'
        }
      ],
      javaReturns: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        return new Transfer[0];
      `
    },
    {
      name: 'validate',
      javaReturns: 'void',
      javaCode: `
        // TODO/REVIEW : require access to parent Transaction lastModifiedTime
        // if ( getFxExpiry().getTime() < lastModifiedTime + some window ) {
        //   throw new RuntimeException("FX quote expired.");
        // }
      `
    },
    {
      name: 'toString',
      javaReturns: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(this.getClass().getSimpleName());
        sb.append("(");
        sb.append("name: ");
        sb.append(getName());
        sb.append(", ");
        sb.append("note: ");
        sb.append(getNote());
        sb.append(")");
        return sb.toString();
      `
    }
  ]
});
