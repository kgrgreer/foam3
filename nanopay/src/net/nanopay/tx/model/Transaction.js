foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'addCommas',
    'userDAO'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'java.util.*',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
    'net.nanopay.tx.alterna.AlternaVerificationTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.model.LiquidityService',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer'
  ],

  requires: [
   'net.nanopay.tx.ETALineItem',
   'net.nanopay.tx.FeeLineItem',
   'net.nanopay.tx.TransactionLineItem'
 ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      type: 'Set<TransactionStatus>',
      value: `Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});`
    }
  ],

  css: `
     .foam-u2-view-TreeView {
       display: block;
       overflow-x: auto;
     }
     .foam-u2-view-TableView {
       display: block;
       overflow-x: auto;
     }
   `,

  searchColumns: [
    'id',
    'referenceNumber',
    'name',
    'type',
    'status',
    'sourceAccount',
    'sourceCurrency',
    'amount',
    'payee',
    'payeeId',
    'payer',
    'payerId',
    'destinationAccount',
    'destinationCurrency',
    'destinationAmount',
    'created',
    'createdBy',
    'lastModified',
    'lastModifiedBy',
    'scheduled',
    'total',
    'completionDate',
    'processDate',
    'isQuoted',
    'invoiceId',
    'messageId',
    'transfers',
    'reverseTransfers'
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
    'amount',
    'payee',
    'destinationAccount',
    'destinationCurrency',
    'destinationAmount',
    'created',
    'lastModified',
    'scheduled',
    'completionDate'
  ],

  // relationships: parent, children

  properties: [
    {
      name: 'name',
      class: 'String',
      visibility: 'RO',
      factory: function() {
        return this.type;
      },
      javaFactory: `
    return getType();
      `,
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'RO',
      storageTransient: true,
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `
    },
    {
      name: 'isQuoted',
      class: 'Boolean',
      hidden: true
    },
    {
      name: 'transfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[0];',
      hidden: true
    },
    {
      name: 'reverseTransfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[0];',
      hidden: true
    },
    {
      class: 'String',
      name: 'id',
      label: 'ID',
      visibility: 'RO',
      javaJSONParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.json.StringParser())`,
      javaCSVParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.csv.CSVStringParser())`

    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the transaction was created.`,
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the transaction.`,
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          this.add(user.email);
        }.bind(this));
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date the transaction was last modified.`,
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The id of the user who last modified the transaction.`,
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          this.add(user.email);
        }.bind(this));
      }
   },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      visibility: 'RO',
      flags: ['js'],
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select invoice' }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;'
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: 'RO',
      label: 'Reference'
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      label: 'Receiver',
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : 'na')
          .end()
        .end();
      },
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      label: 'Sender',
      visibility: 'RO',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : 'na')
          .end()
        .end();
      },

    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      targetDAOKey: 'localAccountDAO',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'payeeId',
      storageTransient: true,
      visibility: 'HIDDEN',
    },
    {
      class: 'Long',
      name: 'payerId',
      storageTransient: true,
      visibility: 'HIDDEN',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      targetDAOKey: 'localAccountDAO',
      visibility: 'RO',
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Amount',
      visibility: 'RO',
      Tablecellformatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      // REVIEW: why do we have total and amount?
      class: 'Currency',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        return amount;
      },
      javaGetter: `
        return getAmount();
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
    {
      class: 'Currency',
      name: 'destinationAmount',
      label: 'Destination Amount',
      description: 'Amount in Receiver Currency',
      visibility: 'RO',
      tableCellFormatter: function(destinationAmount, X) {
        var formattedAmount = destinationAmount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      // REVIEW: processDate and completionDate are Alterna specific?
      class: 'DateTime',
      name: 'processDate',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'completionDate',
      visibility: 'RO'
    },
    {
      documentation: `Defined by ISO 20220 (Pacs008)`,
      class: 'String',
      name: 'messageId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      visibility: 'RO',
      value: 'CAD'
    },
    {
      documentation: `referenceData holds entities such as the pacs008 message.`,
      name: 'referenceData',
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      storageTransient: true,
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      visibility: 'RO',
      value: 'CAD'
    },
    {
      class: 'String',
      name: 'paymentMethod'
    },
    {
      name: 'next',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    // schedule TODO: future
    {
      name: 'scheduled',
      class: 'DateTime',
      visibility: 'RO'
    },
    {
      name: 'lineItems',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      visibility: 'RO'
    },
    {
      name: 'reverseLineItems',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      visibility: 'RO'
   }
  ],

  methods: [
    {
      name: 'limitedClone',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaReturns: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        if ( oldTxn == null ) return this;
        Transaction newTx = (Transaction) oldTxn.fclone();
        newTx.limitedCopyFrom(this);
        return newTx;
      `,
      documentation: 'Updates only the properties that were specified in limitedCopy method'
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
      `
    },
    {
      name: 'isActive',
      javaReturns: 'boolean',
      javaCode: `
         return false;
      `
    },
    {
      name: 'add',
      code: function add(transferArr) {
        this.transfers = this.transfers.concat(transferArr);
      },
      args: [
        {
          name: 'transferArr',
          javaType: 'Transfer[]'
        }
      ],
      javaCode: `
        Transfer[] queued = getTransfers();
        synchronized (queued) {
          Transfer[] replacement = Arrays.copyOf(queued, queued.length + transferArr.length);
          System.arraycopy(transferArr, 0, replacement, queued.length, transferArr.length);
          setTransfers(replacement);
        }
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
        if ( getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED &&
             ( oldTxn == null ||
               ( oldTxn != null &&
                 oldTxn.getStatus() != getStatus() ) ) ) {
          return true;
        }
        return false;
      `
    },
    {
      documentation: `return true when status change is such that reveral Transfers should be executed (applied)`,
      name: 'canReverseTransfer',
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
        return false;
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
            all.add(transfers[j]);
          }
        }
        // all.add(new Transfer.Builder(x)
        //   .setDescription("Base transaction")
        //   .setAccount(getSourceAccount())
        //   .setAmount(-getTotal())
        //   .build());
        // all.add( new Transfer.Builder(getX())
        //     .setDescription("Base transaction")
        //     .setAccount(getDestinationAccount())
        //     .setAmount(getTotal())
        //     .build());
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
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
        sb.append("id: ");
        sb.append(getId());
        sb.append(", ");
        sb.append("status: ");
        sb.append(getStatus());
        sb.append(")");
        return sb.toString();
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `
      AppConfig appConfig = (AppConfig) x.get("appConfig");
      DAO userDAO = (DAO) x.get("bareUserDAO");
      if ( getSourceAccount() == 0 ) {
        throw new RuntimeException("sourceAccount must be set");
      }

      if ( getDestinationAccount() == 0 ) {
        throw new RuntimeException("destinationAccount must be set");
      }

      User sourceOwner = (User) userDAO.find(findSourceAccount(x).getOwner());
      if ( sourceOwner == null ) {
        throw new RuntimeException("Payer user with id " + findSourceAccount(x).getOwner() + " doesn't exist");
      }

      if ( sourceOwner instanceof Business && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED) && ! (this instanceof AlternaVerificationTransaction) ) {
        throw new RuntimeException("Sender or receiver needs to pass business compliance.");
      }

      User destinationOwner = (User) userDAO.find(findDestinationAccount(x).getOwner());
      if ( destinationOwner == null ) {
        throw new RuntimeException("Payee user with id "+ findDestinationAccount(x).getOwner() + " doesn't exist");
      }

      if ( ! sourceOwner.getEmailVerified() ) {
        throw new AuthorizationException("You must verify email to send money.");
      }

      if ( ! (destinationOwner instanceof Contact) && ! destinationOwner.getEmailVerified() ) {
        throw new AuthorizationException("Receiver must verify email to receive money.");
      }

      if ( getAmount() < 0) {
        throw new RuntimeException("Amount cannot be negative");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getSourceCurrency()) == null ) {
        throw new RuntimeException("Source currency is not supported");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getDestinationCurrency()) == null ) {
        throw new RuntimeException("Destination currency is not supported");
      }

      if ( appConfig.getMode() == Mode.PRODUCTION ) {
        if ( getTotal() > 7500000 ) {
          throw new AuthorizationException("Transaction limit exceeded.");
        }
      }
      `
    },
    {
      name: 'sendCompletedNotification',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldTxn', javaType: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      `
    },
    {
      name: 'sendReverseNotification',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldTxn', javaType: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      `
    },
    {
      documentation: 'Returns childrens status.',
      name: 'getState',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'net.nanopay.tx.model.TransactionStatus',
      javaCode: `
      if ( getStatus() != TransactionStatus.COMPLETED ) {
        return getStatus();
      }
      List children = ((ArraySink) getChildren(x).select(new ArraySink())).getArray();
      for ( Object obj : children ) {
        Transaction txn = (Transaction) obj;
        TransactionStatus curState = txn.getState(x);
        if ( curState != TransactionStatus.COMPLETED ) {
          return curState;
        }
      }
      return getStatus();
      `
    },
    {
      name: 'addLineItems',
      code: function addLineItems(forward, reverse) {
        if ( Array.isArray(forward) && forward.length > 0 ) {
          this.lineItems = copyLineItems(forward, this.lineItems);
        }

        if ( Array.isArray(reverse) && reverse.length > 0 ) {
          this.reverseLineItems = copyLineItems(reverse, this.reverseLineItems);
        }
      },
      args: [
        { name: 'forward', javaType: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'reverse', javaType: 'net.nanopay.tx.TransactionLineItem[]' }
      ],
      javaCode: `
    if ( forward != null && forward.length > 0 ) {
      setLineItems(copyLineItems(forward, getLineItems()));
    }
    if ( reverse != null && reverse.length > 0 ) {
      setReverseLineItems(copyLineItems(forward, getReverseLineItems()));
    }
`
    },
    {
      name: 'copyLineItems',
      code: function copyLineItems(from, to) {
      if ( from.length > 0 ) {
          to = to.concat(from);
        }
        return to;
      },
      args: [
        { name: 'from', javaType: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'to', javaType: 'net.nanopay.tx.TransactionLineItem[]' },
     ],
      javaReturns: 'net.nanopay.tx.TransactionLineItem[]',
      javaCode: `
      if ( from.length > 0 ) {
        TransactionLineItem[] replacement = Arrays.copyOf(to, to.length + from.length);
        System.arraycopy(from, 0, replacement, to.length, from.length);
        return replacement;
      }
      return to;
    `
    },
    {
      name: 'getCost',
      code: function getCost() {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( this.FeeLineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].amount;
          }
        }
        return value;
      },
      javaReturns: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof FeeLineItem ) {
            value += (Long) ((FeeLineItem)lineItem).getAmount();
          }
        }
        return value;
