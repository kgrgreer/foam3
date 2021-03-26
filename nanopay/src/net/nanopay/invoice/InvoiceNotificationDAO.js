/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceNotificationDAO',

  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.token.TokenService',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.email.EmailMessage',

    'java.text.SimpleDateFormat',
    'java.util.*',

    'net.nanopay.invoice.model.BillingInvoice',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  documentation: `
    Invoice decorator for dictating and setting up new invoice notifications and emails.
    Responsible for sending notifications to both internal and external users on invoice create.
    Triggers on invoices that send emails are as follows:
    1) invoiceIsBeingPaidButNotComplete
    2) invoiceIsANewRecievable
    3) invoiceNeedsApproval
    4) invoiceIsBeingPaidAndCompleted
  `,

  methods: [
    {
      name: 'put_',
      javaCode: `
        // Gathering Variables and checking null objects
        if ( obj == null || ((Invoice) obj).getStatus() == null ) return obj;

        Invoice invoice = (Invoice) obj;
        Invoice oldInvoice = (Invoice) super.find(invoice.getId());
        Subject subject = ((Subject) x.get("subject"));
        User agent = subject.getRealUser();
        User user = subject.getUser();

        String agentName = agent != user ? agent.getFirstName() + " " + agent.getLastName() : null;

        // CPF-1322 showed an issue with an invoice not being saved in dao due to error down chain
        // thus confirm invoice put first.
        invoice = (Invoice) super.put_(x, invoice);
        if ( invoice == null ) return invoice;

        User payerUser = (User) invoice.findPayerId(x);
        User payeeUser = (User) invoice.findPayeeId(x);

        boolean isPayerABusiness = (invoice.findPayerId(x) instanceof Business);
        boolean isPayeeABusiness = (invoice.findPayeeId(x) instanceof Business);

        String businessName = payeeUser instanceof Business ? payeeUser.getBusinessName() : payeeUser.getOrganization();

        InvoiceStatus newInvoiceStatus = invoice.getStatus();
        InvoiceStatus oldInvoiceStatus = oldInvoice != null ? oldInvoice.getStatus() : null;

        // Various condition checks
        boolean invoiceHasBeenMarkedComplete =
          ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PAID )
          &&
          invoice.getPaymentMethod() == PaymentStatus.CHEQUE; //PaymentStatus.CHEQUE is used when we 'Mark as Complete'

        boolean isARecievable = user.getId() == invoice.getPayeeId();
        boolean invoiceIsBeingPaidButNotComplete =
          ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PROCESSING )
          &&
          ( newInvoiceStatus == InvoiceStatus.PROCESSING )
          &&
          invoice.getPaymentDate() != null
          &&
          invoice.isPropertySet("paymentId");
        boolean invoiceIsBeingPaidAndCompleted =
          ( oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PAID )
          &&
            newInvoiceStatus == InvoiceStatus.PAID
          &&
          invoice.getPaymentDate() != null
          &&
          invoice.getPaymentMethod() != PaymentStatus.CHEQUE; //PaymentStatus.CHEQUE is used when we 'Mark as Complete'
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
        boolean invoiceIsPartOfFeesScheduledInvoice =
          oldInvoiceStatus == null
          &&
          newInvoiceStatus == InvoiceStatus.SCHEDULED;

        // Performing Actions based on whats been set to true.
        if ( invoiceIsBeingPaidButNotComplete || invoiceIsARecievable || invoiceNeedsApproval || invoiceIsBeingPaidAndCompleted || invoiceHasBeenMarkedComplete || invoiceIsPartOfFeesScheduledInvoice) {
          String[] emailTemplates = { "payable", "receivable", "invoice-approval-email", "invoice-transaction-completed", "mark-as-complete", "scheduledEmail" };
          HashMap<String, Object> args = null;
          boolean invoiceIsToAnExternalUser = invoice.getExternal();
          DAO currencyDAO = (DAO) x.get("currencyDAO");
          TokenService externalInvoiceToken = (TokenService) x.get("externalInvoiceToken");

          // FIELD LIST FOR:
          // populateArgsForEmail(args(Map), invoice, fromName, dueDate(bool), currencyDAO, agentName, invoiceType)
          // sendEmailFunction(x, isContact, emailTemplateName, invoiceId, userBeingSentEmail, args(Map), externalInvoiceToken)

          try {
            if ( invoiceIsBeingPaidButNotComplete ) {
              args = populateArgsForEmail(args, invoice, payerUser.toSummary(), invoice.getCreated(), currencyDAO, agentName, null);
              sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[0], invoice.getId(), payeeUser, args, externalInvoiceToken );
            }
            if ( invoiceIsARecievable ) {
              args = populateArgsForEmail(args, invoice, payeeUser.toSummary(), invoice.getDueDate(), currencyDAO, agentName, null);
              sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[1], invoice.getId(), payerUser, args, externalInvoiceToken );
            }
            if ( invoiceNeedsApproval ) {
              User tempApprover = null;
              User currentUser = ((Subject) x.get("subject")).getUser();
              List<UserUserJunction> approvers = findApproversOftheBusiness(x);
              DAO userDAO = (DAO) x.get("userDAO");
              for ( UserUserJunction approver : approvers ) {
                if ( args != null ) args.clear();
                tempApprover = (User) userDAO.find(approver.getPartnerId());
                if ( tempApprover == null ) continue;
                args = populateArgsForEmail(args, invoice, agent.getFirstName(), invoice.getDueDate(), currencyDAO, agentName, null);
                args.put("paymentTo", payeeUser.toSummary());
                sendEmailFunction(x, false, emailTemplates[2], invoice.getId(), tempApprover, args, externalInvoiceToken);
              }
            }
            if ( invoiceIsBeingPaidAndCompleted ) {
              args = populateArgsForEmail(args, invoice, payerUser.toSummary(), invoice.getPaymentDate(), currencyDAO, agentName, null);
              sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[3], invoice.getId(), payeeUser, args, externalInvoiceToken );
            }
            if ( invoiceHasBeenMarkedComplete ) {
              args = populateArgsForEmail(args, invoice, agent.getFirstName(), invoice.getPaymentDate(), currencyDAO, agentName, "payable");
              sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[4], invoice.getId(), payerUser, args, externalInvoiceToken );
            }
            if ( invoiceIsPartOfFeesScheduledInvoice ) {
              args = populateArgsForEmail(args, invoice, payeeUser.toSummary(), invoice.getPaymentDate(), currencyDAO, agentName, null);
              sendEmailFunction(x, invoiceIsToAnExternalUser, emailTemplates[5], invoice.getId(), payerUser, args, externalInvoiceToken );
            }
          } catch (Exception e) {}
        }
        return invoice;
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
          type: 'User'
        },
        {
          name: 'args',
          class: 'Map',
          javaType: 'java.util.HashMap<String, Object>',
        },
        {
          name: 'externalInvoiceToken',
          type: 'TokenService'
        }
      ],
      javaCode: `
        Group group = (Group) userBeingSentEmail.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        args.put("link", appConfig.getUrl());
        args.put("name", User.FIRST_NAME);
        args.put("sendTo", User.EMAIL);
        args.put("invoiceId", invoiceId);

        if ( isContact ) {
          args.put("template", emailTemplateName);
          externalInvoiceToken.generateTokenWithParameters(x, userBeingSentEmail, args);
        } else {
          Notification notification = new Notification.Builder(x)
            .setBody("Invoice Notification.")
            .setNotificationType(emailTemplateName + " email.")
            .setEmailArgs(args)
            .setEmailName(emailTemplateName)
            .build();

          userBeingSentEmail.doNotify(x, notification);
        }
      `
    },
    {
      name: 'populateArgsForEmail',
      javaType: 'java.util.HashMap<String, Object>',
      args: [
        {
          name: 'args',
          class: 'Map',
          javaType: 'java.util.HashMap<String, Object>',
        },
        {
          name: 'invoice',
          type: 'Invoice'
        },
        {
          name: 'fromName',
          class: 'String'
        },
        {
          name: 'date',
          class: 'Date'
        },
        {
          name: 'currencyDAO',
          type: 'DAO'
        },
        {
          class: 'String',
          name: 'agentName'
        },
        {
          class: 'String',
          name: 'invoiceType'
        }
      ],
      javaCode: `
      HashMap<String, Object> newArgs = new HashMap<>();
      newArgs.put("agentName", agentName);
      newArgs.put("fromName", fromName);
      newArgs.put("invoiceType", invoiceType);
      newArgs.put("account", invoice.getInvoiceNumber());
      newArgs.put("transId", invoice.getPaymentId());
      newArgs.put("note", invoice.getNote());

        String amount = ((Currency) currencyDAO.find(invoice.getDestinationCurrency()))
          .format(invoice.getAmount());

        newArgs.put("currency", invoice.getDestinationCurrency());
        newArgs.put("amount", amount);

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-yyyy");
        newArgs.put("date", date != null ? dateFormat.format(date) : "n/a");

        if ( invoice instanceof BillingInvoice ) {
          BillingInvoice billingInvoice = (BillingInvoice) invoice;
          newArgs.put("billingPeriod", String.format("from %s to %s",
            dateFormat.format(billingInvoice.getBillingStartDate()),
            dateFormat.format(billingInvoice.getBillingEndDate()))
          );
        }

        return newArgs;
      `
    },
    {
      name: 'findApproversOftheBusiness',
      type: 'List<UserUserJunction>',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        // Need to find all approvers and admins in a business
        DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          ((Logger) x.get("logger")).error("@InvoiceNotificationDAO and context user is null", new Exception());
          return null;
        }

        // currently the only sme group that can not approve an invoice is employees
        return ((ArraySink) agentJunctionDAO
          .where(
            AND(
              EQ(UserUserJunction.TARGET_ID, user.getId()),
              OR(
                CONTAINS_IC(UserUserJunction.GROUP, "admin"),
                CONTAINS_IC(UserUserJunction.GROUP, "approver")
                )
              )
            ).select(new ArraySink())).getArray();
      `
    }
  ]
});
