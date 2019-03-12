package net.nanopay.integration.quick;

import com.intuit.ipp.core.Context;
import com.intuit.ipp.core.IEntity;
import com.intuit.ipp.core.ServiceType;
import com.intuit.ipp.data.*;
import com.intuit.ipp.exception.AuthenticationException;
import com.intuit.ipp.exception.FMSException;
import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.ipp.services.BatchOperation;
import com.intuit.ipp.services.CallbackHandler;
import com.intuit.ipp.services.DataService;
import com.intuit.ipp.util.Config;
import foam.blob.BlobService;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.nanos.NanoService;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.*;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.integration.*;
import net.nanopay.integration.quick.model.QuickContact;
import net.nanopay.integration.quick.model.QuickInvoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.Business;
import net.nanopay.model.Currency;

import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class NewQuickIntegrationService extends ContextAwareSupport
  implements IntegrationService, NanoService {

  private DAO tokenDAO;
  private DAO userDAO;
  private DAO invoiceDAO;
  private DAO contactDAO;
  private DAO cacheDAO;
  private DAO currencyDAO;
  private Logger logger;

  @Override
  public void start() throws Exception {
    this.tokenDAO = (DAO) getX().get("quickTokenStorageDAO");
    this.userDAO = (DAO) getX().get("localUserDAO");
    this.invoiceDAO = (DAO) getX().get("invoiceDAO");
    this.contactDAO   = (DAO) getX().get("contactDAO");
    this.cacheDAO     = (DAO) getX().get("AccountingContactEmailCacheDAO");
    this.currencyDAO = (DAO) getX().get("currencyDAO");
    this.logger         = (Logger) getX().get("logger");
  }

  @Override
  public ResultResponse isSignedIn(X x) {
    User              user         = (User) x.get("user");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) tokenDAO.inX(x).find(user.getId());

    if ( tokenStorage == null ) {
      return new ResultResponse.Builder(x).setResult(false).build();
    }

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse contactSync(X x) {
    List<ContactMismatchPair> result = new ArrayList<>();
    List<String> invalidContacts = new ArrayList<>();

    try {

      // fetch the contacts
      List<NameBase> contacts = fetchContacts(x);

      for ( NameBase contact : contacts ) {
        try {
          // do validation
          if ( ! isValidContact(contact, invalidContacts) ) {
            continue;
          }

          // import
          ContactMismatchPair mismatch = importContact(x, contact);

          if ( mismatch != null ) {
            result.add(mismatch);
          }

        } catch ( Exception e ) {
          invalidContacts.add("Can not import quick contact # " + contact.getId() + ", " + e.getMessage());
        }

      }

    } catch ( Exception e ) {
      return errorHandler(e);
    }

    return new NewResultResponse.Builder(x)
      .setResult(true)
      .setSyncContactsResult(result.toArray(new ContactMismatchPair[result.size()]))
      .setInValidContact(invalidContacts.toArray(new String[invalidContacts.size()]))
      .build();
  }

  @Override
  public ResultResponse invoiceSync(X x) {
    List<String> result = new ArrayList<>();

    try {

      List<Transaction> list = fetchInvoices(x);

      for ( Transaction invoice : list ) {

        try {
          String importResult = importInvoice(x, invoice);
          if ( importResult != null ) {
            result.add(importResult);
          }
        } catch ( Exception e ) {
          result.add(e.getMessage());
        }
      }

      reSyncInvoices(x);

    } catch (Exception e) {

      errorHandler(e);
    }

    return new NewResultResponse.Builder(x)
      .setResult(true)
      .setInValidInvoice(result.toArray(new String[result.size()]))
      .build();
  }

  @Override
  public ResultResponse syncSys(X x) {

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse removeToken(X x) {
    User              user         = (User) x.get("user");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) tokenDAO.inX(x).find(user.getId());

    if ( tokenStorage == null ) {
      return new ResultResponse(false, "User has not connected to Quick Books");
    }

    tokenDAO.inX(x).remove(tokenStorage.fclone());
    user = (User) user.fclone();
    user.clearIntegrationCode();
    userDAO.inX(x).put(user);

    return new ResultResponse(true, "User has been signed out of Quick Books");
  }

  @Override
  public List<AccountingBankAccount> pullBanks(X x) {
    List<AccountingBankAccount> results = new ArrayList<>();

    String query = "select * from account where AccountType = 'Bank'";
    List<Account> accounts = sendRequest(x, query);

    for ( Account account : accounts ) {
      AccountingBankAccount xBank = new AccountingBankAccount();
      xBank.setAccountingName("QUICK");
      xBank.setAccountingId(account.getId());
      xBank.setName(account.getName());
      xBank.setCurrencyCode(account.getCurrencyRef().getValue());
      results.add(xBank);
    }

    return results;
  }

  @Override
  public ResultResponse reSyncInvoice(X x, net.nanopay.invoice.model.Invoice invoice) {
    QuickInvoice quickInvoice = (QuickInvoice) invoice.fclone();

    try {

      Transaction payment = createPaymentFor(x, quickInvoice);
      create(x, payment);
      quickInvoice.setDesync(false);
      quickInvoice.setComplete(true);
      invoiceDAO.inX(x).put(quickInvoice);

      return new NewResultResponse.Builder(x)
        .setResult(true).build();
    } catch ( Exception e ) {
      quickInvoice.setDesync(true);
      invoiceDAO.inX(x).put(quickInvoice);

      return new NewResultResponse.Builder(x)
        .setResult(false)
        .setReason(e.getMessage())
        .build();
    }
  }

  public void reSyncInvoices(X x) {
    User            user           = (User) x.get("user");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) tokenDAO.inX(x).find(user.getId());

    // 1. find all the deSync invoices
    ArraySink select = (ArraySink) invoiceDAO.inX(x).where(AND(
      EQ(QuickInvoice.REALM_ID, tokenStorage.getRealmId()),
      EQ(QuickInvoice.DESYNC, true)
    )).select(new ArraySink());
    ArrayList<QuickInvoice> quickInvoices = (ArrayList<QuickInvoice>) select.getArray();

    // 2. prepare the batch request
    BatchOperation batchOperation = new BatchOperation();

    for ( QuickInvoice quickInvoice : quickInvoices ) {
      batchOperation.addEntity(createPaymentFor(x, quickInvoice), OperationEnum.CREATE, quickInvoice.getQuickId());
    }

    batchOperation(x, batchOperation, null);

    // 3. get the result of the batch request
    Set<String> failedSet = new HashSet<>();
    for (String batchId : batchOperation.getFaultResult().keySet()) {
      failedSet.add(batchId);
    }

    for ( QuickInvoice quickInvoice : quickInvoices ) {
      if ( ! failedSet.contains(quickInvoice.getQuickId()) ) {
        quickInvoice.setDesync(false);
        invoiceDAO.inX(x).put(quickInvoice);
      } else {
        System.out.println(quickInvoice.getQuickId());
      }
    }
  }

  public NewResultResponse errorHandler(Exception e ) {
    e.printStackTrace();

    NewResultResponse resultResponse = new NewResultResponse();

    if ( e instanceof AuthenticationException ) {
      resultResponse.setErrorCode(AccountingErrorCodes.TOKEN_EXPIRED);
      resultResponse.setReason(AccountingErrorCodes.TOKEN_EXPIRED.getLabel());
    } else {
      resultResponse.setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR);
      resultResponse.setReason(AccountingErrorCodes.ACCOUNTING_ERROR.getLabel());
    }

    resultResponse.setResult(false);
    return resultResponse;
  }

  public boolean isValidContact(NameBase quickContact, List<String> invalidContacts) {
    if (
      quickContact.getPrimaryEmailAddr() == null ||
      SafetyUtil.isEmpty(quickContact.getGivenName()) ||
      SafetyUtil.isEmpty(quickContact.getFamilyName()) ||
      SafetyUtil.isEmpty(quickContact.getCompanyName()) )
    {
      String str = "Quick Contact # " +
        quickContact.getId() +
        " can not be added because the contact is missing: " +
        (quickContact.getPrimaryEmailAddr() == null ? "[Email]" : "") +
        (SafetyUtil.isEmpty(quickContact.getGivenName()) ? " [Given Name] " : "") +
        (SafetyUtil.isEmpty(quickContact.getCompanyName()) ? " [Company Name] " : "") +
        (SafetyUtil.isEmpty(quickContact.getFamilyName()) ? " [Family Name] " : "");

      invalidContacts.add(str);
      return false;
    }
    return true;
  }

  public ContactMismatchPair importContact(foam.core.X x, NameBase importContact) {
    User              user         = (User) x.get("user");
    DAO            userDAO        = ((DAO) x.get("localUserUserDAO")).inX(x);
    DAO            businessDAO    = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO            agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));
    QuickTokenStorage tokenStorage = (QuickTokenStorage) tokenDAO.inX(x).find(user.getId());

    EmailAddress email = importContact.getPrimaryEmailAddr();

    cacheDAO.inX(x).put(
      new AccountingContactEmailCache.Builder(x)
        .setQuickId(importContact.getId())
        .setRealmId(tokenStorage.getRealmId())
        .setEmail(email.getAddress())
        .build()
    );

    Contact existContact = (Contact) contactDAO.inX(x).find(AND(
      EQ(Contact.EMAIL, email.getAddress()),
      EQ(Contact.OWNER, user.getId())
    ));

    // existing user
    User existUser = (User) userDAO.find(
      EQ(User.EMAIL, email.getAddress())
    );

    // If the contact is a existing contact
    if ( existContact != null ) {

      // existing user
      if ( existUser != null ) {
        return null;
      }

      if ( existContact instanceof  QuickContact &&
           (( QuickContact ) existContact).getQuickId().equals(importContact.getId()) ) {
        contactDAO.inX(x).put(
          updateQuickContact(x, importContact, (QuickContact) existContact.fclone(), false)
        );
      } else {
        return new ContactMismatchPair.Builder(x)
          .setExistContact(existContact)
          .setNewContact(createQuickContactFrom(x, importContact, false))
          .build();
      }
    }

    // If the contact is not a existing contact
    if ( existContact == null ) {

      if ( existUser != null ) {

        ArraySink sink = (ArraySink) agentJunctionDAO.where(EQ(
          UserUserJunction.SOURCE_ID, existUser.getId()
        )).select(new ArraySink());

        if ( sink.getArray().size() == 0 ) {
          //
        }

        if ( sink.getArray().size() == 1 ) {
          QuickContact temp = createQuickContactFrom(x, importContact, true);
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          temp.setOrganization(business.getOrganization());
          temp.setBusinessName(business.getBusinessName());
          temp.setBusinessId(business.getId());
          temp.setEmail(business.getEmail());
          contactDAO.inX(x).put(temp);
        }

        if ( sink.getArray().size() > 1) {
          QuickContact temp = createQuickContactFrom(x, importContact, true);
          temp.setChooseBusiness(true);
          temp.setEmail(email.getAddress());
          temp.setFirstName(existUser.getFirstName());
          temp.setLastName(existUser.getLastName());
          temp.setOrganization("TBD");
          temp.setBusinessName("TBD");
          return new ContactMismatchPair(temp, null);
        }
      }

      if ( existUser == null ) {
        contactDAO.inX(x).put(createQuickContactFrom(x, importContact, false));
      }
    }

    return null;
  }

  public QuickContact createQuickContactFrom(foam.core.X x, NameBase importContact, boolean existUser) {
    return updateQuickContact(x, importContact, new QuickContact(), existUser);
  }

  public QuickContact updateQuickContact(X x, NameBase importContact, QuickContact existContact, boolean existUser) {
    User            user           = (User) x.get("user");
    CountryService  countryService = (CountryService) x.get("countryService");
    RegionService   regionService  = (RegionService) x.get("regionService");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) tokenDAO.inX(x).find(user.getId());

    EmailAddress email = importContact.getPrimaryEmailAddr();

    QuickContact newContact = existContact;

    if ( ! existUser ) {
      /*
       * Address integration
       */
      Address           portalAddress   = new Address();
      PhysicalAddress customerAddress = importContact instanceof Customer ?
        ( (Customer) importContact ).getBillAddr() :
        ( (Vendor) importContact ).getBillAddr();

      if ( customerAddress != null ) {
        Country country =
          ! SafetyUtil.isEmpty(customerAddress.getCountry()) ?
            countryService.getCountry(customerAddress.getCountry()) : null;

        Region region =
          ! SafetyUtil.isEmpty(customerAddress.getCountrySubDivisionCode()) ?
            regionService.getRegion(customerAddress.getCountrySubDivisionCode()) : null;

        portalAddress.setAddress1(customerAddress.getLine1());
        portalAddress.setAddress2(customerAddress.getLine2());
        portalAddress.setCity(customerAddress.getCity());
        portalAddress.setPostalCode(customerAddress.getPostalCode());
        portalAddress.setRegionId(country != null ? country.getCode() : null);
        portalAddress.setCountryId(region != null ? region.getCode() : null);

        newContact.setBusinessAddress(portalAddress);
      }

      /*
       * Phone integration
       */
      String busPhoneNumber =
        importContact.getPrimaryPhone() != null ?
          importContact.getPrimaryPhone().getFreeFormNumber() : "";

      String mobilePhoneNumber =
        importContact.getMobile() != null ?
          importContact.getMobile().getFreeFormNumber() : "";

      Phone businessPhone = new Phone.Builder(x)
        .setNumber( busPhoneNumber )
        .setVerified( ! busPhoneNumber.equals("") )
        .build();

      Phone mobilePhone = new Phone.Builder(x)
        .setNumber( mobilePhoneNumber )
        .setVerified( ! mobilePhoneNumber.equals("") )
        .build();

      newContact.setOrganization(importContact.getCompanyName());
      newContact.setFirstName(importContact.getGivenName());
      newContact.setLastName(importContact.getFamilyName());
      newContact.setBusinessPhone(businessPhone);
      newContact.setMobile(mobilePhone);
    }


    newContact.setEmail(email.getAddress());
    newContact.setType("Contact");
    newContact.setGroup("sme");
    newContact.setQuickId(importContact.getId());
    newContact.setRealmId(tokenStorage.getRealmId());
    newContact.setOwner(user.getId());

    return newContact;
  }

  public String importInvoice(X x, Transaction qInvoice) {
    User user = (User) x.get("user");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) tokenDAO.inX(x).find(user.getId());

    // 1. Check the customer or vendor email
    String id = qInvoice instanceof Bill ?
      ( (Bill) qInvoice )   .getVendorRef().getValue() :
      ( (Invoice) qInvoice ).getCustomerRef().getValue();

    AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.inX(x).find(AND(
      EQ(AccountingContactEmailCache.QUICK_ID, id),
      EQ(AccountingContactEmailCache.REALM_ID, tokenStorage.getRealmId())
    ));

    if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
      return "Invoice can not import because contact do not exist.";
    }

    // 2. If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    Contact contact = (Contact) contactDAO.inX(x).find(
      AND(
        EQ(QuickContact.EMAIL, cache.getEmail()),
        EQ(QuickContact.OWNER, user.getId())
      ));
    if ( contact == null ) {
      return "Invoice can not import because contact do not exist.";
    }

    QuickInvoice existInvoice = (QuickInvoice) invoiceDAO.inX(x).find(
      AND(
        EQ(QuickInvoice.QUICK_ID,   qInvoice.getId()),
        EQ(QuickInvoice.REALM_ID,   tokenStorage.getRealmId()),
        EQ(QuickInvoice.CREATED_BY, user.getId())
      ));

    BigDecimal balance = qInvoice instanceof Bill ?
      ( (Bill) qInvoice ) .getBalance() : ( (Invoice) qInvoice ) .getBalance();

    if ( existInvoice != null ) {

      existInvoice = (QuickInvoice) existInvoice.fclone();

      // if desync, continue
      if ( existInvoice.getDesync() ) {
        return null;
      }

      if (! (
          net.nanopay.invoice.model.InvoiceStatus.UNPAID  ==   existInvoice.getStatus() ||
          net.nanopay.invoice.model.InvoiceStatus.DRAFT   == existInvoice.getStatus() ||
          net.nanopay.invoice.model.InvoiceStatus.OVERDUE == existInvoice.getStatus() ))
      {
        return null;
      }

      if ( balance.doubleValue() == 0.0 && existInvoice.getAmount() != 0 ) {
        existInvoice.setPaymentMethod(PaymentStatus.VOID);
        existInvoice.setStatus(InvoiceStatus.VOID);
        existInvoice.setDraft(true);
        invoiceDAO.inX(x).put(existInvoice);
        invoiceDAO.inX(x).remove(existInvoice);
        return null;
      }
    }

    if ( existInvoice == null ) {

      if ( balance.doubleValue() == 0.0 ) {
        return null;
      }

      existInvoice = new QuickInvoice();
    }

    Currency currency = (Currency) currencyDAO.inX(x).find(qInvoice.getCurrencyRef().getValue());
    double doubleAmount = balance.doubleValue() * Math.pow(10.0, currency.getPrecision());

    if ( qInvoice instanceof Bill ) {
      existInvoice.setPayerId(user.getId());
      existInvoice.setPayeeId(contact.getId());
      existInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
      existInvoice.setDueDate(( (Bill) qInvoice ).getDueDate());
      existInvoice.setInvoiceFile(getAttachments(x, "bill", qInvoice.getId()));
    }

    if ( qInvoice instanceof Invoice) {
      existInvoice.setPayerId(contact.getId());
      existInvoice.setPayeeId(user.getId());
      existInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
      existInvoice.setDraft(true);
      existInvoice.setDueDate(( (Invoice) qInvoice ).getDueDate());
      existInvoice.setInvoiceFile(getAttachments(x, "invoice", qInvoice.getId()));
    }

    existInvoice.setAmount(Math.round(doubleAmount));
    existInvoice.setDesync(false);
    existInvoice.setInvoiceNumber(qInvoice.getDocNumber());
    existInvoice.setDestinationCurrency(qInvoice.getCurrencyRef().getValue());
    existInvoice.setIssueDate(qInvoice.getTxnDate());
    existInvoice.setQuickId(qInvoice.getId());
    existInvoice.setRealmId(tokenStorage.getRealmId());
    existInvoice.setCreatedBy(user.getId());
    existInvoice.setContactId(contact.getId());

    invoiceDAO.inX(x).put(existInvoice);

    return null;
  }

  public File[] getAttachments(X x, String type, String id) {
    User user = (User) x.get("user");
    BlobService blobStore    = (BlobService) x.get("blobStore");
    DAO               fileDAO      = ((DAO) x.get("fileDAO")).inX(x);

    String query = "select * from attachable where AttachableRef.EntityRef.Type = '" + type +
                   "' and AttachableRef.EntityRef.value = '" + id + "'";

    List<Attachable> list = sendRequest(x, query);

    List<File> files = list.stream().map(attachment -> {
      try {
        URL url = new URL(attachment.getTempDownloadUri());
        foam.blob.Blob data = blobStore.put_(x, new foam.blob.InputStreamBlob(url.openStream(), attachment.getSize()));

        return (File) fileDAO.inX(x).put(new File.Builder(x)
          .setId(attachment.getId())
          .setOwner(user.getId())
          .setMimeType(attachment.getContentType())
          .setFilename(attachment.getFileName())
          .setFilesize(attachment.getSize())
          .setData(data)
          .build());
      } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException(e.getMessage());
      }
    }).filter(Objects::nonNull)
      .collect(Collectors.toList());

    return files.toArray(new File[files.size()]);
  }

  public Transaction createPaymentFor(X x, QuickInvoice quickInvoice) {
    User user        = (User) x.get("user");

    String type = "";
    Currency currency = null;
    BankAccount account = null;

    if ( quickInvoice.getPayeeId() == user.getId() ) {
      type = "Invoice";
      currency = (Currency) currencyDAO.inX(x).find(quickInvoice.getSourceCurrency());
      account = BankAccount.findDefault(x, user, quickInvoice.getSourceCurrency());
    }

    if ( quickInvoice.getPayerId() == user.getId() ) {
      type = "Bill";
      currency = (Currency) currencyDAO.inX(x).find(quickInvoice.getDestinationCurrency());
      account = BankAccount.findDefault(x, user, quickInvoice.getDestinationCurrency());
    }

    if ( SafetyUtil.isEmpty(account.getIntegrationId()) ) {
      throw new RuntimeException("No bank accounts synchronised to Quick");
    }

    BigDecimal amount = new BigDecimal(quickInvoice.getAmount());
    amount = amount.movePointLeft(currency.getPrecision());

    // 1. linked transaction
    LinkedTxn linkedTxn = new LinkedTxn();
    linkedTxn.setTxnId(quickInvoice.getQuickId());
    linkedTxn.setTxnType(type);
    List<LinkedTxn> linkedTxnList = new ArrayList<>();
    linkedTxnList.add(linkedTxn);

    // 2. contact ref
    QuickContact contact = (QuickContact) contactDAO.inX(x).find(quickInvoice.getContactId());
    ReferenceType contactRef = new ReferenceType();
    contactRef.setName(contact.getBusinessName());
    contactRef.setValue(contact.getQuickId());

    // 3.
    Line line = new Line();
    line.setLinkedTxn(linkedTxnList);
    line.setAmount(amount);
    List<Line> lineList = new ArrayList<>();
    lineList.add(line);

    // 4.
    ReferenceType bankRef = new ReferenceType();
    bankRef.setValue(account.getIntegrationId());

    if ( type.equals("Invoice") ) {
      Payment payment = new Payment();
      payment.setCustomerRef(contactRef);
      payment.setLine(lineList);
      payment.setTotalAmt(amount);
      payment.setDepositToAccountRef(bankRef);
      return payment;
    }

    if ( type.equals("Bill") ) {
      BillPayment payment = new BillPayment();
      payment.setVendorRef(contactRef);
      payment.setLine(lineList);
      payment.setTotalAmt(amount);

      BillPaymentCheck check = new BillPaymentCheck();
      check.setBankAccountRef(bankRef);

      payment.setCheckPayment(check);
      payment.setPayType(BillPaymentTypeEnum.CHECK);
      return payment;
    }

    return null;
  }

  /*******************************
   * Networking request section  *
   *******************************/

  public List fetchContacts(foam.core.X x) {

    List result = new ArrayList();

    String queryCustomer = "select * from customer";
    String queryVendor   = "select * from vendor";

    result.addAll(sendRequest(x, queryCustomer));
    result.addAll(sendRequest(x, queryVendor));

    return result;
  }

  public NameBase fetchContactById(foam.core.X x, String type, String id) {
    String query = "select * from "+ type +" where id = '"+ id +"'";
    return (NameBase) sendRequest(x, query).get(0);
  }

  public List fetchInvoices(X x) throws Exception {

    List result = new ArrayList();

    String queryBill    = "select * from bill";
    String queryInvoice = "select * from invoice";

    result.addAll(sendRequest(x, queryBill));
    result.addAll(sendRequest(x, queryInvoice));

    return result;
  }


  public List sendRequest(foam.core.X x, String query) {
    User user       = (User) x.get("user");
    DAO store       = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                         configDAO = ((DAO) x.get("quickConfigDAO")).inX(x);
    QuickConfig                 config    = (QuickConfig)configDAO.find(app.getUrl());
    QuickTokenStorage  tokenStorage = (QuickTokenStorage) store.find(user.getId());

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, tokenStorage.getRealmId());
      DataService service =  new DataService(context);

      return service.executeQuery(query).getEntities();
    } catch ( Exception e ) {
      throw new RuntimeException("Error fetch QuickBook data.", e);
    }
  }

  public IEntity create(foam.core.X x, IEntity object) {
    User user       = (User) x.get("user");
    DAO store       = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                         configDAO = ((DAO) x.get("quickConfigDAO")).inX(x);
    QuickConfig                 config    = (QuickConfig)configDAO.find(app.getUrl());
    QuickTokenStorage  tokenStorage = (QuickTokenStorage) store.find(user.getId());

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, tokenStorage.getRealmId());
      DataService service =  new DataService(context);

      return service.add(object);
    } catch ( Exception e ) {
      throw new RuntimeException("Error fetch QuickBook data.", e);
    }
  }

  public void batchOperation(X x, BatchOperation operation, CallbackHandler callbackHandler) {
    User user       = (User) x.get("user");
    DAO store       = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                         configDAO = ((DAO) x.get("quickConfigDAO")).inX(x);
    QuickConfig                 config    = (QuickConfig)configDAO.find(app.getUrl());
    QuickTokenStorage  tokenStorage = (QuickTokenStorage) store.find(user.getId());

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, tokenStorage.getRealmId());
      DataService service =  new DataService(context);

      service.executeBatch(operation);
    } catch ( Exception e ) {
      throw new RuntimeException("Error fetch QuickBook data.", e);
    }
  }
}
