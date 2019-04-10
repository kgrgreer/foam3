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
import foam.nanos.logger.Logger;
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
 * Triggers on invoices that send emails are as follows:
 * 1) invoiceIsBeingPaidButNotComplete
 * 2) invoiceIsANewRecievable
 * 3) invoiceNeedsApproval
 * 4) invoiceIsBeingPaidAndCompleted 
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
  }

  private void sendEmailFunction(X x, boolean isContact, String emailTemplateName, Long invoiceId, User userBeingSentEmail, HashMap<String, Object> args, String[] sendToList) {
    if ( isContact ) {
      args.put("template", emailTemplateName);
      args.put("invoiceId", invoiceId);
      externalToken.generateTokenWithParameters(x, userBeingSentEmail, args);
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
  }

  private HashMap<String, Object> populateArgsForEmail(HashMap<String, Object> args, Invoice invoice, String name, String fromName, boolean dated) {
    args = new HashMap<>();

    args.put("name", name);
    args.put("fromName", fromName);
    args.put("account", invoice.getInvoiceNumber());

    String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
      .format(invoice.getAmount());

    args.put("currency", invoice.getDestinationCurrency());
    args.put("amount", amount);

    if ( dated ) {
      SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
      args.put("date", dateFormat.format(invoice.getDueDate()));
    }

    return args;
  }

  private String[] findApproversOftheBusiness(X x) {
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
  }
 
}
