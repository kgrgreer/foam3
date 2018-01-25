foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  imports: [
    'userDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'java.util.*',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.cico.model.TransactionStatus',
    'net.nanopay.cico.model.TransactionType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'Transaction ID'
    },
    {
      class: 'Long',
      name: 'refundTransactionId'
    },
    {
      class: 'Long',
      name: 'invoiceId'
    },
    {
      class: 'String',
      name: 'status',
      value: 'Completed'
    },
    {
      class: 'String',
      name: 'referenceNumber'
    },
    {
      class: 'Long',
      name: 'impsReferenceNumber',
      label: 'IMPS Reference Number'
    },
    {
      class: 'String',
      name: 'payerName'
    },
    {
      class: 'Long',
      name: 'payerId',
      label: 'Payer',
      tableCellFormatter: function(payerId, X) {
        var self = this;
        X.userDAO.find(payerId).then(function(payer) {
          self.start()
            .start('h4').style({ 'margin-bottom': 0 }).add(payer.firstName).end()
            .start('p').style({ 'margin-top': 0 }).add(payer.email).end()
          .end();
        })
      },
      postSet: function(oldValue, newValue){
        var self = this;
        var dao = this.__context__.userDAO;
        dao.find(newValue).then(function(a) {
          if ( a ) {
            self.payerName = a.label();
          } else {
            self.payerName = 'Unknown Id: ' + newValue;
          }
        });
      }
    },
    {
      class: 'String',
      name: 'payeeName'
    },
    {
      class: 'Long',
      name: 'payeeId',
      label: 'Payee',
      tableCellFormatter: function(payeeId, X) {
        var self = this;
        X.userDAO.find(payeeId).then(function(payee) {
          self.start()
            .start('h4').style({ 'margin-bottom': 0 }).add(payee.firstName).end()
            .start('p').style({ 'margin-top': 0 }).add(payee.email).end()
          .end();
        })
      },
      postSet: function(oldValue, newValue){
        var self = this;
        var dao = this.__context__.userDAO;
        dao.find(newValue).then(function(a) {
          if ( a ) {
            self.payeeName = a.label();
          } else {
            self.payeeName = 'Unknown Id: ' + newValue;
          }
        });
      }
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Amount',
      tableCellFormatter: function(amount) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', formattedAmount.toFixed(2))
          .end();
      }
    },
    {
      class: 'Currency',
      name: 'receivingAmount',
      label: 'Receiving Amount',
      transient: true,
      expression: function(amount, rate) {
        var receivingAmount = amount * rate;
        return receivingAmount;
      },
      tableCellFormatter: function(receivingAmount) {
        this
          .start({ class: 'foam.u2.tag.Image', data: 'images/india.svg' })
            .add(' INR ₹', ( receivingAmount/100 ).toFixed(2))
          .end();
      }
    },
    {
      class: 'String',
      name: 'challenge',
      documentation: 'Randomly generated challenge'
    },
    {
      class: 'DateTime',
      name: 'date',
      label: 'Date & Time'
    },
    {
      class: 'Currency',
      name: 'tip'
    },
    {
      class: 'Double',
      name: 'rate',
      tableCellFormatter: function(rate){
        this.start().add(rate.toFixed(2)).end()
      }
    },
    {
      class: 'FObjectArray',
      name: 'feeTransactions',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'FObjectArray',
      name: 'informationalFees',
      of: 'net.nanopay.tx.model.Fee'
    },
    // TODO: field for tax as well? May need a more complex model for that
    {
      class: 'Currency',
      name: 'total',
      label: 'Amount',
      transient: true,
      expression: function (amount, tip) {
        return amount + tip;
      },
      javaGetter: `return getAmount() + getTip();`,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start().addClass( X.status == 'Refund' || X.status == 'Refunded' ? 'amount-Color-Red' : 'amount-Color-Green' )
            .add('$', formattedAmount.toFixed(2))
          .end();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionPurpose',
      name: 'purpose',
      documentation: 'Transaction purpose'
    },
    {
      class: 'String',
      name: 'notes',
      documentation: 'Transaction notes'
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        { name: 'x',   javaType: 'foam.core.X' },
        { name: 'dao', javaType: 'DAO' }
      ],
      javaReturns: 'void',
      javaCode: `
        // don't perform balance transfer if status in blacklist
        // TODO:
        // if ( STATUS_BLACKLIST.contains(getStatus()) ) return;

        DAO             accountDAO      = (DAO) x.get("localAccountDAO");
        DAO             userDAO         = (DAO) x.get("localUserDAO");
        DAO             invoiceDAO      = (DAO) x.get("invoiceDAO");
        TransactionType transactionType = (TransactionType) getType();

        // TODO: move out of transaction to own decorator
        if ( getDate() == null ) {
          setDate(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
        }

        long payeeId = getPayeeId();
        long payerId = getPayerId();

        if ( payerId <= 0 ) {
          throw new RuntimeException("Invalid Payer id");
        }

        if ( payeeId <= 0 ) {
          throw new RuntimeException("Invalid Payee id");
        }

        // For cico transactions payer and payee are the same
        if ( payeeId == payerId ) {
          if ( transactionType != TransactionType.CASHOUT && transactionType != TransactionType.CASHIN ) {
            throw new RuntimeException("PayeeID and PayerID cannot be the same");
          }
        }

        if ( getTotal() <= 0 ) {
          throw new RuntimeException("Transaction amount must be greater than 0");
        }

        Long firstLock  = payerId < payeeId ? payerId : payeeId;
        Long secondLock = payerId > payeeId ? payerId : payeeId;

        synchronized (firstLock) {
          synchronized (secondLock) {
            Sink sink;
            List data;
            Account payeeAccount;
            Account payerAccount;
            User payee = (User) userDAO.find(payeeId);
            User payer = (User) userDAO.find(payerId);

            if ( payee == null || payer == null ) {
              throw new RuntimeException("Users not found");
            }

            // find payee account
            payeeAccount = (Account) accountDAO.find(payeeId);
            if ( payeeAccount == null ) {
              throw new RuntimeException("Payee account not found");
            }

            // find payer account
            payerAccount = (Account) accountDAO.find(payerId);
            if ( payerAccount == null ) {
              throw new RuntimeException("Payer account not found");
            }

            // check if payer account has enough balance
            long total = getTotal();

            // cashin does not require balance checks
            if ( payerAccount.getBalance() < total ) {
              if ( transactionType != TransactionType.CASHIN ) {
                throw new RuntimeException("Insufficient balance to complete transaction.");
              }
            }

            // For cash in, just increment balance, payer and payee will be the same
            if ( transactionType == TransactionType.CASHIN ) {
              payerAccount.setBalance(payerAccount.getBalance() + total);
              accountDAO.put(payerAccount);
            }
            // For cash out, decrement balance, payer and payee will be the same
            else if ( transactionType == TransactionType.CASHOUT ) {
              payerAccount.setBalance(payerAccount.getBalance() - total);
              accountDAO.put(payerAccount);
            }
            else {
              payerAccount.setBalance(payerAccount.getBalance() - total);
              payeeAccount.setBalance(payeeAccount.getBalance() + total);
              accountDAO.put(payerAccount);
              accountDAO.put(payeeAccount);
            }

            // TODO: move to separate decorator
            FObject ret = dao.put_(x, this);

            // find invoice
            if ( getInvoiceId() != 0 ) {
              Invoice invoice = (Invoice) invoiceDAO.find(getInvoiceId());
              if ( invoice == null ) {
                throw new RuntimeException("Invoice not found");
              }

              invoice.setPaymentId(getId());
              invoice.setPaymentDate(getDate());
              invoice.setPaymentMethod(PaymentStatus.CHEQUE);
              invoiceDAO.put(invoice);
              // addInvoiceCashout( x, payee, total, payeeId, payerId );
            }

            //return ret;
          }
        }
      `
    }
  ]
});
