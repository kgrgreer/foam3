package net.nanopay.accounting.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.*;

import foam.blob.BlobService;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import net.nanopay.accounting.*;
import net.nanopay.accounting.resultresponse.ContactResponseItem;
import net.nanopay.accounting.resultresponse.InvoiceResponseItem;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.accounting.xero.model.XeroContact;
import net.nanopay.accounting.xero.model.XeroInvoice;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.model.Business;
import foam.core.Currency;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

import static foam.mlang.MLang.*;

public class XeroIntegrationService extends ContextAwareSupport implements net.nanopay.accounting.IntegrationService{
  private  boolean oldToken = false;

  public XeroClient getClient(X x) {
    this.oldToken = false;
    User user = ((Subject) x.get("subject")).getUser();
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroConfig config = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient client = new XeroClient(config);
    if ( token == null || token.getToken().equals("") || ! (user.getIntegrationCode() == IntegrationCode.XERO) ) {
      return null;
    } else if ( token.getOrganizationId() == null || token.getBusinessName() == null ) {
      this.oldToken = true;
      return null;
    }
    client.setOAuthToken(token.getToken(), token.getTokenSecret());
    return client;
  }

  public ResultResponse isValidClient(XeroClient client, X x) {
    if ( client == null ) {
      return new ResultResponse.Builder(x)
        .setResult(false)
        .setReason( this.oldToken ? "Token Expired" : "User not signed in")
        .setErrorCode( this.oldToken ? AccountingErrorCodes.TOKEN_EXPIRED : AccountingErrorCodes.NOT_SIGNED_IN)
        .build();
    }
    return new ResultResponse.Builder(x)
        .setResult(true)
        .build();
  }

  public ResultResponse isSignedIn(X x) {
    XeroClient client = this.getClient(x);
    ResultResponse validClient = isValidClient(client, x);
    if ( ! validClient.getResult() ) {
      return validClient;
    }
    return new ResultResponse.Builder(x)
      .setResult(true)
      .build();
  }


  public Boolean isValidContact(com.xero.model.Contact xeroContact, HashMap<String, List<ContactResponseItem>> contactErrors) {
    ContactResponseItem error = prepareResponseItemFrom(xeroContact);
    if ( SafetyUtil.isEmpty(xeroContact.getEmailAddress()) && SafetyUtil.isEmpty(xeroContact.getName()) ) {
      contactErrors.get("MISS_BUSINESS_EMAIL").add(error);
      return false;
    }
    if ( SafetyUtil.isEmpty(xeroContact.getEmailAddress()) ) {
      contactErrors.get("MISS_EMAIL").add(error);
      return false;
    }
    if ( SafetyUtil.isEmpty(xeroContact.getName()) ) {
      contactErrors.get("MISS_BUSINESS").add(error);
      return false;
    }
    return true;
  }

  public XeroContact createXeroContact(X x, com.xero.model.Contact xeroContact, User user, XeroContact existingContact) {
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
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
        // .setType(xeroAddress.getAddressType().value())
        // .setVerified(true)
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

      newContact.setPhoneNumber(phoneNumber);
      newContact.setPhoneNumberVerified(! SafetyUtil.isEmpty(phoneNumber));
      newContact.setMobileNumber(mobileNumber);
      newContact.setMobileNumberVerified(! SafetyUtil.isEmpty(mobileNumber));
    }

    newContact.setXeroId(xeroContact.getContactID());
    newContact.setEmail(xeroContact.getEmailAddress());
    newContact.setOrganization(xeroContact.getName());
    if ( xeroContact.getFirstName() != null ) {
      newContact.setFirstName(xeroContact.getFirstName());
    }
    if ( xeroContact.getLastName() != null ) {
      newContact.setLastName(xeroContact.getLastName());
    }
    newContact.setOwner(user.getId());
    newContact.setGroup(user.getSpid() + "-sme");
    newContact.setXeroOrganizationId(token.getOrganizationId());
    newContact.setLastUpdated(xeroContact.getUpdatedDateUTC().getTime().getTime());
    newContact.setLastDateUpdated(new Date());

