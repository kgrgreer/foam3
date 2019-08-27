/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InfoLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'old',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'nu',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'reverse',
          type: 'Boolean'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        return new Transfer[0];
      `
    },
function toSummary() {
      return this.name+ " : "+this.note;
    },
  ]
});
