foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXSummaryTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Transaction used as a summary to for AFEX BMO transactions`,

  methods: [
    {
     documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
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
    name: 'sendCompletedNotification',
    args: [
      { name: 'x', type: 'Context' },
      { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
    ],
    javaCode: `
      if ( getStatus() != TransactionStatus.COMPLETED || getInvoiceId() == 0 ) return;

      DAO localUserDAO = (DAO) x.get("localUserDAO");
      DAO notificationDAO = (DAO) x.get("localNotificationDAO");
      Invoice invoice = this.findInvoiceId(x);

      User sender = findSourceAccount(x).findOwner(x);
      User receiver = (User) localUserDAO.find(findDestinationAccount(x).getOwner());

      DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
      Currency currency = (Currency) currencyDAO.find(getDestinationCurrency());

      if ( currency == null ) {
        throw new RuntimeException("Destination currency should not be null.");
      }

      StringBuilder sb = new StringBuilder(sender.label())
        .append(" just initiated a payment to ")
        .append(receiver.label())
        .append(" for ")
        .append(currency.format(getAmount()))
        .append(" ")
        .append(getDestinationCurrency());

      if (
        invoice.getInvoiceNumber() != null &&
        ! SafetyUtil.isEmpty(invoice.getInvoiceNumber())
      ) {
        sb.append(" on Invoice#: ")
          .append(invoice.getInvoiceNumber());
      }

      if ( invoice.getPurchaseOrder().length() > 0 ) {
        sb.append(" and P.O: ");
        sb.append(invoice.getPurchaseOrder());
      } 

      sb.append(".");
      String notificationMsg = sb.toString();

      // notification to sender
      Notification senderNotification = new Notification();
      senderNotification.setUserId(sender.getId());
      senderNotification.setBody(notificationMsg);
      senderNotification.setNotificationType("Transaction Initiated");
      senderNotification.setIssuedDate(invoice.getIssueDate());
      notificationDAO.put_(x, senderNotification);

      // notification to receiver
      if ( receiver.getId() != sender.getId() ) {
        Notification receiverNotification = new Notification();
        receiverNotification.setUserId(receiver.getId()); 
        receiverNotification.setBody(notificationMsg);
        receiverNotification.setNotificationType("Transaction Initiated");
        receiverNotification.setIssuedDate(invoice.getIssueDate());
        notificationDAO.put_(x, receiverNotification);
      }
    `
  }
 ]

});
