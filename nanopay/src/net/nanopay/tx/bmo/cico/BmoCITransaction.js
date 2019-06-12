foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
    'java.util.ArrayList',
    'java.util.Arrays',
    'net.nanopay.tx.bmo.BmoFormatUtil'
  ],

  implements: [
    'net.nanopay.tx.bmo.cico.BmoTransaction'
  ],

  properties: [
    {
      name: 'completedTimeEST',
      class: 'String'
    },
    {
      name: 'transactionHistory',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
    {
      name: 'potentiallyUndelivered',
      class: 'Boolean'
    },
    {
      name: 'bmoReferenceNumber',
      class: 'String'
    },
    {
      name: 'bmoFileCreationNumber',
      class: 'Int'
    },
    {
      name: 'rejectType',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'addHistory',
      args: [
        {
          name: 'history', type: 'String'
        }
      ],
      type: 'Void',
      javaCode: `
      String temp = BmoFormatUtil.getCurrentDateTimeEST() + " : " + history + System.lineSeparator();
      this.setTransactionHistory(this.getTransactionHistory() + temp);
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        setTransactionHistory( ((BmoCITransaction) other).getTransactionHistory() );
        setCompletedTimeEST(((BmoCITransaction) other).getCompletedTimeEST() );
        setPotentiallyUndelivered( ((BmoCITransaction) other).getPotentiallyUndelivered() );
        setBmoReferenceNumber( ((BmoCITransaction) other).getBmoReferenceNumber() );
        setBmoFileCreationNumber( ((BmoCITransaction) other).getBmoFileCreationNumber() );
        setRejectType( ((BmoCITransaction) other).getRejectType() );
      `
    }
  ]
});