    return newContact;
  }

  public ContactMismatchPair importContact(X x, com.xero.model.Contact xeroContact) {
    User user = ((Subject) x.get("subject")).getUser();
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

    if ( existingContact instanceof XeroContact &&
         ((XeroContact) existingContact).getLastUpdated() >= xeroContact.getUpdatedDateUTC().getTime().getTime()) {
        return null;
    }

    User existingUser = (User) userDAO.find(
      EQ(User.EMAIL, xeroContact.getEmailAddress())
    );

    // check if contact is already exists
    if ( existingContact != null ) {

      if ( existingUser != null ) {
        return new ContactMismatchPair.Builder(x)
          .setExistContact(createXeroContact(x, xeroContact, user, null))
          .setResultCode(ContactMismatchCode.EXISTING_USER_CONTACT)
          .build();
      }
      if (!(existingContact instanceof XeroContact) || ! ((XeroContact) existingContact).getXeroId().equals(xeroContact.getContactID())) {
        result.setExistContact(existingContact);
        result.setNewContact(existingContact);
        result.setResultCode(ContactMismatchCode.EXISTING_CONTACT);
      } else {
        newContact = createXeroContact(x,xeroContact, user, (XeroContact) existingContact.fclone());
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
          newContact.setBusinessId(business.getId());
          newContact.setEmail(business.getEmail());
          newContact.setType("Contact");
          newContact.setGroup(user.getSpid() + "-sme");
          newContact.setOwner(user.getId());
          result.setExistContact(newContact);
          result.setResultCode(ContactMismatchCode.EXISTING_USER);
        } else {
          result.setExistContact(createXeroContact(x,xeroContact,user,null));
          result.setResultCode(ContactMismatchCode.EXISTING_USER_MULTI);
        }
      } else {
        newContact = createXeroContact(x,xeroContact,user,null);
        result.setNewContact(newContact);
        result.setResultCode(ContactMismatchCode.SUCCESS);
      }
    }
    if ( result.getResultCode() == ContactMismatchCode.SUCCESS ) {
      contactDAO.put(newContact);
    }
    return result;
  }


  @Override
  public ResultResponse contactSync(X x) {
    DAO cacheDAO = (DAO) x.get("AccountingContactEmailCacheDAO");
    User user = ((Subject) x.get("subject")).getUser();
    Logger logger = (Logger) x.get("logger");
    XeroClient client = this.getClient(x);
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
    HashMap<String, List<ContactResponseItem>> contactErrors = this.initContactErrors();
    List<ContactMismatchPair> result = new ArrayList<>();
    List<ContactResponseItem> contactSuccess = new ArrayList<>();

    ResultResponse validClient = isValidClient(client, x);
    if ( ! validClient.getResult() ) {
      return validClient;
    }

    try {
      Organisation organisations = client.getOrganisations().get(0);
      token.setBusinessName(organisations.getLegalName());
      token.setOrganizationId(organisations.getOrganisationID());
      tokenDAO.put(token.fclone());

      for (com.xero.model.Contact xeroContact : client.getContacts()) {
        try {
        if ( ! isValidContact(xeroContact, contactErrors) ) {
          continue;
        }
        cacheDAO.inX(x).put(
          new net.nanopay.accounting.AccountingContactEmailCache.Builder(x)
            .setXeroId(xeroContact.getContactID())
            .setEmail(xeroContact.getEmailAddress())
            .build()
        );

         ContactMismatchPair mismatchPair = importContact(x, xeroContact);
         if ( mismatchPair == null ) {
           continue;
         } else if ( mismatchPair.getResultCode() == ContactMismatchCode.SUCCESS ) {
           contactSuccess.add(prepareResponseItemFrom(xeroContact));
         }
         else {
           result.add(mismatchPair);
         }
        } catch(Exception e) {
          logger.error(e);
          ContactResponseItem errorItem = prepareResponseItemFrom(xeroContact);
          errorItem.setMessage(e.getMessage());
          contactErrors.get("OTHER").add(errorItem);
        }
      }

    } catch (Exception e) {
      logger.error(e);
      return saveResult(x, "contactSync", getExceptionResponse(x,e));
    }
    return saveResult(x, "saveResult", new ResultResponse.Builder(x)
      .setResult(true)
      .setContactSyncMismatches(result.toArray(new ContactMismatchPair[result.size()]))
      .setContactErrors(contactErrors)
      .setSuccessContact(contactSuccess.toArray(new ContactResponseItem[contactSuccess.size()]))
      .build());
  }


  public Boolean importInvoice(X x, com.xero.model.Invoice xeroInvoice, HashMap<String, List<InvoiceResponseItem>> invoiceErrors, Boolean isSingleSync) throws Exception {
    DAO contactDAO = ((DAO) x.get("contactDAO")).inX(x);
    DAO cacheDAO = (DAO) x.get("AccountingContactEmailCacheDAO");
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Contact contact;
    XeroInvoice updateInvoice;
    User user = ((Subject) x.get("subject")).getUser();
    InvoiceResponseItem errorItem = prepareResponseItemFrom(xeroInvoice);
    XeroInvoice existingInvoice;

    existingInvoice = (XeroInvoice) invoiceDAO.find( AND(
        EQ( XeroInvoice.XERO_ID, xeroInvoice.getInvoiceID() ),
        EQ( XeroInvoice.CREATED_BY, user.getId() )
    ));

    // Check if Invoice already exists on the portal
    if ( existingInvoice != null ) {

      if ( existingInvoice.getLastUpdated() >= xeroInvoice.getUpdatedDateUTC().getTime().getTime()) {
        return isSingleSync ? true : false;
      }
      // Clone the invoice to make changes
      existingInvoice = (XeroInvoice) existingInvoice.fclone();

      // Only update draft receivables
      if ( xeroInvoice.getType() == InvoiceType.ACCREC  && ! ( existingInvoice.getStatus() == InvoiceStatus.DRAFT)) {
        return false;
      }

      //skip desync invoices as they have been paid already
      if ( existingInvoice.getDesync() ){
        return false;
      }
      // Only update invoices that are unpaid or drafts.
      if ( ! (net.nanopay.invoice.model.InvoiceStatus.UNPAID == existingInvoice.getStatus() || net.nanopay.invoice.model.InvoiceStatus.DRAFT == existingInvoice.getStatus() || net.nanopay.invoice.model.InvoiceStatus.OVERDUE == existingInvoice.getStatus()) ) {
        // Skip processing this invoice.
        return false;
      }

      // Invoice paid or voided on xero, remove it from our system
      if ( xeroInvoice.getStatus() == com.xero.model.InvoiceStatus.PAID || xeroInvoice.getStatus() == com.xero.model.InvoiceStatus.VOIDED || com.xero.model.InvoiceStatus.DELETED == xeroInvoice.getStatus() ) {
        existingInvoice.setDraft(true);
        invoiceDAO.put(existingInvoice);
        invoiceDAO.remove(existingInvoice);
        return false;
      }

      updateInvoice = (XeroInvoice) existingInvoice.fclone();
    } else {
      // Checks if the invoice was paid, void or deleted
      if (com.xero.model.InvoiceStatus.PAID == xeroInvoice.getStatus() || com.xero.model.InvoiceStatus.VOIDED == xeroInvoice.getStatus() || com.xero.model.InvoiceStatus.DELETED == xeroInvoice.getStatus()) {
        return false;
      }
      updateInvoice = new XeroInvoice();
    }
    //TODO: Remove this when we accept other currencies
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ) {
      invoiceErrors.get("CURRENCY_NOT_SUPPORT").add(errorItem);
      return false;
    }


    if ( xeroInvoice.getStatus() != com.xero.model.InvoiceStatus.AUTHORISED ) {
      invoiceErrors.get("UNAUTHORIZED_INVOICE").add(errorItem);
      return false;
    }

    try {
      if ( xeroInvoice.getContact() == null ) {
        invoiceErrors.get("MISS_CONTACT").add(errorItem);
        return false;
      }

      // Searches for a previous existing Contact
      AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.find(
        EQ(AccountingContactEmailCache.XERO_ID, xeroInvoice.getContact().getContactID())
      );

      if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
        invoiceErrors.get("MISS_CONTACT").add(errorItem);
        return false;
      }

      contact = (Contact) contactDAO.find( AND(
        EQ( XeroContact.EMAIL, cache.getEmail() ), EQ( XeroContact.OWNER, user.getId() )
      ));
      // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
      if ( contact == null ) {
        invoiceErrors.get("MISS_CONTACT").add(errorItem);
        return false;
      }
    } catch (Exception e) {
      invoiceErrors.get("OTHER").add(errorItem);
      return false;
    }

    createXeroInvoice(x,xeroInvoice,contact,updateInvoice);
    return true;
  }

  public XeroInvoice createXeroInvoice(X x, com.xero.model.Invoice xeroInvoice, Contact contact, XeroInvoice newInvoice) {
    User user = ((Subject) x.get("subject")).getUser();
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
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
    newInvoice.setLastUpdated(xeroInvoice.getUpdatedDateUTC().getTime().getTime());
    newInvoice.setLastDateUpdated(new Date());

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
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = this.initInvoiceErrors();
    List<InvoiceResponseItem> successInvoice = new ArrayList<>();
    User user = ((Subject) x.get("subject")).getUser();
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();

    ResultResponse validClient = isValidClient(client, x);
    if ( ! validClient.getResult() ) {
      return validClient;
    }

    try {
      Organisation organisations = client.getOrganisations().get(0);
      token.setBusinessName(organisations.getLegalName());
      token.setOrganizationId(organisations.getOrganisationID());
      tokenDAO.put(token.fclone());

      for (com.xero.model.Invoice xeroInvoice : client.getInvoices()) {
        try {
          if ( ! importInvoice(x, xeroInvoice, invoiceErrors, false) ) {
            continue;
          } else {
            successInvoice.add(prepareResponseItemFrom(xeroInvoice));
          }
        } catch (Exception e) {
          logger.error(e);
          invoiceErrors.get("OTHER").add(prepareResponseItemFrom(xeroInvoice));
        }
      }

      invoiceResync(x,null);

    } catch (Exception e) {
      logger.error(e);
      return saveResult(x, "invoiceSync", getExceptionResponse(x,e));
    }
    return saveResult(x, "invoiceSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setInvoiceErrors(invoiceErrors)
      .setSuccessInvoice(successInvoice.toArray(new InvoiceResponseItem[successInvoice.size()]))
      .build());
  }

  @Override
  public ResultResponse invoiceResync(X x, Invoice invoice) {
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Logger logger = (Logger) x.get("logger");
    List<Payment> paymentList = new ArrayList<>();
    List<XeroInvoice> invoiceList = new ArrayList<>();
    XeroClient client = getClient(x);
    User user = ((Subject) x.get("subject")).getUser();


    if ( invoice != null ) {
      XeroInvoice nanoInvoice =  (XeroInvoice) invoice;
      if ( invoice.getStatus() == InvoiceStatus.PROCESSING  ) {
        nanoInvoice.setDesync(true);
        invoiceDAO.put(nanoInvoice.fclone());
      }
      if ( user.getId() == invoice.getPayeeId() ) {
        return new ResultResponse.Builder(x)
          .setResult(true)
          .build();
      }
      //sync single invoice. Set desync to true to sync later if it fails
      try {
        ResultResponse validClient = isValidClient(client, x);
        if ( ! validClient.getResult() ) {
          return validClient;
        }
        com.xero.model.Invoice xeroInvoice = client.getInvoice(nanoInvoice.getXeroId());
        PaymentResponse payment = createPayment(x,nanoInvoice,xeroInvoice);
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
        return saveResult(x, "invoiceResync",new ResultResponse.Builder(x)
          .setResult(false)
          .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
          .setReason(e.getMessage())
          .build());
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
            PaymentResponse payment = createPayment(x,nanoInvoice,xeroInvoice);
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

          return saveResult(x, "invoiceResync", new ResultResponse.Builder(x)
            .setResult(false)
            .setReason("An Error has occurred.")
            .setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR)
            .build());
        }
      return saveResult(x, "invoiceResync", new ResultResponse.Builder(x)
        .setResult(false)
        .setReason(e.getMessage())
        .setErrorCode(AccountingErrorCodes.INTERNAL_ERROR)
        .build());
      }
    }
  }

   public ResultResponse getExceptionResponse(X x,Exception e) {

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

  private PaymentResponse createPayment(X x, XeroInvoice nanoInvoice, com.xero.model.Invoice xeroInvoice) {
    PaymentResponse response = new PaymentResponse();
    DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
    Logger logger = (Logger) x.get("logger");
    User user  = ((Subject) x.get("subject")).getUser();
    XeroClient client = getClient(x);

    ResultResponse validClient = isValidClient(client, x);
    if ( ! validClient.getResult() ) {
      response.response = validClient;
      return response;
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
      logger.error(e);
      response.response = getExceptionResponse(x,e);
      return response;
    }
  }

  @Override
  public ResultResponse removeToken(X x) {
    User user = ((Subject) x.get("subject")).getUser();
    DAO userDAO = ((DAO) x.get("localUserUserDAO")).inX(x);
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    DAO accountDAO = (DAO) x.get("accountDAO");
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
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
    User user = ((Subject) x.get("subject")).getUser();
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
    List<AccountingBankAccount> banksList = new ArrayList<>();
    DAO accountingBankDAO = (DAO) x.get("accountingBankAccountCacheDAO");
    Logger logger = (Logger) x.get("logger");
    XeroClient client = getClient(x);

    try {
      ResultResponse validClient = isValidClient(client, x);
      if ( ! validClient.getResult() ) {
        return validClient;
      }
      Organisation organisations = client.getOrganisations().get(0);
      token.setBusinessName(organisations.getLegalName());
      token.setOrganizationId(organisations.getOrganisationID());
      tokenDAO.put(token.fclone());

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
      return saveResult(x, "bankAccountSync", new ResultResponse.Builder(x)
        .setResult(true)
        .setBankAccountList(banksList.toArray(new AccountingBankAccount[banksList.size()]))
        .build());
    } catch ( Exception e ) {
      logger.error(e);
      ResultResponse response = getExceptionResponse(x,e);
      ArraySink sink = new ArraySink();
      if ( token != null && token.getOrganizationId() != null ) {
        accountingBankDAO.where(
          EQ(AccountingBankAccount.XERO_ORGANIZATION_ID, token.getOrganizationId())
        ).select(sink);
      }
      banksList = sink.getArray();
      response.setBankAccountList(banksList.toArray(new AccountingBankAccount[banksList.size()]));
      return saveResult(x, "bankAccountSync", response);
    }
  }

  @Override
  public ResultResponse singleInvoiceSync(X x, Invoice nanoInvoice) {
    User user = ((Subject) x.get("subject")).getUser();
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    XeroToken token = (XeroToken) tokenDAO.find(user.getId()).fclone();
    XeroClient client = getClient(x);
    Logger logger = (Logger) x.get("logger");
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = this.initInvoiceErrors();
    ContactMismatchPair[] contactMismatchPair = new ContactMismatchPair[1];

    try {
      ResultResponse validClient = isValidClient(client, x);
      if ( ! validClient.getResult() ) {
        return validClient;
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
      if ( importInvoice(x, xeroInvoice, invoiceErrors, true ) ) {
        return new ResultResponse.Builder(x)
          .setResult(true)
          .build();
      }

      return saveResult(x ,"singleInvoiceSync", new ResultResponse.Builder(x)
        .setResult(false)
        .setContactSyncMismatches(contactMismatchPair)
        .setInvoiceErrors(invoiceErrors)
        .build());
    } catch (Exception e){
      logger.error(e);
      return saveResult(x, "singleInvoiceSync", getExceptionResponse(x,e));
    }
  }

  public ResultResponse saveResult(X x, String method, ResultResponse resultResponse) {
    User user = ((Subject) x.get("subject")).getUser();

    ResultResponseWrapper resultWrapper = new ResultResponseWrapper();
    resultWrapper.setMethod(method);
    resultWrapper.setUserId(user.getId());
    resultWrapper.setResultResponse(resultResponse);

    return resultResponse;
  }

  public HashMap<String, List<ContactResponseItem>> initContactErrors() {
    HashMap<String, List<ContactResponseItem>> contactErrors = new HashMap<>();

    contactErrors.put("MISS_BUSINESS_EMAIL", new ArrayList<>());
    contactErrors.put("MISS_BUSINESS", new ArrayList<>());
    contactErrors.put("MISS_EMAIL", new ArrayList<>());
    contactErrors.put("OTHER", new ArrayList<>());

    return contactErrors;
  }

  public HashMap<String, List<InvoiceResponseItem>> initInvoiceErrors() {
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = new HashMap<>();

    invoiceErrors.put("MISS_CONTACT", new ArrayList<>());
    invoiceErrors.put("CURRENCY_NOT_SUPPORT", new ArrayList<>());
    invoiceErrors.put("UNAUTHORIZED_INVOICE", new ArrayList<>());
    invoiceErrors.put("OTHER", new ArrayList<>());

    return invoiceErrors;
  }

  public InvoiceResponseItem prepareResponseItemFrom(com.xero.model.Invoice invoice) {
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");

    InvoiceResponseItem errorItem = new InvoiceResponseItem();
    if ( invoice.getDueDate() != null ) {
      errorItem.setDueDate(format.format(invoice.getDueDate().getTime()));
    } else {
      errorItem.setDueDate("");
    }

    if ( SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ) {
      errorItem.setInvoiceNumber("");
    } else {
      errorItem.setInvoiceNumber(invoice.getInvoiceNumber());
    }

    if ( invoice.getAmountDue() != null && invoice.getCurrencyCode() != null ) {
      errorItem.setAmount(invoice.getAmountDue() + " " + invoice.getCurrencyCode().value());
    } else {
      errorItem.setAmount("");
    }

    return errorItem;
  }

  public ContactResponseItem prepareResponseItemFrom(com.xero.model.Contact xeroContact) {
    ContactResponseItem responseItem = new ContactResponseItem();
    responseItem.setBusinessName(xeroContact.getName());
    String name = "";
    if ( ! SafetyUtil.isEmpty(xeroContact.getFirstName()) ) {
      name = xeroContact.getFirstName() + " ";
    }
    if ( ! SafetyUtil.isEmpty(xeroContact.getLastName()) ) {
      name += xeroContact.getLastName();
    }
    responseItem.setName(name);
    return responseItem;
  }

}

class PaymentResponse {
  Payment payment;
  com.xero.model.Invoice xeroInvoice;
  ResultResponse response;
}
