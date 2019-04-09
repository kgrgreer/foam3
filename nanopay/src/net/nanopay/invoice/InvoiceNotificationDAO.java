package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.token.TokenService;
import foam.nanos.auth.UserUserJunction;
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
import static foam.mlang.MLang.*;
import foam.mlang.predicate.ContainsIC;

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
    // Gathering Variables and checking null objects
    if ( obj == null ) return obj;

    Invoice invoice  = (Invoice) obj;
    Invoice oldInvoice = (Invoice) super.find(invoice.getId());

    User payerUser = (User) invoice.findPayerId(x);
    User payeeUser = (User) invoice.findPayeeId(x);

    InvoiceStatus newInvoiceStatus = invoice.getStatus();
    InvoiceStatus oldInvoiceStatus = oldInvoice != null ? oldInvoice.getStatus() : null;

    if ( newInvoiceStatus == null ) return obj;

    // Various condition checks
    boolean invoiceIsBeingPaidButNotComplete = 
      (
        oldInvoiceStatus == null || oldInvoiceStatus != InvoiceStatus.PENDING
      ) && 
      (
        newInvoiceStatus == InvoiceStatus.PENDING
      ) && 
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
      invoice.getCreatedBy() == invoice.getPayeeId();

    // Performing Actions based on whats been set to true.
    if ( invoiceIsBeingPaidButNotComplete || invoiceIsBeingPaidAndCompleted || invoiceNeedsApproval || invoiceIsARecievable ) {

        // AppConfig appConfig = (AppConfig) x.get("appConfig");

        String[] emailTemplate = { "payable", "receivable", "invoice-approval-email", "payment-made-complete-email" };
        EmailService emailService = (EmailService) x.get("email");
        EmailMessage message = null;
        HashMap<String, Object> args = null;
        boolean invoiceIsToAnExternalUser = invoice.getExternal();

      // ONE
      if ( invoiceIsBeingPaidButNotComplete ) {
        // Email going to the payeeUser
        Group group = (Group) payeeUser.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
      
        args = new HashMap<>();
        args.put("name", payeeUser.getFirstName());
        args.put("fromName", payerUser.label());
        args.put("account", invoice.getInvoiceNumber());
        args.put("date", dateFormat.format(invoice.getDueDate()));

        String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
          .format(invoice.getAmount());

        args.put("currency", invoice.getDestinationCurrency());
        args.put("amount", amount);

        if ( invoiceIsToAnExternalUser ) {
          args.put("template", emailTemplate[0]);
          args.put("invoiceId", invoice.getId());
          externalToken.generateTokenWithParameters(x, payeeUser, args);
        } else {
          args.put("link", appConfig.getUrl().replaceAll("/$", ""));
          message = new EmailMessage.Builder(x)
            .setTo(new String[] { payeeUser.getEmail() })
            .build();
          emailService.sendEmailFromTemplate(x, payeeUser, message, emailTemplate[0], args);
        }
      }

      // TWO
      if ( invoiceIsARecievable ) {
        // Email going to the payerUser
        Group group = (Group) payerUser.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
      
        args = new HashMap<>();
        args.put("name", payerUser.getFirstName());
        args.put("fromName", payeeUser.label());
        args.put("account", invoice.getInvoiceNumber());
        args.put("date", dateFormat.format(invoice.getDueDate()));

        String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
          .format(invoice.getAmount());

        args.put("currency", invoice.getDestinationCurrency());
        args.put("amount", amount);

        if ( invoiceIsToAnExternalUser ) {
          args.put("template", emailTemplate[1]);
          args.put("invoiceId", invoice.getId());
          externalToken.generateTokenWithParameters(x, payerUser, args);
        } else {
          args.put("link", appConfig.getUrl().replaceAll("/$", ""));
          message = new EmailMessage.Builder(x)
            .setTo(new String[] { payerUser.getEmail() })
            .build();
          emailService.sendEmailFromTemplate(x, payerUser, message, emailTemplate[1], args);
        }
      }

      // THREE  
      if ( invoiceNeedsApproval ) {
        // Email going to the Approvers of created by 
        Group group = (Group) payerUser.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
      
        args = new HashMap<>();
        args.put("name", payerUser.getFirstName());
        args.put("fromName", payeeUser.label());
        args.put("account", invoice.getInvoiceNumber());
        args.put("date", dateFormat.format(invoice.getDueDate()));

        String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
          .format(invoice.getAmount());

        args.put("currency", invoice.getDestinationCurrency());
        args.put("amount", amount);
        args.put("link", appConfig.getUrl().replaceAll("/$", ""));

        message = new EmailMessage.Builder(x)
            .setTo(findApproversOftheBusiness(x))
            .build();
        emailService.sendEmailFromTemplate(x, payerUser, message, emailTemplate[2], args);
      }
    }
    return super.put_(x, invoice);
  }

  private String[] findApproversOftheBusiness(X x) {
    // Need to find all approvers and admins in a business
    User user = (User) x.get("user");
    DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    DAO userDAO = (DAO) x.get("localUserDAO");
    int indexCount = 0;
    User tempUser = null;
    List<String> listOfApprovers = new ArrayList();

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
      tempUser = (User) userDAO.find(obj.getSourceId());
      listOfApprovers.add((tempUser != null ? tempUser.getEmail() : ""));
    }

    return listOfApprovers.toArray(new String[listOfApprovers.size()]);
  }
 
}
