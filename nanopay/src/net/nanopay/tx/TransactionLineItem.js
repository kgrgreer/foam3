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
      documentation: `By default, show Transaction Line Item class name - to distinguish sub-classes.`,
      name: 'name',
      class: 'String',
      visibility: 'RO',
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: 'return getClass().getSimpleName();'
    },
    {
      name: 'note',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'Long',
      //javaType: 'Object',
      visibility: 'RO'
    },
    // {
    //   name: 'quantity',
    //   class: 'Long',
    //   value: 1
    // },
    {
      documentation: `Show Transaction Line Item class name - to distinguish sub-classes.`,
      class: 'String',
      name: 'type',
      transient: true,
      visibility: foam.u2.Visibility.RO,
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `
        return getClass().getSimpleName();
`
    }
  ],

  methods: [
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
        sb.append(", ");
        sb.append("amount: ");
        sb.append(getAmount());
        sb.append(")");
        return sb.toString();
      `
    },
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
        return new Transfer[0];
        // if ( getAmount() != 0 ) {
        //   return new Transfer[0];
        // }
        // return new Transfer [] {
        //   new Transfer.Builder(x).setAccount(nu.getSourceAccount()).setAmount(-getAmount()).build(),
        //   new Transfer.Builder(x).setAccount(nu.getDestinationAccount()).setAmount(getAmount()).build()
        // };
      `
    },
    {
      name: 'validate',
      javaReturns: 'void',
      javaCode: `
        //super.validate();
        // TODO/REVIEW : require access to parent Transaction lastModifiedTime
        // if ( getFxExpiry().getTime() < lastModifiedTime + some window ) {
        //   throw new RuntimeException("FX quote expired.");
        // }
      `
    }
  ]
});
