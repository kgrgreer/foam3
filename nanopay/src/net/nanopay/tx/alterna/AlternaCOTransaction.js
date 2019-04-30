foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'java.util.Arrays',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.Transfer',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification'
  ],

  properties: [
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    {
      class: 'String',
      name: 'description',
      visibility: foam.u2.Visibility.RO
    },
  ],

  methods: [
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
        setConfirmationLineNumber(((AlternaCOTransaction)other).getConfirmationLineNumber());
        setReturnCode(((AlternaCOTransaction)other).getReturnCode());
        setReturnDate(((AlternaCOTransaction)other).getReturnDate());
        setReturnType(((AlternaCOTransaction)other).getReturnType());
        setPadType(((AlternaCOTransaction)other).getPadType());
        setTxnCode(((AlternaCOTransaction)other).getTxnCode());
        setDescription(((AlternaCOTransaction)other).getDescription());
      `
    },
    {
      name: 'isActive',
      type: 'Boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.PENDING) ||
           getStatus().equals(TransactionStatus.DECLINED);
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
        if ( canReverse(x, oldTxn) ) {
          this.createReverseTransaction(x);
        }
        return ret;
      `
    },
    {
      name: 'createReverseTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        DigitalTransaction revTxn = new DigitalTransaction.Builder(x)
          .setDestinationAccount(this.getSourceAccount())
          .setSourceAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
          .setAmount(this.getAmount())
          .setName("Reversal of: "+this.getId())
          .setIsQuoted(true)
          .build();
        revTxn.setOriginalTransaction(this.getId());

        try {
          revTxn = (DigitalTransaction) ((DAO) x.get("localTransactionDAO")).put_(x, revTxn);
          this.setReverseTransaction(revTxn.getId());
        }
        catch (Exception e) {
          Notification notification = new Notification();
          notification.setEmailIsEnabled(true);
          notification.setBody("Cash Out transaction id: " + getId() + " was declined but the balance was not restored.");
          notification.setNotificationType("Cashin transaction declined");
          notification.setGroupId("support");
          ((DAO) x.get("notificationDAO")).put(notification);
          this.setReverseTransaction(null);
        }
      `
    }
  ]
});
