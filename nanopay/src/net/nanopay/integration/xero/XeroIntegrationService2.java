package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.Attachment;
import com.xero.model.CurrencyCode;
import com.xero.model.InvoiceType;

import com.xero.model.Payment;
import foam.blob.BlobService;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.fs.File;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.integration.*;
import net.nanopay.integration.AccountingBankAccount;
import net.nanopay.integration.AccountingContactEmailCache;
import net.nanopay.integration.AccountingErrorCodes;
import net.nanopay.integration.ContactMismatchPair;
import net.nanopay.integration.NewResultResponse;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.xero.XeroTokenStorage;
import net.nanopay.integration.xero.XeroConfig;
import net.nanopay.integration.xero.model.XeroContact;
import net.nanopay.integration.xero.model.XeroInvoice;
import net.nanopay.model.Business;
import net.nanopay.model.Currency;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class XeroIntegrationService2 extends foam.core.AbstractFObject implements net.nanopay.integration.IntegrationService{


  public XeroClient getClient(X x) {
    User user = (User) x.get("user");
    DAO store = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroConfig config = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient client = new XeroClient(config);
    if ( tokenStorage == null || tokenStorage.getToken().equals("") ) {
      return null;
    }
    client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
    return client;
  }


  public NewResultResponse isSignedIn(X x) {
    XeroClient client = this.getClient(x);
    if ( client == null ) {
      return new NewResultResponse.Builder(x)
        .setResult(false)
        .setReason("User not signed in")
        .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }
    return new NewResultResponse.Builder(x)
      .setResult(true)
      .build();
  }


  public String isValidContact(com.xero.model.Contact xeroContact) {
    String error = "";
    if ( SafetyUtil.isEmpty(xeroContact.getEmailAddress()) ) {
      error += "Missing Email Address.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getFirstName()) ) {
      error += " Missing First Name.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getLastName()) ) {
      error += " Missing Last Name.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getName()) ) {
      error += " Missing Contact Name.";
    }
    return error;
  }


  public ResultResponse isValidInvoice(com.xero.model.Invoice xeroInvoice) {
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ) {
      return new ResultResponse(false,"We currently only support CAD and USD." );
    }
    return new ResultResponse(true,"");
  }

  private XeroContact importXeroContact(com.xero.model.Contact xeroContact, User user, XeroContact existingContact) {
    XeroContact newContact;
    if ( existingContact != null ) {
      newContact = existingContact;
    } else {
      newContact = new XeroContact();
    }

     // Address integration
    if ( xeroContact.getAddresses() != null &&
      xeroContact.getAddresses().getAddress().size() != 0 ) {

      foam.nanos.auth.CountryService countryService = (foam.nanos.auth.CountryService) getX().get("countryService");
      foam.nanos.auth.RegionService regionService = (foam.nanos.auth.RegionService) getX().get("regionService");

      com.xero.model.Address xeroAddress = xeroContact.getAddresses().getAddress().get(0);

      foam.nanos.auth.Country country = null;
      if ( xeroAddress.getCountry() != null ) {
        country = countryService.getCountry(xeroAddress.getCountry());
      }

      foam.nanos.auth.Region region = null;
      if ( xeroAddress.getRegion() != null ) {
        region = regionService.getRegion(xeroAddress.getRegion());
      }

      foam.nanos.auth.Address nanoAddress = new foam.nanos.auth.Address.Builder(getX())
      .setAddress1(xeroAddress.getAddressLine1())
      .setAddress2(xeroAddress.getAddressLine2())
      .setCity(xeroAddress.getCity())
      .setPostalCode(xeroAddress.getPostalCode() != null ? xeroAddress.getPostalCode() : "")
      .setCountryId(country != null ? country.getCode() : null)
      .setRegionId(region != null ? region.getCode() : null)
      .setType(xeroAddress.getAddressType().value())
      .setVerified(true)
      .build();

      newContact.setBusinessAddress(nanoAddress);
    }


     // Phone integration
    if ( xeroContact.getPhones() != null &&
      xeroContact.getPhones().getPhone().size() != 0 ) {

      com.xero.model.Phone xeroPhone = xeroContact.getPhones().getPhone().get(1);
      com.xero.model.Phone xeroMobilePhone = xeroContact.getPhones().getPhone().get(3);

      String phoneNumber =
      (xeroPhone.getPhoneCountryCode() != null ? xeroPhone.getPhoneCountryCode() : "") +
      (xeroPhone.getPhoneAreaCode() != null ? xeroPhone.getPhoneAreaCode() : "") +
      (xeroPhone.getPhoneNumber() != null ? xeroPhone.getPhoneNumber() : "");

      String mobileNumber =
      (xeroMobilePhone.getPhoneCountryCode() != null ? xeroMobilePhone.getPhoneCountryCode() : "") +
      (xeroMobilePhone.getPhoneAreaCode() != null ? xeroMobilePhone.getPhoneAreaCode() : "") +
      (xeroMobilePhone.getPhoneNumber() != null ? xeroMobilePhone.getPhoneNumber() : "");

      foam.nanos.auth.Phone nanoPhone = new foam.nanos.auth.Phone.Builder(getX())
      .setNumber(phoneNumber)
      .setVerified(!phoneNumber.equals(""))
      .build();

      foam.nanos.auth.Phone nanoMobilePhone = new foam.nanos.auth.Phone.Builder(getX())
      .setNumber(mobileNumber)
      .setVerified(!mobileNumber.equals(""))
      .build();

      newContact.setBusinessPhone(nanoPhone);
      newContact.setMobile(nanoMobilePhone);
      newContact.setPhoneNumber(phoneNumber);
    }

    newContact.setXeroId(xeroContact.getContactID());
    newContact.setEmail(xeroContact.getEmailAddress());
    newContact.setOrganization(xeroContact.getName());
    newContact.setBusinessName(xeroContact.getName());
    newContact.setFirstName(xeroContact.getFirstName());
    newContact.setLastName(xeroContact.getLastName());
    newContact.setOwner(user.getId());
    newContact.setGroup("sme");

    return newContact;
  }

  private ContactMismatchPair syncContact(X x, com.xero.model.Contact xeroContact) {
    User user = (User) x.get("user");
    DAO agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));
    DAO contactDAO  = ((DAO) x.get("contactDAO")).inX(x);
    DAO businessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO userDAO = ((DAO) x.get("localUserUserDAO")).inX(x);
    XeroContact newContact = new XeroContact();
    ContactMismatchPair result = new ContactMismatchPair();

    Contact existingContact = (Contact) contactDAO.find(AND(
      EQ(Contact.EMAIL, xeroContact.getEmailAddress()),
      EQ(Contact.OWNER, user.getId())
    ));

    User existingUser = (User) userDAO.find(
      EQ(User.EMAIL, xeroContact.getEmailAddress())
    );

    // check if contact is already exists
    if ( existingContact != null ) {

      // Do nothing if it is an existing user ( user on our system )
      if ( existingUser != null ) {
        return null;
      }
      if (!(existingContact instanceof XeroContact) || ! ((XeroContact) existingContact).getXeroId().equals(xeroContact.getContactID())) {
        result.setExistContact(existingContact);
        result.setNewContact(importXeroContact(xeroContact, user, null));
      } else {
        newContact = importXeroContact(xeroContact, user, (XeroContact) existingContact.fclone());
      }
    } else { // Contact does not already exist

      // check if exisiting user
      if ( existingUser != null ) {

        ArraySink sink = (ArraySink) agentJunctionDAO.where(EQ(
          UserUserJunction.SOURCE_ID, existingUser.getId()
        )).select(new ArraySink());

        if ( sink.getArray().size() == 1 ) {
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          newContact.setOrganization(business.getOrganization());
          newContact.setBusinessName(business.getBusinessName());
          newContact.setBusinessId(business.getId());
          newContact.setEmail(business.getEmail());
        } else {
          result.setExistContact(importXeroContact(xeroContact,user,null));
        }
        newContact.setType("Contact");
        newContact.setGroup("sme");
        newContact.setOwner(user.getId());
      } else {
        newContact = importXeroContact(xeroContact,user,null);
      }
    }
    if ( ! newContact.getEmail().equals("") ) {
      contactDAO.put(newContact);
    }
    if ( result.getExistContact() == null && result.getNewContact() == null ) {
      return null;
    }
    return result;
  }


  @Override
  public ResultResponse contactSync(X x) {
    DAO cacheDAO = (DAO) x.get("AccountingContactEmailCacheDAO");
    Logger logger = (Logger) x.get("logger");
    XeroClient client = this.getClient(x);
    List<ContactMismatchPair> result = new ArrayList<>();
    List<String> contactErrors = new ArrayList<>();

    NewResultResponse isSignedIn = isSignedIn(x);
    if ( ! isSignedIn.getResult() ) {
      System.out.print("not signed in");
      return isSignedIn;
    }

    try {

      for (com.xero.model.Contact xeroContact : client.getContacts()) {
        try {
          String inValidContacts = isValidContact(xeroContact);
        if ( ! inValidContacts.equals("") ) {
          contactErrors.add(xeroContact.getName() + " cannot be synced. " + inValidContacts);
          continue;
        }
        cacheDAO.inX(x).put(
          new net.nanopay.integration.AccountingContactEmailCache.Builder(x)
            .setXeroId(xeroContact.getContactID())
            .setEmail(xeroContact.getEmailAddress())
            .build()
        );

         ContactMismatchPair mismatchPair = syncContact(x, xeroContact);
         if ( mismatchPair != null ) {
           result.add(mismatchPair);
         }
        } catch(Exception e) {
          e.printStackTrace();
          logger.error(e);
          contactErrors.add(xeroContact.getName() + " cannot be synced. " + e.getMessage());
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
      logger.error(e);

      if ( e instanceof com.xero.api.XeroApiException ){
        if ( ((XeroApiException) e).getResponseCode() == 503 ){
          return new NewResultResponse.Builder(x)
            .setResult(false)
            .setErrorCode(AccountingErrorCodes.API_LIMIT)
            .setReason(e.getMessage())
            .build();
        } else if ( ((XeroApiException) e).getResponseCode() == 401 ) {
          return new NewResultResponse.Builder(x)
            .setResult(false)
            .setErrorCode(AccountingErrorCodes.TOKEN_EXPIRED)
            .setReason(e.getMessage())
            .build();
        } else {
          return new NewResultResponse.Builder(x)
            .setResult(false)
            .setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR)
            .setReason(e.getMessage())
            .build();
        }
      } else {
        return new NewResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
          .setReason(e.getMessage())
          .build();
      }
    }
    return new NewResultResponse.Builder(x)
      .setResult(true)
      .setSyncContactsResult(result.toArray(new ContactMismatchPair[result.size()]))
      .setInValidContact(contactErrors.toArray(new String[contactErrors.size()]))
      .build();
  }


  private String syncInvoice(X x, com.xero.model.Invoice xeroInvoice) throws Exception {
    DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
    DAO cacheDAO = (DAO) x.get("AccountingContactEmailCacheDAO");

    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Contact contact;
    XeroInvoice updateInvoice;
    User user = (User) x.get("user");
    XeroClient client = this.getClient(x);

    XeroInvoice existingInvoice;

    existingInvoice = (XeroInvoice) invoiceDAO.find( AND(
        EQ( XeroInvoice.XERO_ID, xeroInvoice.getInvoiceID() ),
        EQ( XeroInvoice.CREATED_BY, user.getId() )
    ));

    // Check if Invoice already exists on the portal
    if ( existingInvoice != null ) {

      // Clone the invoice to make changes
      existingInvoice = (XeroInvoice) existingInvoice.fclone();

      // Checks to see if the invoice needs to be updated in Xero
      if ( existingInvoice.getDesync() ) {
        ResultResponse isSync = reSyncInvoice(x, existingInvoice, xeroInvoice);

        // Checks if the resync succeeded or completed with error
        if ( isSync.getResult() || xeroInvoice.getAmountDue().movePointRight(2).equals(BigDecimal.ZERO) ) {
          existingInvoice.setDesync(false);
          existingInvoice.setComplete(true);
          invoiceDAO.put(existingInvoice);
        } else {
          throw new Exception(isSync.getReason());
        }
        return "";
      }

      // Only update invoices that are unpaid or drafts.
      if ( net.nanopay.invoice.model.InvoiceStatus.UNPAID != existingInvoice.getStatus() && net.nanopay.invoice.model.InvoiceStatus.DRAFT != existingInvoice.getStatus() && net.nanopay.invoice.model.InvoiceStatus.OVERDUE != existingInvoice.getStatus()) {
        // Skip processing this invoice.
        return "";
      }

      // Invoice paid or voided on xero, remove it from our system
      if ( xeroInvoice.getStatus() == com.xero.model.InvoiceStatus.PAID || xeroInvoice.getStatus() == com.xero.model.InvoiceStatus.VOIDED || com.xero.model.InvoiceStatus.DELETED == xeroInvoice.getStatus() ) {
        existingInvoice.setDraft(true);
        invoiceDAO.put(existingInvoice);
        invoiceDAO.remove(existingInvoice);
        return "";
      }

      updateInvoice = (XeroInvoice) existingInvoice.fclone();
    } else {
      // Checks if the invoice was paid, void or deleted
      if (com.xero.model.InvoiceStatus.PAID == xeroInvoice.getStatus() || com.xero.model.InvoiceStatus.VOIDED == xeroInvoice.getStatus() || com.xero.model.InvoiceStatus.DELETED == xeroInvoice.getStatus()) {
        return "";
      }
      updateInvoice = new XeroInvoice();
    }
    //TODO: Remove this when we accept other currencies
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ) {
      return " Ablii only supports CAD and USD";
    }

    try {
      // Searches for a previous existing Contact
      AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.find(
        EQ(AccountingContactEmailCache.XERO_ID, xeroInvoice.getContact().getContactID())
      );

      if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
        return " Contact was not found";
      }

      contact = (Contact) contactDAO.find( AND(
        EQ( XeroContact.EMAIL, cache.getEmail() ),
        EQ( XeroContact.OWNER, user.getId() )
      ));
      // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
      if ( contact == null ) {
        return " Contact was not found";
      }
    } catch (Exception e) {
      e.printStackTrace();
      return e.toString();
    }
      // Create an invoice
     // existingInvoice = new XeroInvoice();
    importInvoice(x,xeroInvoice,contact,updateInvoice);
    return "";
  }

  public XeroInvoice importInvoice(X x,com.xero.model.Invoice xeroInvoice, Contact contact, XeroInvoice newInvoice) {
    DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
    DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    BlobService blobStore  = (BlobService) x.get("blobStore");
    User user = (User) x.get("user");
    XeroClient client = getClient(x);

    newInvoice.setDestinationCurrency(xeroInvoice.getCurrencyCode().value());
    Currency currency = (Currency) currencyDAO.find(xeroInvoice.getCurrencyCode().value());
    newInvoice.setAmount((xeroInvoice.getAmountDue().movePointRight(currency.getPrecision())).longValue());


    if ( xeroInvoice.getType() == InvoiceType.ACCREC ) {
      newInvoice.setContactId(contact.getId());
      newInvoice.setPayeeId(user.getId());
      newInvoice.setPayerId(contact.getId());
      newInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
      newInvoice.setDraft(true);
      newInvoice.setInvoiceNumber(xeroInvoice.getInvoiceNumber());
    } else {
      newInvoice.setPayerId(user.getId());
      newInvoice.setPayeeId(contact.getId());
      newInvoice.setContactId(contact.getId());
      newInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
      newInvoice.setInvoiceNumber(xeroInvoice.getInvoiceNumber());
    }
    newInvoice.setXeroId(xeroInvoice.getInvoiceID());
    newInvoice.setIssueDate(xeroInvoice.getDate().getTime());
    newInvoice.setDueDate(xeroInvoice.getDueDate().getTime());
    newInvoice.setDesync(false);
    newInvoice.setCreatedBy(user.getId());

    // get invoice attachments
    if ( ! xeroInvoice.isHasAttachments() ) {
      invoiceDAO.put(newInvoice);
      return newInvoice;
    }

    // try to get attachments
    List<Attachment> attachments;
    try {
      attachments = client.getAttachments("Invoices", xeroInvoice.getInvoiceID());
    } catch ( Throwable ignored ) {
      invoiceDAO.put(newInvoice);
      return newInvoice;
    }

    // return invoice if attachments is null or size is 0
    if ( attachments == null || attachments.size() == 0 ) {
      invoiceDAO.put(newInvoice);
      return newInvoice;
    }

    // iterate through all attachments
    File[] files = new File[attachments.size()];
    for ( int i = 0; i < attachments.size(); i++ ) {
      try {
        Attachment attachment = attachments.get(i);
        long filesize = attachment.getContentLength().longValue();

        // get attachment content and create blob
        java.io.ByteArrayInputStream bais = client.getAttachmentContent("Invoices",
          xeroInvoice.getInvoiceID(), attachment.getFileName(), null);
        foam.blob.Blob data = blobStore.put_(x, new foam.blob.InputStreamBlob(bais, filesize));

        // create file
        files[i] = new File.Builder(x)
          .setId(attachment.getAttachmentID())
          .setOwner(user.getId())
          .setMimeType(attachment.getMimeType())
          .setFilename(attachment.getFileName())
          .setFilesize(filesize)
          .setData(data)
          .build();
        fileDAO.inX(x).put(files[i]);
      } catch ( Throwable ignored ) { }
    }

    // set files on nano invoice
    newInvoice.setInvoiceFile(files);
    invoiceDAO.put(newInvoice);
    return  newInvoice;
  }


  @Override
  public ResultResponse invoiceSync(foam.core.X x) {
    XeroClient client = this.getClient(x);
    Logger logger = (Logger) x.get("logger");
    List<String> invoiceErrors = new ArrayList<>();

    // Check that user has accessed xero before
    NewResultResponse isSignedIn = isSignedIn(x);
    if ( ! isSignedIn.getResult() ) {
      System.out.print("not signed in");
      return isSignedIn;
    }

    try {

      for (com.xero.model.Invoice xeroInvoice : client.getInvoices()) {

        try {
          String response = syncInvoice(x, xeroInvoice);
          if ( ! response.equals("")) {
            String message;
            if (xeroInvoice.getType() == InvoiceType.ACCREC) {
              message = "Receivable invoice from " + xeroInvoice.getContact().getName() + " due on " + xeroInvoice.getDueDate().getTime();
            } else {
              message = "Payable invoice to " + xeroInvoice.getContact().getName() + " due on " + xeroInvoice.getDueDate().getTime();
            }
            invoiceErrors.add(message + " cannot be synced " + response);
          }
        } catch (Exception e) {
          e.printStackTrace();
          logger.error(e);
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
      logger.error(e);

      if ( e instanceof com.xero.api.XeroApiException ){
        if ( ((XeroApiException) e).getResponseCode() == 503 ){
          return new NewResultResponse.Builder(x)
            .setResult(false)
            .setErrorCode(AccountingErrorCodes.API_LIMIT)
            .setReason(e.getMessage())
            .build();
        } else if ( ((XeroApiException) e).getResponseCode() == 401 ) {
          return new NewResultResponse.Builder(x)
            .setResult(false)
            .setErrorCode(AccountingErrorCodes.TOKEN_EXPIRED)
            .setReason(e.getMessage())
            .build();
        } else {
          return new NewResultResponse.Builder(x)
            .setResult(false)
            .setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR)
            .setReason(e.getMessage())
            .build();
        }
      } else {
        return new NewResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
          .setReason(e.getMessage())
          .build();
      }
    }
    return new NewResultResponse.Builder(x)
      .setResult(true)
      .setInValidContact(invoiceErrors.toArray(new String[invoiceErrors.size()]))
      .build();
  }

  private ResultResponse reSyncInvoice(X x, XeroInvoice nanoInvoice, com.xero.model.Invoice xeroInvoice) {
    DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
    Logger logger = (Logger) x.get("logger");
    List<Payment> paymentList = new ArrayList<>();
    User user  = (User) x.get("user");
    XeroClient client = getClient(x);

    BankAccount account;
    if ( user.getId() == nanoInvoice.getPayeeId() ) {
      account  = BankAccount.findDefault(x, user, nanoInvoice.getDestinationCurrency());
    } else {
      account  = BankAccount.findDefault(x, user, nanoInvoice.getSourceCurrency());
    }
    try {
      NewResultResponse isSignedIn = isSignedIn(x);
      if ( ! isSignedIn.getResult() ) {
        System.out.print("not signed in");
        return isSignedIn;
      }
      if ( SafetyUtil.isEmpty(account.getIntegrationId()) ) {
        return new ResultResponse(false, "The follow error has occured: Bank Account not linked to Xero");
      }
      com.xero.model.Account xeroAccount = client.getAccount(account.getIntegrationId());
      List<com.xero.model.Invoice> xeroInvoiceList = new ArrayList<>();
      if ( ! (com.xero.model.InvoiceStatus.AUTHORISED == xeroInvoice.getStatus()) ) {
        xeroInvoice.setStatus(com.xero.model.InvoiceStatus.AUTHORISED);
        xeroInvoiceList.add(xeroInvoice);
        client.updateInvoice(xeroInvoiceList);
      }

      // Creates a payment for the full amount for the invoice and sets it paid to the bank account on xero
      Payment payment = new Payment();
      payment.setInvoice(xeroInvoice);
      payment.setAccount(xeroAccount);
      Calendar cal = Calendar.getInstance();
      cal.setTime(new Date());
      payment.setDate(cal);
      Currency currency = (Currency) currencyDAO.find(xeroInvoice.getCurrencyCode().value());
      payment.setAmount(BigDecimal.valueOf(nanoInvoice.getAmount()).movePointLeft(currency.getPrecision()));
      paymentList.add(payment);
      client.createPayments(paymentList);
      return new ResultResponse(true, " ");
    } catch ( Throwable e ) {
      e.printStackTrace();
      logger.error(e);
      return new ResultResponse(false, "The follow error has occured: " + e.getMessage() + " ");
    }
  }

  @Override
  public ResultResponse syncSys(X x) {
    Logger logger = (Logger) x.get("logger");
    try {
      contactSync(x);
      invoiceSync(x);
    } catch (Exception e) {
      e.printStackTrace();
      logger.error(e);
      return new NewResultResponse.Builder(x)
        .setResult(false)
        .setReason(e.getMessage())
        .build();
    }
    return new NewResultResponse.Builder(x)
      .setResult(true)
      .build();
  }


  @Override
  public ResultResponse removeToken(X x) {
    User user = (User) x.get("user");
    DAO              store        = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
    if ( tokenStorage == null ) {
      return new ResultResponse(false, "User has not connected to Xero");
    }

    // Clears the tokens simulating logout.
    tokenStorage.setToken("");
    tokenStorage.setTokenSecret("");
    tokenStorage.setTokenTimestamp("0");
    store.put(tokenStorage);
    return new ResultResponse(true, "User has been Signed out of Xero");
  }


  @Override
  public List<AccountingBankAccount> pullBanks(X x) {
    List<AccountingBankAccount> banksList = new ArrayList<>();
    Logger logger = (Logger) x.get("logger");
    XeroClient client = getClient(x);

    try {
      // Check that user has accessed xero before
      if ( client == null ) {
        throw new Exception("User is not synced with Xero");
      }

      for ( com.xero.model.Account xeroAccount :  client.getAccounts() ) {
        AccountingBankAccount xeroBankAccounts = new AccountingBankAccount();
        if ( com.xero.model.AccountType.BANK != xeroAccount.getType() ) {
          continue;
        }
        xeroBankAccounts.setAccountingName("XERO");
        xeroBankAccounts.setAccountingId(xeroAccount.getAccountID());
        xeroBankAccounts.setName(xeroAccount.getName());
        xeroBankAccounts.setCurrencyCode(xeroAccount.getCurrencyCode().value());
        banksList.add(xeroBankAccounts);
      }
      return banksList;
    } catch ( Throwable e ) {
      e.printStackTrace();
      logger.error(e);
      return banksList;
    }
  }
}
