foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.DeletedAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.analytics.Foldable',
    'foam.mlang.Expressions',
  ],

  imports: [
    'addCommas',
    'complianceHistoryDAO',
    'currencyDAO',
    'homeDenomination',
    'stack?'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.*',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.model.Business',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'static foam.mlang.MLang.EQ'
  ],

  requires: [
   'net.nanopay.tx.ETALineItem',
   'net.nanopay.tx.FeeLineItem',
   'net.nanopay.tx.TransactionLineItem',
   'net.nanopay.tx.model.TransactionStatus'
 ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      javaType: 'Set<TransactionStatus>',
      javaValue: `Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});`
    }
  ],

  searchColumns: [
    'payeeId',
    'payerId',
    'invoiceId',
    'type',
    'status',
    'sourceAccount',
    'destinationAccount',
    'created',
    'total',
    'completionDate'
  ],

  tableColumns: [
    'id',
    'type',
    'status',
    'summary',
    'created',
    'completionDate'
  ],

  sections: [
    {
      name: 'basicInfo'
    },
    {
      name: 'paymentInfo'
    },
    {
      name: 'lineItemsSection',
      title: 'Line Items',
      isAvailable: function(id, lineItems) {
        return ! id || lineItems.length;
      }
    },
    {
      name: 'reverseLineItemsSection',
      title: 'Reverse Line Items',
      isAvailable: function(reverseLineItems) {
        return reverseLineItems.length;
      }
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    },
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Scheduled',
      predicateFactory: function(e) {
        return e.EQ(net.nanopay.tx.model.Transaction.STATUS, net.nanopay.tx.model.TransactionStatus.SCHEDULED);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Pending',
      predicateFactory: function(e) {
        return e.EQ(net.nanopay.tx.model.Transaction.STATUS, net.nanopay.tx.model.TransactionStatus.PENDING);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Completed',
      predicateFactory: function(e) {
        return e.EQ(net.nanopay.tx.model.Transaction.STATUS, net.nanopay.tx.model.TransactionStatus.COMPLETED);
      }
    }
  ],


  // relationships: parent, children

  properties: [
    {
      name: 'name',
      class: 'String',
      visibility: 'RO',
      section: 'basicInfo',
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
      section: 'basicInfo',
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `,
      tableWidth: 160
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
      name: 'balances',
      class: 'FObjectArray',
      of: 'net.nanopay.account.Balance',
      javaFactory: 'return new Balance[0];',
      hidden: true
    },
    {
      class: 'String',
      name: 'id',
      label: 'ID',
      visibility: 'RO',
      section: 'basicInfo',
      javaJSONParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.json.StringParser())`,
      javaCSVParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.csv.CSVStringParser())`,
      tableWidth: 150
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the transaction was created.`,
      visibility: 'RO',
      section: 'basicInfo',
      tableWidth: 172
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the transaction.`,
      visibility: 'RO',
      section: 'basicInfo',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
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
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
   },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      visibility: 'RO',
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select invoice' }
    },
     {
      name: 'invoiceNumber',
      hidden: true,
      factory: function() {
        return this.invoiceId;
      },
      tableCellFormatter: function(value, obj) {
        var self = this;
        this.__subSubContext__.invoiceDAO.find(value).then( function( invoice ) {
          if ( invoice ) self.start().add(invoice.invoiceNumber).end();
        });
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      section: 'basicInfo',
      value: 'COMPLETED',
      permissionRequired: true,
      javaFactory: 'return TransactionStatus.COMPLETED;',
      tableWidth: 130,
      view: function(args, x) {
        self = this;
        return {
          class: 'foam.u2.view.ChoiceView',
          choices: x.data.statusChoices
        };
      }
    },
    {
      name: 'statusChoices',
      hidden: true,
      factory: function() {
        return ['No status to choose'];
      },
      documentation: 'Returns available statuses for each transaction depending on current status'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;',
      hidden: true
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
      section: 'paymentInfo',
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'na')
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
      section: 'paymentInfo',
      visibility: 'RO',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'na')
          .end()
        .end();
      }
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
      class: 'Currency',
      name: 'amount',
      section: 'paymentInfo',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'summary',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of Transactions.
      `,
      tableCellFormatter: function(_, obj) {
        this.add(obj.slot(function(
            sourceCurrency,
            destinationCurrency,
            currencyDAO,
            homeDenomination  /* Do not remove b/c the cell needs to re-render if homeDenomination changes */
          ){
            return Promise.all([
              currencyDAO.find(sourceCurrency),
              currencyDAO.find(destinationCurrency)
            ]).then(([srcCurrency, dstCurrency]) => {
              let output = "";

              if ( sourceCurrency === destinationCurrency ) {
                output += srcCurrency ? srcCurrency.format(obj.amount) : `${obj.amount} ${sourceCurrency}`;
              } else {
                output += srcCurrency ? srcCurrency.format(obj.amount) : `${obj.amount} ${sourceCurrency}`;
                output += ' → ';
                output += dstCurrency 
                            ? dstCurrency.format(obj.destinationAmount) 
                            : `${obj.destinationAmount} ${destinationCurrency}`;
              }

              if ( obj.payer ) {
                output += (' | ' + obj.payer.displayName + ' → ' + obj.payee.displayName);
              }

              return output;
            })
        }))
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
        return this.getAmount();
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
      documentation: 'Amount in Receiver Currency',
      section: 'paymentInfo',
      visibilityExpression: function(sourceCurrency, destinationCurrency) {
        return sourceCurrency == destinationCurrency ?
          foam.u2.Visibility.HIDDEN :
          foam.u2.Visibility.RO;
      },
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
      visibility: 'RO',
      section: 'basicInfo',
      tableWidth: 172
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
      label: 'Currency',
      visibility: 'RO',
      section: 'paymentInfo',
      value: 'CAD'
    },
    {
      documentation: `referenceData holds entities such as the pacs008 message.`,
      name: 'referenceData',
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      visibilityExpression: function(sourceCurrency, destinationCurrency) {
        return sourceCurrency == destinationCurrency ?
          foam.u2.Visibility.HIDDEN :
          foam.u2.Visibility.RO;
      },
      section: 'paymentInfo',
      value: 'CAD'
    },
    {
      class: 'String',
      name: 'paymentMethod'
    },
    {
      name: 'next',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    // schedule TODO: future
    {
      // TODO: Why do we have this and scheduledTime?
      name: 'scheduled',
      class: 'DateTime',
      section: 'basicInfo',
      visibilityExpression: function(scheduled) {
        return scheduled ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'lineItems',
      label: '',
      section: 'lineItemsSection',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      visibility: 'RO'
    },
    {
      name: 'reverseLineItems',
      label: '',
      section: 'reverseLineItemsSection',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      visibility: 'RO'
   },
   {
      class: 'DateTime',
      name: 'scheduledTime',
      section: 'basicInfo',
      visibilityExpression: function(scheduledTime) {
        return scheduledTime ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      },
      documentation: `The scheduled date when transaction should be processed.`
    },
    {
      class: 'Boolean',
      name: 'deleted',
      value: false,
      permissionRequired: true,
      visibility: 'HIDDEN'
    },
  ],

  methods: [
    {
      name: 'doFolds',
      javaCode: `
for ( Balance b : getBalances() ) {
  fm.foldForState(b.getAccount(), getLastModified(), b.getBalance());
}
      `
    },
    {
      name: 'limitedClone',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        if ( oldTxn == null || oldTxn.getStatus() == TransactionStatus.SCHEDULED ) return this;
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
          type: 'net.nanopay.tx.model.Transaction'
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
      type: 'Boolean',
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
          type: 'net.nanopay.tx.Transfer[]'
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
      documentation: `return true when status change is such that normal Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      if ( getStatus() == TransactionStatus.COMPLETED &&
      ( oldTxn == null || oldTxn.getStatus() != TransactionStatus.COMPLETED ) ) {
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
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
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
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
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

      // TODO: Move user checking to user validation service
      if ( AccountStatus.DISABLED == sourceOwner.getStatus() ) {
        throw new RuntimeException("Payer user is disabled.");
      }

      if ( sourceOwner instanceof Business && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED) && ! (this instanceof VerificationTransaction) ) {
        throw new RuntimeException("Sender or receiver needs to pass business compliance.");
      }

      User destinationOwner = (User) userDAO.find(findDestinationAccount(x).getOwner());
      if ( destinationOwner == null ) {
        throw new RuntimeException("Payee user with id "+ findDestinationAccount(x).getOwner() + " doesn't exist");
      }

      // TODO: Move user checking to user validation service
      if ( AccountStatus.DISABLED == destinationOwner.getStatus() ) {
        throw new RuntimeException("Payee user is disabled.");
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

      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && oldTxn.getStatus() != TransactionStatus.SCHEDULED && getStatus() == TransactionStatus.SCHEDULED ) {
        throw new RuntimeException("Only new transaction can be scheduled");
      }
      `
    },
    {
      name: 'sendCompletedNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      `
    },
    {
      name: 'sendReverseNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      `
    },
    {
      documentation: 'Returns childrens status.',
      name: 'getState',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'net.nanopay.tx.model.TransactionStatus',
      javaCode: `
      if ( getStatus() != TransactionStatus.COMPLETED ) {
        return getStatus();
      }
      DAO dao = (DAO) x.get("localTransactionDAO");
      List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, getId())).select(new ArraySink())).getArray();
// REVIEW: the following is very slow going through authenticated transactionDAO rather than unauthenticated localTransactionDAO
//      List children = ((ArraySink) getChildren(x).select(new ArraySink())).getArray();
      for ( Object obj : children ) {
        Transaction child = (Transaction) obj;
        TransactionStatus status = child.getState(x);
        if ( status != TransactionStatus.COMPLETED ) {
          return status;
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
        { name: 'forward', type: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'reverse', type: 'net.nanopay.tx.TransactionLineItem[]' }
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
        { name: 'from', type: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'to', type: 'net.nanopay.tx.TransactionLineItem[]' },
     ],
      type: 'net.nanopay.tx.TransactionLineItem[]',
      javaCode: `
      ArrayList<TransactionLineItem> list1 = new ArrayList<>(Arrays.asList(to));
      Arrays.asList(from).forEach((item) -> {
        boolean hasItem = list1.stream().filter(t -> t.getId().equals(item.getId())).toArray().length != 0;
        if (! hasItem) {
          list1.add(item);
        }
      });
      return list1.toArray(new TransactionLineItem[list1.size()]);
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
      type: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof FeeLineItem ) {
            value += (Long) ((FeeLineItem) lineItem).getAmount();
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
      type: 'Long',
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
      documentation: 'For adding multiple child transactions use CompositeTransaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      Transaction tx = this;
      if ( tx.getNext() != null && tx.getNext().length >= 1 ) {
         if ( tx.getNext().length > 1) throw new RuntimeException("Error, this non-Composite transaction has more then 1 child");
         Transaction [] t = tx.getNext();
         t[0].addNext(txn);
      }
      else {
        txn.setInitialStatus(txn.getStatus());
        txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
        Transaction [] t2 = new Transaction [1];
        t2[0] = txn;
        tx.setNext(t2);
      }
    `
  },
  {
    documentation: `Method to execute additional logic for each transaction before it was written to journals`,
    name: 'executeBeforePut',
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'oldTxn',
        type: 'net.nanopay.tx.model.Transaction'
      }
    ],
    type: 'net.nanopay.tx.model.Transaction',
    javaCode: `
    Transaction ret = limitedClone(x, oldTxn);
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
        type: 'Context'
      },
      {
        name: 'oldTxn',
        type: 'net.nanopay.tx.model.Transaction'
      }
    ],
    javaCode: `
    try {
      sendReverseNotification(x, oldTxn);
      sendCompletedNotification(x, oldTxn);
    } catch (Exception e) {
      Logger logger = (Logger) x.get("logger");
      logger.warning("Transaction failed to send notitfication. " + e.getMessage());
    }
    `
  },
  {
    name: 'getTransactionConfirmation',
    args: [
      { name: 'x', type: 'Context' },
    ],
    type: 'String',
    javaCode: `
    return "";
    `
  },
],
  actions: [
    {
      name: 'viewComplianceHistory',
      label: 'View Compliance History',
      availablePermissions: ['service.compliancehistorydao'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        this.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.id}'s Compliance History`,
          data: this.complianceHistoryDAO.where(m.AND(
            m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id),
            m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'localTransactionDAO')
          ))
        });
      }
    }
  ]
});
