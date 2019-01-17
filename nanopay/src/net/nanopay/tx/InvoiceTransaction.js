foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InvoiceTransaction',
  extends: 'net.nanopay.tx.DigitalTransaction',

  javaImports: [
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList'
  ],

  tableColumns: [
    'id',
    'referenceNumber',
    'name',
    'type',
    'status',
    'payer',
    'sourceAccount',
    'sourceCurrency',
    'serviceCompleted',
    'amount',
    'total',
    'payee',
    'destinationAccount',
    'destinationCurrency',
    'destinationAmount',
    'created',
    'lastModified',
    'scheduled',
    'completionDate'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'payable',
      documentation: 'Represents payable/receivable invoice. Receivable is default.'
    },
    {
      class: 'Double', // REVIEW
      // TODO: rename to percentComplete
      name: 'serviceCompleted',
      value: 100,
      javaValue: '100',
      documentation: 'Percentage of how much work was done.'
    },
    {
      class: 'Long',
      name: 'serviceId',
      documentation: 'Reference to service that is being paid'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      // REVIEW: why do we have total and amount?
      class: 'Currency',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( ! this.InfoLineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].amount;
          }
        }
        value = value * this.serviceCompleted/100;
        return value;
      },
      javaGetter: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( ! ( lineItem instanceof InfoLineItem ) ) {
            value += (Long) lineItem.getAmount();
          }
        }
        Double percent = getServiceCompleted()/100.0;
        value = value * percent.longValue();
        return value;
      `,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start()
          .addClass('amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
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
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
        List all = new ArrayList();
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, getStatus() == TransactionStatus.REVERSE);
          for ( int j = 0; j < transfers.length; j++ ) {
            transfers[j].setAmount((long)(transfers[j].getAmount()*0.01*getServiceCompleted()));
            all.add(transfers[j]);
          }
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      documentation: `Method to execute additional logic for each transaction after it was written to journals`,
      name: 'executeAfterPut',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaCode: `
      super.executeAfterPut(x, oldTxn);
      createChild(x, oldTxn);
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      setInvoiceId(other.getInvoiceId());
      setStatus(other.getStatus());
      setReferenceData(other.getReferenceData());
      setReferenceNumber(other.getReferenceNumber());
      setServiceCompleted(((InvoiceTransaction)other).getServiceCompleted());
      `
    },
    {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Boolean',
      javaCode: `
      return ( oldTxn == null || oldTxn.getStatus() != TransactionStatus.COMPLETED ) && getStatus() == TransactionStatus.COMPLETED;      `
    },
    {
      documentation: `creates another child transaction if job was done partially`,
      name: 'createChild',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaCode: `
      InvoiceTransaction old = (InvoiceTransaction) oldTxn;
      if ( this.getServiceCompleted() == 100 ) {
        return;
      }
      InvoiceTransaction child = new InvoiceTransaction();
      child.copyFrom(this);
      child.setId("");
      child.setServiceCompleted(100);
      child.setStatus(TransactionStatus.PENDING);

      TransactionLineItem[] lineItems = old.getLineItems();
      for ( int i = 0; i < lineItems.length; i++ ) {
        lineItems[i].setAmount((long)(lineItems[i].getAmount()*0.01*(100 - getServiceCompleted())));
      }
      child.setLineItems(lineItems);
      getChildren(x).put(child);

      `
    }
  ]
});
