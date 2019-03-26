package net.nanopay.accounting.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.*;

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

import net.nanopay.accounting.*;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.accounting.xero.model.XeroContact;
import net.nanopay.accounting.xero.model.XeroInvoice;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.model.Business;
import net.nanopay.model.Currency;

import java.math.BigDecimal;
import java.util.*;

import static foam.mlang.MLang.*;

public class XeroIntegrationService implements net.nanopay.accounting.IntegrationService{


  public XeroClient getClient(X x) {
    User user = (User) x.get("user");
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());
    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroConfig config = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient client = new XeroClient(config);
    if ( token == null || token.getToken().equals("") || ! (user.getIntegrationCode() == IntegrationCode.XERO)) {
      return null;
    }
    client.setOAuthToken(token.getToken(), token.getTokenSecret());
    return client;
  }


  public ResultResponse isSignedIn(X x) {
    XeroClient client = this.getClient(x);
    if ( client == null ) {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason("User not signed in")
        .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }
    return new ResultResponse.Builder(x)
      .setResult(true)
      .build();
  }


  public String isValidContact(com.xero.model.Contact xeroContact) {
    String error = "";
    if ( SafetyUtil.isEmpty(xeroContact.getEmailAddress()) ) {
      error += "Missing Email Address.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getName()) ) {
      error += " Missing Contact Name.";
    }
    return error;
  }

  private XeroContact importXeroContact(X x,com.xero.model.Contact xeroContact, User user, XeroContact existingContact) {
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());
    XeroContact newContact;
    if ( existingContact != null ) {
      newContact = existingContact;
    } else {
      newContact = new XeroContact();
    }

     // Address accounting
    if ( xeroContact.getAddresses() != null &&
      xeroContact.getAddresses().getAddress().size() != 0 ) {

      foam.nanos.auth.CountryService countryService = (foam.nanos.auth.CountryService) x.get("countryService");
      foam.nanos.auth.RegionService regionService = (foam.nanos.auth.RegionService) x.get("regionService");
      com.xero.model.Address xeroAddress = xeroContact.getAddresses().getAddress().get(0);

      foam.nanos.auth.Country country = null;
      if ( xeroAddress.getCountry() != null ) {
        country = countryService.getCountry(xeroAddress.getCountry());
      }

      foam.nanos.auth.Region region = null;
      if ( xeroAddress.getRegion() != null ) {
        region = regionService.getRegion(xeroAddress.getRegion());
      }

      foam.nanos.auth.Address nanoAddress = new foam.nanos.auth.Address.Builder(x)
        .setSuite(xeroAddress.getAddressLine1())
        .setCity(xeroAddress.getCity())
        .setPostalCode(xeroAddress.getPostalCode() != null ? xeroAddress.getPostalCode() : "")
        .setCountryId(country != null ? country.getCode() : null)
        .setRegionId(region != null ? region.getCode() : null)
        .setType(xeroAddress.getAddressType().value())
        .setVerified(true)
        .build();

      newContact.setBusinessAddress(nanoAddress);
    }


     // Phone accounting
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

      foam.nanos.auth.Phone nanoPhone = new foam.nanos.auth.Phone.Builder(x)
      .setNumber(phoneNumber)
      .setVerified(!phoneNumber.equals(""))
      .build();

      foam.nanos.auth.Phone nanoMobilePhone = new foam.nanos.auth.Phone.Builder(x)
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
    if ( xeroContact.getFirstName() != null ) {
      newContact.setFirstName(xeroContact.getFirstName());
    }
    if ( xeroContact.getLastName() != null ) {
      newContact.setLastName(xeroContact.getLastName());
    }
    newContact.setOwner(user.getId());
    newContact.setGroup("sme");
    newContact.setXeroOrganizationId(token.getOrganizationId());

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

      if ( existingUser != null ) {
        return new ContactMismatchPair.Builder(x)
          .setExistContact(importXeroContact(x, xeroContact, user, null))
          .setResultCode(ContactMismatchCode.EXISTING_USER_CONTACT)
          .build();
      }
      if (!(existingContact instanceof XeroContact) || ! ((XeroContact) existingContact).getXeroId().equals(xeroContact.getContactID())) {
        result.setExistContact(existingContact);
        result.setNewContact(existingContact);
        result.setResultCode(ContactMismatchCode.EXISTING_CONTACT);
      } else {
        newContact = importXeroContact(x,xeroContact, user, (XeroContact) existingContact.fclone());
        result.setNewContact(newContact);
        result.setResultCode(ContactMismatchCode.SUCCESS);
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
          newContact.setType("Contact");
          newContact.setGroup("sme");
          newContact.setOwner(user.getId());
          result.setResultCode(ContactMismatchCode.EXISTING_USER);
        } else {
          result.setExistContact(importXeroContact(x,xeroContact,user,null));
          result.setResultCode(ContactMismatchCode.EXISTING_USER_MULTI);
        }
      } else {
        newContact = importXeroContact(x,xeroContact,user,null);
        result.setNewContact(newContact);
        result.setResultCode(ContactMismatchCode.SUCCESS);
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
    List<String> contactSuccess = new ArrayList<>();

    if ( client == null ) {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason("User not signed in")
        .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }

    try {

      for (com.xero.model.Contact xeroContact : client.getContacts()) {
        try {
          String invalidContacts = isValidContact(xeroContact);
        if ( ! invalidContacts.equals("") ) {
          contactErrors.add(xeroContact.getName() + " cannot be synced. " + invalidContacts);
          continue;
        }
        cacheDAO.inX(x).put(
          new net.nanopay.accounting.AccountingContactEmailCache.Builder(x)
            .setXeroId(xeroContact.getContactID())
            .setEmail(xeroContact.getEmailAddress())
            .build()
        );

         ContactMismatchPair mismatchPair = syncContact(x, xeroContact);
         if ( mismatchPair.getResultCode() == ContactMismatchCode.SUCCESS ) {
           contactSuccess.add(mismatchPair.getNewContact().getFirstName() + " " + mismatchPair.getNewContact().getLastName() + " with email address of " + mismatchPair.getNewContact().getEmail());
         }
         else {
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
      return getExceptionResponse(x,e);
    }
    return new ResultResponse.Builder(x)
      .setResult(true)
      .setContactSyncMismatches(result.toArray(new ContactMismatchPair[result.size()]))
      .setContactSyncErrors(contactErrors.toArray(new String[contactErrors.size()]))
      .setSuccessContact(contactSuccess.toArray(new String[contactSuccess.size()]))
      .build();
  }


  private String syncInvoice(X x, com.xero.model.Invoice xeroInvoice) throws Exception {
    DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
    DAO cacheDAO = (DAO) x.get("AccountingContactEmailCacheDAO");
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Contact contact;
    XeroInvoice updateInvoice;
    User user = (User) x.get("user");

    XeroInvoice existingInvoice;

    existingInvoice = (XeroInvoice) invoiceDAO.find( AND(
        EQ( XeroInvoice.XERO_ID, xeroInvoice.getInvoiceID() ),
        EQ( XeroInvoice.CREATED_BY, user.getId() )
    ));

    // Check if Invoice already exists on the portal
    if ( existingInvoice != null ) {

      // Clone the invoice to make changes
      existingInvoice = (XeroInvoice) existingInvoice.fclone();

      // Only update draft receivables
      if ( xeroInvoice.getType() == InvoiceType.ACCREC  && ! ( existingInvoice.getStatus() == InvoiceStatus.DRAFT)) {
        return "skip";
      }

      //skip desync invoices as they have been paid already
      if ( existingInvoice.getDesync() ){
        return "skip";
      }
      // Only update invoices that are unpaid or drafts.
      if ( ! (net.nanopay.invoice.model.InvoiceStatus.UNPAID == existingInvoice.getStatus() || net.nanopay.invoice.model.InvoiceStatus.DRAFT == existingInvoice.getStatus() || net.nanopay.invoice.model.InvoiceStatus.OVERDUE == existingInvoice.getStatus()) ) {
        // Skip processing this invoice.
        return "skip";
      }

      // Invoice paid or voided on xero, remove it from our system
      if ( xeroInvoice.getStatus() == com.xero.model.InvoiceStatus.PAID || xeroInvoice.getStatus() == com.xero.model.InvoiceStatus.VOIDED || com.xero.model.InvoiceStatus.DELETED == xeroInvoice.getStatus() ) {
        existingInvoice.setDraft(true);
        invoiceDAO.put(existingInvoice);
        invoiceDAO.remove(existingInvoice);
        return "skip";
      }

      updateInvoice = (XeroInvoice) existingInvoice.fclone();
    } else {
      // Checks if the invoice was paid, void or deleted
      if (com.xero.model.InvoiceStatus.PAID == xeroInvoice.getStatus() || com.xero.model.InvoiceStatus.VOIDED == xeroInvoice.getStatus() || com.xero.model.InvoiceStatus.DELETED == xeroInvoice.getStatus()) {
        return "skip";
      }
      updateInvoice = new XeroInvoice();
    }
    //TODO: Remove this when we accept other currencies
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ) {
      return " Ablii only supports CAD and USD";
    }


    if ( xeroInvoice.getStatus() != com.xero.model.InvoiceStatus.AUTHORISED ) {
      return " Invoice is not authorised on Xero.";
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
        EQ( XeroContact.EMAIL, cache.getEmail() ), EQ( XeroContact.OWNER, user.getId() )
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
    User user = (User) x.get("user");
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());
    DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
    DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    BlobService blobStore  = (BlobService) x.get("blobStore");
//    XeroClient client = getClient(x);

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
    newInvoice.setXeroOrganizationId(token.getOrganizationId());
    newInvoice.setBusinessName(token.getBusinessName());

//    // get invoice attachments
//    if ( ! xeroInvoice.isHasAttachments() ) {
//      invoiceDAO.put(newInvoice);
//      return newInvoice;
//    }

    // try to get attachments
//    List<Attachment> attachments;
//    try {
//      attachments = client.getAttachments("Invoices", xeroInvoice.getInvoiceID());
//    } catch ( Throwable ignored ) {
//      invoiceDAO.put(newInvoice);
//      return newInvoice;
//    }
//
//    // return invoice if attachments is null or size is 0
//    if ( attachments == null || attachments.size() == 0 ) {
//      invoiceDAO.put(newInvoice);
//      return newInvoice;
//    }
//
//    // iterate through all attachments
//    File[] files = new File[attachments.size()];
//    for ( int i = 0; i < attachments.size(); i++ ) {
//      try {
//        Attachment attachment = attachments.get(i);
//        long filesize = attachment.getContentLength().longValue();
//
//        // get attachment content and create blob
//        java.io.ByteArrayInputStream bais = client.getAttachmentContent("Invoices",
//          xeroInvoice.getInvoiceID(), attachment.getFileName(), null);
//        foam.blob.Blob data = blobStore.put_(x, new foam.blob.InputStreamBlob(bais, filesize));
//
//        // create file
//        files[i] = new File.Builder(x)
//          .setId(attachment.getAttachmentID())
//          .setOwner(user.getId())
//          .setMimeType(attachment.getMimeType())
//          .setFilename(attachment.getFileName())
//          .setFilesize(filesize)
//          .setData(data)
//          .build();
//        fileDAO.inX(x).put(files[i]);
//      } catch ( Throwable ignored ) { }
//    }
//
//    // set files on nano invoice
//    newInvoice.setInvoiceFile(files);
    invoiceDAO.put(newInvoice);
    return  newInvoice;
  }


  @Override
  public ResultResponse invoiceSync(foam.core.X x) {

    XeroClient client = this.getClient(x);
    Logger logger = (Logger) x.get("logger");
    List<String> invoiceErrors = new ArrayList<>();
    List<String> successInvoice = new ArrayList<>();

    User user = (User) x.get("user");
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());

    // Check that user has accessed xero before
    if ( client == null ) {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason("User not signed in")
        .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }

    try {
      Organisation organisations = client.getOrganisations().get(0);
      token.setBusinessName(organisations.getLegalName());
      token.setOrganizationId(organisations.getOrganisationID());
      tokenDAO.put(token.fclone());

      for (com.xero.model.Invoice xeroInvoice : client.getInvoices()) {
        try {
          String response = syncInvoice(x, xeroInvoice);
          if ( response.equals("skip") ) {
            continue;
          } else if ( ! response.equals("") ) {
            String message;
            if (xeroInvoice.getType() == InvoiceType.ACCREC) {
              message = "Receivable invoice from " + xeroInvoice.getContact().getName() + " due on " + xeroInvoice.getDueDate().getTime();
            } else {
              message = "Payable invoice to " + xeroInvoice.getContact().getName() + " due on " + xeroInvoice.getDueDate().getTime();
            }
            invoiceErrors.add(message + " cannot be synced: " + response);
          } else {
            successInvoice.add("Invoice to " + xeroInvoice.getContact().getName()+ " due on " + xeroInvoice.getDueDate().getTime());
          }
        } catch (Exception e) {
          e.printStackTrace();
          logger.error(e);
        }
      }

      invoiceResync(x,null);

    } catch (Exception e) {
      e.printStackTrace();
      logger.error(e);
      return getExceptionResponse(x,e);
    }
    return new ResultResponse.Builder(x)
      .setResult(true)
      .setInvoiceSyncErrors(invoiceErrors.toArray(new String[invoiceErrors.size()]))
      .setSuccessInvoice(successInvoice.toArray(new String[successInvoice.size()]))
      .build();
  }

  @Override
  public ResultResponse invoiceResync(X x, Invoice invoice) {
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Logger logger = (Logger) x.get("logger");
    List<Payment> paymentList = new ArrayList<>();
    List<XeroInvoice> invoiceList = new ArrayList<>();
    XeroClient client = getClient(x);
    User user = (User) x.get("user");

    if ( client == null ) {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason("User not signed in")
        .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }

    if ( invoice != null ) {
      XeroInvoice nanoInvoice =  (XeroInvoice) invoice;
      if ( user.getId() == invoice.getPayeeId() ) {
        if ( invoice.getStatus() == InvoiceStatus.PENDING  ) {
          nanoInvoice.setDesync(true);
          invoiceDAO.put(nanoInvoice.fclone());
        }
        return new ResultResponse.Builder(x)
          .setResult(true)
          .build();
      }
      //sync single invoice. Set desync to true to sync later if it fails
      try {
        com.xero.model.Invoice xeroInvoice = client.getInvoice(nanoInvoice.getXeroId());
        PaymentResponse payment = reSyncInvoice(x,nanoInvoice,xeroInvoice);
        if ( payment.response.getResult() ) {
          paymentList.add(payment.payment);
          client.createPayments(paymentList);
          if ( nanoInvoice.getDesync() ) {
            nanoInvoice.setDesync(false);
            invoiceDAO.put(nanoInvoice.fclone());
          }
          return new ResultResponse.Builder(x)
            .setResult(true)
            .build();
        } else {
          return payment.response;
        }
      } catch (Exception e) {
        logger.error(e);
        nanoInvoice.setDesync(true);
        invoiceDAO.put(nanoInvoice.fclone());
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
          .setReason(e.getMessage())
          .build();
      }
    } else {
      //find and sync invoices that have desync == true
      try {
        ArraySink sink = (ArraySink) invoiceDAO.where(
          EQ( XeroInvoice.DESYNC , true )
        ).select(new ArraySink());

        for ( Object i: sink.getArray().toArray()) {

          if (i instanceof XeroInvoice) {
            XeroInvoice nanoInvoice = (XeroInvoice) i;
            com.xero.model.Invoice xeroInvoice = new com.xero.model.Invoice();
            xeroInvoice.setInvoiceID(nanoInvoice.getXeroId());
            PaymentResponse payment = reSyncInvoice(x,nanoInvoice,xeroInvoice);
            if ( payment.response.getResult() ) {
              paymentList.add(payment.payment);
              invoiceList.add(nanoInvoice);
            }
          }
        }
        if ( paymentList.size() > 0 ) {
          client.createPayments(paymentList);
        }

        for ( XeroInvoice nanoInvoice: invoiceList ) {
            nanoInvoice.setDesync(false);
            invoiceDAO.put(nanoInvoice.fclone());
        }
        return new ResultResponse.Builder(x)
          .setResult(true)
          .build();
      } catch (Exception e) {
        logger.error(e);
        if ( e instanceof  com.xero.api.XeroApiException ) {
          List<Elements> elements = ((com.xero.api.XeroApiException) e).getApiException().getElements();
          List<String> result = new ArrayList<>();

          // set desync false for one the synced successfully
          for ( Elements element: elements ) {
            for (Object o : element.getDataContractBase() ) {
              if ( o instanceof Payment ) {
                result.add(((Payment) o).getInvoice().getInvoiceID());
              }
            }
          }

          for ( XeroInvoice nanoInvoice: invoiceList ) {
            if ( ! result.contains(nanoInvoice.getXeroId()) ) {
              nanoInvoice.setDesync(false);
              invoiceDAO.put(nanoInvoice.fclone());
            }
          }

          return new ResultResponse.Builder(x)
            .setResult(false)
            .setReason("An Error has occured.")
            .setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR)
            .build();
        }
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason(e.getMessage())
        .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
        .build();
      }
    }
  }

  private ResultResponse getExceptionResponse(X x,Exception e) {

    if ( e instanceof com.xero.api.XeroApiException ){
      if ( ((XeroApiException) e).getResponseCode() == 503 ){
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.API_LIMIT)
          .setReason(e.getMessage())
          .build();
      } else if ( ((XeroApiException) e).getResponseCode() == 401 ) {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.TOKEN_EXPIRED)
          .setReason(e.getMessage())
          .build();
      } else {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR)
          .setReason(e.getMessage())
          .build();
      }
    } else {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
        .setReason(e.getMessage())
        .build();
    }
  }

  private PaymentResponse reSyncInvoice(X x, XeroInvoice nanoInvoice, com.xero.model.Invoice xeroInvoice) {
    PaymentResponse response = new PaymentResponse();
    DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
    Logger logger = (Logger) x.get("logger");
    User user  = (User) x.get("user");
    XeroClient client = getClient(x);

    if ( client == null ) {
      response.response = new ResultResponse.Builder(x)
        .setResult(false)
        .setReason("User not connected to Xero.")
        .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }

    BankAccount account;
    if ( user.getId() == nanoInvoice.getPayeeId() ) {
      account  = BankAccount.findDefault(x, user, nanoInvoice.getDestinationCurrency());
    } else {
      account  = BankAccount.findDefault(x, user, nanoInvoice.getSourceCurrency());
    }
    try {
      ResultResponse isSignedIn = isSignedIn(x);
      if (!isSignedIn.getResult()) {
        response.response = isSignedIn;
        return response;
      }
      if (SafetyUtil.isEmpty(account.getIntegrationId())) {
        response.response = new ResultResponse.Builder(x)
          .setResult(false)
          .setReason("Bank Account not linked to Xero.")
          .setErrorCode(AccountingErrorCodes.MISSING_BANK)
          .build();
      }
      com.xero.model.Account xeroAccount = client.getAccount(account.getIntegrationId());

      // Creates a payment for the full amount for the invoice and sets it paid to the bank account on xero
      Payment payment = new Payment();
      payment.setInvoice(xeroInvoice);
      payment.setAccount(xeroAccount);
      Calendar cal = Calendar.getInstance();
      cal.setTime(new Date());
      payment.setDate(cal);
      Currency currency = (Currency) currencyDAO.find(nanoInvoice.getSourceCurrency());
      payment.setAmount(BigDecimal.valueOf(nanoInvoice.getAmount()).movePointLeft(currency.getPrecision()));
      response.payment = payment;
      response.response = new ResultResponse.Builder(x)
                            .setResult(true)
                            .build();
      return response;
    } catch (Exception e) {
      e.printStackTrace();
      logger.error(e);
      response.response = getExceptionResponse(x,e);
      return response;
    }
  }

  @Override
  public ResultResponse removeToken(X x) {
    User user = (User) x.get("user");
    DAO userDAO = ((DAO) x.get("localUserUserDAO")).inX(x);
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    DAO accountDAO = (DAO) x.get("accountDAO");
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());
    ArraySink sink = new ArraySink();
    if ( token == null ) {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason("User has not connected to Xero.")
        .build();
    }

    tokenDAO.remove(token.fclone());
    user = (User) user.fclone();
    user.clearIntegrationCode();
    userDAO.put(user);

    //remove bank accounts
    accountDAO.where(AND(
      EQ(BankAccount.OWNER, user.getId()),
      NEQ(BankAccount.INTEGRATION_ID, "")
    )).select(sink);
    List<BankAccount> bankAccountList = sink.getArray();

    for ( BankAccount account: bankAccountList ) {
      account.setIntegrationId("");
      accountDAO.put(account.fclone());
    }

    return new ResultResponse.Builder(x)
      .setResult(true)
      .setReason("User has been Signed out of Xero")
      .build();
  }


  @Override
  public ResultResponse bankAccountSync(X x) {
    User user = (User) x.get("user");
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());
    List<AccountingBankAccount> banksList = new ArrayList<>();
    DAO accountingBankDAO = (DAO) x.get("accountingBankAccountCacheDAO");
    Logger logger = (Logger) x.get("logger");
    XeroClient client = getClient(x);

    try {
      // Check that user has accessed xero before
      if ( client == null ) {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setReason("User is not connected to xero")
          .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
          .build();
      }

      for ( com.xero.model.Account xeroAccount :  client.getAccounts() ) {
        AccountingBankAccount xeroBankAccounts = new AccountingBankAccount();
        if ( com.xero.model.AccountType.BANK != xeroAccount.getType() ) {
          continue;
        }
        xeroBankAccounts.setXeroOrganizationId(token.getOrganizationId());
        xeroBankAccounts.setXeroBankAccountId(xeroAccount.getAccountID());
        xeroBankAccounts.setName(xeroAccount.getName());
        xeroBankAccounts.setCurrencyCode(xeroAccount.getCurrencyCode().value());
        banksList.add(xeroBankAccounts);
        accountingBankDAO.put(xeroBankAccounts);
      }
      return new ResultResponse.Builder(x)
        .setResult(true)
        .setBankAccountList(banksList.toArray(new AccountingBankAccount[banksList.size()]))
        .build();
    } catch ( Exception e ) {
      e.printStackTrace();
      logger.error(e);
      ResultResponse response = getExceptionResponse(x,e);
      ArraySink sink = new ArraySink();
      accountingBankDAO.where(
        EQ(AccountingBankAccount.XERO_ORGANIZATION_ID, token.getOrganizationId())
      ).select(sink);
      banksList = sink.getArray();
      response.setBankAccountList(banksList.toArray(new AccountingBankAccount[banksList.size()]));
      return response;
    }
  }

  @Override
  public ResultResponse singleInvoiceSync(X x, Invoice nanoInvoice) {
    User user = (User) x.get("user");
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());
    XeroClient client = getClient(x);
    Logger logger = (Logger) x.get("logger");
    ContactMismatchPair[] contactMismatchPair = new ContactMismatchPair[1];
    String[] result = new String[1];
    String error = "";

    try {
      if ( client == null ) {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setReason("User not signed in")
          .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
          .build();
      }

      XeroInvoice invoice = (XeroInvoice) nanoInvoice;
      if ( !  invoice.getXeroOrganizationId().equals(token.getOrganizationId()) ) {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setReason("User is not synced with the right Xero organization")
          .setErrorCode(AccountingErrorCodes.INVALID_ORGANIZATION)
          .setReason(invoice.getBusinessName())
          .build();
      }

      com.xero.model.Invoice xeroInvoice = client.getInvoice(invoice.getXeroId());
      result[0] = syncInvoice(x, xeroInvoice);
      if ( result[0].equals("") ) {
        return new ResultResponse.Builder(x)
          .setResult(true)
          .build();
      }
      error = " Invoice has failed to sync, :" + result;

      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason(error)
        .setContactSyncMismatches(contactMismatchPair)
        .setInvoiceSyncErrors(result)
        .build();
    } catch (Exception e){
      logger.error(e);
      return getExceptionResponse(x,e);
    }
  }

}

class PaymentResponse {
  Payment payment;
  com.xero.model.Invoice xeroInvoice;
  ResultResponse response;
}