`
    },
    {
      name: 'getEta',
      code: function getEta() {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( this.ETALineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].eta;
          }
        }
        return value;
      },
      javaReturns: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof ETALineItem ) {
            value += (Long) ((ETALineItem)lineItem).getEta();
          }
        }
        return value;
`
    },
    {
      name: 'addNext',
      args: [
        { name: 'txn', javaType: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      Transaction tx = this;
      while( tx.getNext() != null ) {
        tx = tx.getNext();
      }
      txn.setInitialStatus(txn.getStatus());
      txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
      tx.setNext(txn);
    `
  },
  {
    documentation: `Method to execute additional logic for each transaction before it was written to journals`,
    name: 'executeBeforePut',
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
    javaReturns: 'Transaction',
    javaCode: `
    Transaction ret = checkQuoted(x).limitedClone(x, oldTxn);
    ret.validate(x);
    return ret;
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
    sendReverseNotification(x, oldTxn);
    sendCompletedNotification(x, oldTxn);
    checkLiquidity(x);
    `
  },
  {
    documentation: `Checks if transaction was quoted. If not, submits it to transactionQuotePlanDAO`,
    name: 'checkQuoted',
    args: [
      {
        name: 'x',
        javaType: 'foam.core.X'
      }
    ],
    javaReturns: 'Transaction',
    javaCode: `
    if ( ! getIsQuoted() ) {
      TransactionQuote quote = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, new net.nanopay.tx.TransactionQuote.Builder(x).setRequestTransaction(this).build());
      if ( quote.getPlan() == null ) throw new RuntimeException("No quote was found for transaction.");
      return quote.getPlan();
    }
    return (Transaction)this.fclone();
    `
  },
  {
    documentation: `LiquidityService checks whether digital account has any min or/and max balance if so, does appropriate actions(cashin/cashout)`,
    name: 'checkLiquidity',
    args: [
      {
        name: 'x',
        javaType: 'foam.core.X'
      }
    ],
    javaCode: `
    LiquidityService ls = (LiquidityService) x.get("liquidityService");
    Account source = findSourceAccount(x);
    Account destination = findDestinationAccount(x);
    if ( source.getOwner() != destination.getOwner() ) {
      if ( source instanceof DigitalAccount ) {
        ls.liquifyAccount(source.getId(), net.nanopay.tx.model.Frequency.PER_TRANSACTION);
      }
      if ( destination instanceof DigitalAccount) {
        ls.liquifyAccount(destination.getId(), net.nanopay.tx.model.Frequency.PER_TRANSACTION);
      }
    }
    `
  }
]
});
