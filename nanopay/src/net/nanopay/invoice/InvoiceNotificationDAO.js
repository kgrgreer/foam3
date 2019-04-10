foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceNotificationDAO',

  extends: 'foam.dao.ProxyDAO',

  imports: [
    'currencyDAO',
    'externalInvoiceToken'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.TokenService',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.SafetyUtil',
    'java.text.SimpleDateFormat',
    'java.util.*',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.notification.NewInvoiceNotification',
    'net.nanopay.model.Currency',
    'static foam.mlang.MLang.*',
    'foam.mlang.predicate.ContainsIC'
  ],

  documentation: `
    /**
    * Invoice decorator for dictating and setting up new invoice notifications and emails.
    * Responsible for sending notifications to both internal and external users on invoice create.
    * Triggers on invoices that send emails are as follows:
    * 1) invoiceIsBeingPaidButNotComplete
    * 2) invoiceIsANewRecievable
    * 3) invoiceNeedsApproval
    * 4) invoiceIsBeingPaidAndCompleted 
    */
   `,

  methods: [
    {
      name: 'put_',
      javaCode: `
        // Gathering Variables and checking null objects
        if ( obj == null || ((Invoice) obj).getStatus() == null ) return obj;
    
        Invoice invoice  = (Invoice) obj;
        Invoice oldInvoice = (Invoice) super.find(invoice.getId());
    
        User payerUser = (User) invoice.findPayerId(x);
        User payeeUser = (User) invoice.findPayeeId(x);
    
        InvoiceStatus newInvoiceStatus = invoice.getStatus();
        InvoiceStatus oldInvoiceStatus = oldInvoice != null ? oldInvoice.getStatus() : null;
    
        // Various condition checks
        boolean isARecievable = invoice.getCreatedBy() == invoice.getPayeeId();
        boolean invoiceIsBeingPaidButNotComplete = 
          ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PENDING )
          && 
          ( newInvoiceStatus == InvoiceStatus.PENDING )
          && 
          invoice.getPaymentDate() != null;
        boolean invoiceIsBeingPaidAndCompleted = 
          ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PAID )
          &&
            newInvoiceStatus == InvoiceStatus.PAID
          && 
          invoice.getPaymentDate() != null;
        boolean invoiceNeedsApproval = 
            ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PENDING_APPROVAL )
          &&
            newInvoiceStatus == InvoiceStatus.PENDING_APPROVAL;
        boolean invoiceIsARecievable = 
          ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.UNPAID ) 
          &&
            newInvoiceStatus == InvoiceStatus.UNPAID
          &&
          isARecievable;
    
        // Performing Actions based on whats been set to true.
        if ( invoiceIsBeingPaidButNotComplete || invoiceIsARecievable || invoiceNeedsApproval || invoiceIsBeingPaidAndCompleted ) {
          String[] emailTemplates = { "payable", "receivable", "invoice-approval-email", "invoice-transaction-completed" };
          HashMap<String, Object> args = null;
          boolean invoiceIsToAnExternalUser = invoice.getExternal();
    
          // ONE
          if ( invoiceIsBeingPaidButNotComplete ) {
            args = populateArgsForEmail(args, invoice, payeeUser.getFirstName(), payerUser.label(), true);
            sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[0], invoice.getId(),  payeeUser, args, (new String[] { payeeUser.getEmail() }) );
          }
          // TWO
          if ( invoiceIsARecievable ) {
            args = populateArgsForEmail(args, invoice, payerUser.getFirstName(), payeeUser.label(), true);
            sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[1], invoice.getId(),  payerUser, args, (new String[] { payerUser.getEmail() }) );
          }
          // THREE  
          if ( invoiceNeedsApproval ) {
            args = populateArgsForEmail(args, invoice, payeeUser.getFirstName(), "", true);
            sendEmailFunction(x, false, emailTemplates[2], invoice.getId(),  payeeUser, args, findApproversOftheBusiness(x));
          }
          // FOUR 
          if ( invoiceIsBeingPaidAndCompleted ) {
            args = populateArgsForEmail(args, invoice, payeeUser.getFirstName(), payerUser.label(), false);
            sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[3], invoice.getId(),  payeeUser, args, (new String[] { payeeUser.getEmail() }) );
          }
        }
        return super.put_(x, invoice);
      `
    },
    {
      name: 'sendEmailFunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'isContact',
          class: 'Boolean'
        },
        {
          name: 'emailTemplateName',
          class: 'String'
        },
        {
          name: 'invoiceId',
          class: 'Long'
        },
        {
          name: 'userBeingSentEmail',
          class: 'User'
        },
        {
          name: 'args',
          class: 'Map'
        },
        {
          name: 'sendToList',
          class: 'StringArray'
        }
      ],
      javaCode: `
        if ( isContact ) {
          args.put("template", emailTemplateName);
          args.put("invoiceId", invoiceId);
          getExternalInvoiceToken().generateTokenWithParameters(x, userBeingSentEmail, args);
        } else {
          EmailService emailService = (EmailService) x.get("email");
          Group group = (Group) userBeingSentEmail.findGroup(x);
          AppConfig appConfig = group.getAppConfig(x);
    
          args.put("link", appConfig.getUrl().replaceAll("/$", ""));
          EmailMessage message = new EmailMessage.Builder(x)
            .setTo(sendToList)
            .build();
          emailService.sendEmailFromTemplate(x, userBeingSentEmail, message, emailTemplateName, args);
        }
      `
    },
    {
      name: 'populateArgsForEmail',
      type: 'Map',
      args: [
        {
          name: 'args',
          class: 'Map'
        },
        {
          name: 'invoice',
          class: 'Invoice'
        },
        {
          name: 'name',
          class: 'String'
        },
        {
          name: 'fromName',
          class: 'String'
        },
        {
          name: 'dated',
          class: 'Boolean'
        }
      ],
      javaCode: `
        args = new HashMap<>();

        args.put("name", name);
        args.put("fromName", fromName);
        args.put("account", invoice.getInvoiceNumber());
    
        String amount = ((Currency) getCurrencyDAO().find(invoice.getDestinationCurrency()))
          .format(invoice.getAmount());
    
        args.put("currency", invoice.getDestinationCurrency());
        args.put("amount", amount);
    
        if ( dated ) {
          SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
          args.put("date", dateFormat.format(invoice.getDueDate()));
        }
    
        return args;
      `
    },
    {
      name: 'findApproversOftheBusiness',
      type: 'StringArray',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        // Need to find all approvers and admins in a business
        DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
        PublicUserInfo tempUser = null;
        List<String> listOfApprovers = new ArrayList();
        User user = (User) x.get("user");
        if ( user == null ) {
          ((Logger) x.get("logger")).error("@InvoiceNotificationDAO and context user is null", new Exception());
        }
    
        // currently the only sme group that can not approve an invoice is employees
        List<UserUserJunction> arrayOfUsersRelatedToBusinss = ((ArraySink) agentJunctionDAO
          .where(
            AND(
              EQ(UserUserJunction.TARGET_ID, user.getId()),
              OR(
                CONTAINS_IC( UserUserJunction.GROUP, "admin"),
                CONTAINS_IC(UserUserJunction.GROUP, "approver")
                )
              )
            ).select(new ArraySink())).getArray();
    
        for ( UserUserJunction obj : arrayOfUsersRelatedToBusinss ) {
          tempUser = (PublicUserInfo) obj.getPartnerInfo();
          listOfApprovers.add((tempUser != null ? tempUser.getEmail() : ""));
        }
    
        return listOfApprovers.toArray(new String[listOfApprovers.size()]);
      `
    }
  ]
});
