package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.auth.token.TokenService;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.util.SafetyUtil;
import java.text.SimpleDateFormat;
import java.util.*;
import net.nanopay.auth.PublicUserInfo;
import net.nanopay.accounting.quickbooks.model.QuickbooksInvoice;
import net.nanopay.accounting.xero.model.XeroInvoice;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.notification.NewInvoiceNotification;
import net.nanopay.model.Currency;

/**
 * Invoice decorator for dictating and setting up new invoice notifications and emails.
 * Responsible for sending notifications to both internal and external users on invoice create.
 */
public class InvoiceNotificationDAO extends ProxyDAO {

  protected DAO bareUserDAO_;
  protected DAO notificationDAO_;
  protected DAO currencyDAO_;
  protected TokenService externalToken;

  public InvoiceNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    bareUserDAO_ = (DAO) x.get("bareUserDAO");
    notificationDAO_ = (DAO) x.get("notificationDAO");
    currencyDAO_ = (DAO) x.get("currencyDAO");
    externalToken = (TokenService) x.get("externalInvoiceToken");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    Invoice existing = (Invoice) super.find(invoice.getId());

    if ( existing == null ) {
      return super.put_(x, invoice);
    }

    PaymentStatus newStatus = invoice.getPaymentMethod();
    PaymentStatus oldStatus = existing.getPaymentMethod();
    InvoiceStatus newInvoiceStatus = invoice.getStatus();
    InvoiceStatus oldInvoiceStatus = existing.getStatus();

    boolean invoiceIsBeingPaid =
        (
          newStatus == PaymentStatus.NANOPAY ||
          newStatus == PaymentStatus.CHEQUE
        )
        &&
        (
          oldStatus == PaymentStatus.NONE ||
          oldStatus == PaymentStatus.PENDING
        );

    // boolean invoiceIsGoingThroughHoldingAccountFlow = 
    //   newStatus == PaymentStatus.DEPOSIT_MONEY && 
    //   oldStatus == PaymentStatus.DEPOSIT_PAYMENT; // TODO remove and confirm the usage of the Payment status
    
    boolean newStatusChangeToPending = 
      (oldInvoiceStatus == InvoiceStatus.UNPAID ||
      oldInvoiceStatus == InvoiceStatus.PENDING_APPROVAL) && 
      invoice.getStatus() == InvoiceStatus.PENDING;

    boolean bob = newInvoiceStatus != InvoiceStatus.DRAFT &&
      oldInvoiceStatus == InvoiceStatus.DRAFT; // TODO rename bob

    if ( newStatusChangeToPending || invoiceIsBeingPaid ) {
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        User user = invoice.findPayeeId(x);
        String emailTemplate = "invoice-paid";

        EmailService emailService = (EmailService) x.get("email");
        EmailMessage message = new EmailMessage.Builder(x)
          .setTo(new String[]{user.getEmail()})
          .build();

        PublicUserInfo payer = invoice.getPayer();

        String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
          .format(invoice.getAmount());

        HashMap<String, Object> args = new HashMap<>();
        args.put("amount", amount);
        args.put("currency", invoice.getDestinationCurrency());
        args.put("name", invoice.findPayeeId(getX()).label()); // TODO? getX() not just x
        args.put("link", appConfig.getUrl());
        args.put("fromName", invoice.findPayerId(getX()).getFirstName());
        args.put("senderCompany", invoice.findPayerId(getX()).label());

        emailService.sendEmailFromTemplate(x, user, message, emailTemplate, args);
      }
    }
    
    // Only send invoice notification if invoice does not have a status of draft
    if ( bob ) { // TODO rename bob
      // if no existing invoice has been sent OR the existing invoice was a draft, send an email
        sendInvoiceNotification(x, invoice);
    }

    return super.put_(x, invoice);
  }

  private void sendInvoiceNotification(X x, Invoice invoice) {
    long payeeId = invoice.getPayeeId();
    long payerId = invoice.getPayerId();

    NewInvoiceNotification notification = new NewInvoiceNotification();

    /*
     * If invoice is external, calls the external token service and avoids internal notifications,
     * otherwise sets email args for internal user email and creates notification.
     */
    if ( invoice.getExternal() ) {
      // Sets up required token parameters.
      long externalUserId = invoice.getContactId();
      User externalUser = (User) bareUserDAO_.find(externalUserId);
      Map tokenParams = new HashMap();
      tokenParams.put("invoice", invoice);

      externalToken.generateTokenWithParameters(x, externalUser, tokenParams);
      return;
    } else {
      User user = (User) x.get("user");

      /*
       * For original nanopay app, if current user is equal to payer, it will load
       * the 'payable' email template with `"group":"*"`.
       * For SME/Ablii, if current user is equal to payer, it will load the 'receivable'
       * email template with `"group":"sme"`.
       */
      String template = user.getId() == payerId ? "transfer-paid" : "receivable";

      // Set email values on notification.
      notification = setEmailArgs(x, invoice, notification);
      notification.setEmailName(template);
      notification.setEmailIsEnabled(user.getId() == payerId ? false : true);
    }

    notification.setUserId(payeeId == ((Long)invoice.getCreatedBy()) ? payerId : payeeId);
    notification.setInvoiceId(invoice.getId());
    notification.setNotificationType("Invoice received");
    notificationDAO_.put(notification);
  }

  private NewInvoiceNotification setEmailArgs(X x, Invoice invoice, NewInvoiceNotification notification) {
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");

    PublicUserInfo payee = invoice.getPayee();
    PublicUserInfo payer = invoice.getPayer();

    // If invType is true, then payee sends payer the email and notification.
    boolean invType = invoice.getPayeeId() == invoice.getCreatedBy();

    // Add the currency symbol and currency (CAD/USD, or other valid currency)
    String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
        .format(invoice.getAmount()) + " " + invoice.getDestinationCurrency();

    String accountVar = SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ? "N/A" : invoice.getInvoiceNumber();

    notification.getEmailArgs().put("amount", amount);
    notification.getEmailArgs().put("account", accountVar);
    notification.getEmailArgs().put("name", invType ? payer.getFirstName() : payee.getFirstName());
    notification.getEmailArgs().put("fromEmail", invType ? payee.getEmail() : payer.getEmail());
    notification.getEmailArgs().put("fromName", invType ? payee.label() : payer.label());

    if ( invoice.getDueDate() != null ) {
      notification.getEmailArgs().put("date", dateFormat.format(invoice.getDueDate()));
    }

    AppConfig appConfig = (AppConfig) x.get("appConfig");
    notification.getEmailArgs().put("link", appConfig.getUrl());
    notification.getEmailArgs().put("senderCompany", invType ? payee.getOrganization() : payer.getOrganization() );
    return notification;
  }
}
