package net.nanopay.accounting.quickbooks;

import com.google.gson.Gson;
import com.intuit.ipp.core.Context;
import com.intuit.ipp.core.IEntity;
import com.intuit.ipp.core.ServiceType;
import com.intuit.ipp.data.*;
import com.intuit.ipp.exception.AuthenticationException;
import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.ipp.services.BatchOperation;
import com.intuit.ipp.services.CallbackHandler;
import com.intuit.ipp.services.DataService;
import com.intuit.ipp.services.QueryResult;
import com.intuit.ipp.util.Config;
import foam.blob.BlobService;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.*;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.nanos.om.OMLogger;
import foam.util.SafetyUtil;
import net.nanopay.accounting.resultresponse.ContactResponseItem;
import net.nanopay.accounting.resultresponse.InvoiceResponseItem;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.accounting.*;
import net.nanopay.accounting.quickbooks.model.QuickbooksContact;
import net.nanopay.accounting.quickbooks.model.QuickbooksInvoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.Business;
import foam.core.Currency;

import java.math.BigDecimal;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.NEQ;

public class QuickbooksIntegrationService extends ContextAwareSupport
  implements IntegrationService, NanoService {

  private DAO tokenDAO;
  private DAO userDAO;
  private DAO invoiceDAO;
  private DAO contactDAO;
  private DAO cacheDAO;
  private DAO currencyDAO;
  private DAO resultDAO;
  private Logger logger;
  private OMLogger omLogger;
  @Override
  public void start() throws Exception {
    this.tokenDAO = (DAO) getX().get("quickbooksTokenDAO");
    this.userDAO = (DAO) getX().get("localUserDAO");
    this.invoiceDAO = (DAO) getX().get("invoiceDAO");
    this.contactDAO   = (DAO) getX().get("contactDAO");
    this.cacheDAO     = (DAO) getX().get("AccountingContactEmailCacheDAO");
    this.currencyDAO = (DAO) getX().get("currencyDAO");
    this.resultDAO  = (DAO) getX().get("accountingResultDAO");
    this.logger         = (Logger) getX().get("logger");
    this.omLogger = (OMLogger) getX().get("OMLogger");
  }

  @Override
  public ResultResponse isSignedIn(X x) {
    User user = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    if ( token == null  || ! (user.getIntegrationCode() == IntegrationCode.QUICKBOOKS)) {
      return new ResultResponse.Builder(x).setResult(false).setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN).build();
    }

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse contactSync(X x) {
    List<ContactMismatchPair> result = new ArrayList<>();
    List<ContactResponseItem> success = new ArrayList<>();
    HashMap<String, List<ContactResponseItem>> contactErrors = this.initContactErrors();

    try {

      // fetch the contacts
      List<NameBase> contacts = fetchContacts(x);

      for ( NameBase contact : contacts ) {
        try {
          // do validation
          if ( ! isValidContact(contact, contactErrors) ) {
            continue;
          }

          // import
          ContactMismatchPair mismatch = importContact(x, contact, contactErrors);

          if ( mismatch != null ) {
            result.add(mismatch);
          } else {
            success.add(prepareContactResponseItem(contact));
          }

        } catch ( Exception e ) {
          if ( "skip".equals(e.getMessage())) {

          } else {
            logger.error(e);
            ContactResponseItem errorItem = new ContactResponseItem();
            errorItem.setName(contact.getDisplayName());
            errorItem.setBusinessName(contact.getCompanyName());
            errorItem.setMessage(e.getMessage());
            contactErrors.get("OTHER").add(errorItem);
          }
        }

      }

    } catch ( Exception e ) {
      return saveResult(x, "contactSync" ,errorHandler(e));
    }

    return saveResult(x, "contactSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setContactSyncMismatches(result.toArray(new ContactMismatchPair[result.size()]))
      .setContactErrors(contactErrors)
      .setSuccessContact(success.toArray(new ContactResponseItem[success.size()]))
      .build());
  }

  @Override
  public ResultResponse invoiceSync(X x) {
    User user = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    if ( token != null ) {
      token = (QuickbooksToken) token.fclone();
    }
    List<InvoiceResponseItem> successResult = new ArrayList<>();
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = this.initInvoiceErrors();

    try {

      List<Transaction> list = fetchInvoices(x);
      CompanyInfo companyInfo = fetchCompanyInfo(x);

      token.setBusinessName(companyInfo.getCompanyName());
      tokenDAO.put(token.fclone());
      for ( Transaction invoice : list ) {

        try {
          String importResult = importInvoice(x, invoice, invoiceErrors);
          if ( importResult == null ) {
            successResult.add(prepareErrorItemFrom(invoice));
          }

        } catch ( Exception e ) {
          logger.error(e);
          InvoiceResponseItem errorItem = prepareErrorItemFrom(invoice);
          errorItem.setMessage(e.getMessage());
          invoiceErrors.get("OTHER").add(errorItem);
        }
      }

      reSyncInvoices(x);

    } catch (Exception e) {
      return saveResult(x, "invoiceSync" ,errorHandler(e));
    }

    return saveResult(x, "invoiceSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setSuccessInvoice(successResult.toArray(new InvoiceResponseItem[successResult.size()]))
      .setInvoiceErrors(invoiceErrors)
      .build());
  }

  @Override
  public ResultResponse singleInvoiceSync(X x, net.nanopay.invoice.model.Invoice nanoInvoice){
    User user = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = this.initInvoiceErrors();
    List<InvoiceResponseItem> successResult = new ArrayList<>();


    try {
      QuickbooksInvoice qInvoice = (QuickbooksInvoice) nanoInvoice;
      String type = user.getId() == qInvoice.getPayeeId() ?
        "Invoice" : "bill";
      if ( token == null ) {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setReason("User is not synced with Quickbooks")
          .setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN)
          .setReason(qInvoice.getBusinessName())
          .build();
      }
      if ( ! token.getRealmId().equals(((QuickbooksInvoice) nanoInvoice).getRealmId()) ) {
        return new ResultResponse.Builder(x)
          .setResult(false)
          .setReason("User is not synced with the right Quickbooks organization")
          .setErrorCode(AccountingErrorCodes.INVALID_ORGANIZATION)
          .setReason(qInvoice.getBusinessName())
          .build();
      }

      Transaction invoice = fetchInvoiceById(x, type, qInvoice.getQuickId());

      String importResult = importInvoice(x, invoice, invoiceErrors);
      if ( importResult != null ) {
        successResult.add(prepareErrorItemFrom(invoice));
      }

    } catch ( Exception e ) {
      return saveResult(x, "singleInvoiceSync", errorHandler(e));
    }

    return saveResult(x, "singleInvoiceSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setSuccessInvoice(successResult.toArray(new InvoiceResponseItem[successResult.size()]))
      .setInvoiceErrors(invoiceErrors)
      .build());
  }

  @Override
  public ResultResponse removeToken(X x) {
    User              user         = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    DAO accountDAO = (DAO) x.get("accountDAO");
    ArraySink sink = new ArraySink();
    if ( token == null ) {
      return new ResultResponse.Builder(x).setResult(false).setReason("User has not connected to Quick Books").setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN).build();
    }

    tokenDAO.inX(x).remove(token.fclone());
    user = (User) user.fclone();
    user.clearIntegrationCode();
    userDAO.inX(x).put(user);

    //remove bank accounts
    accountDAO.where(AND(
      EQ(BankAccount.OWNER, user.getId()),
      NEQ(BankAccount.INTEGRATION_ID, "")
    )).select(sink);
    List<BankAccount> bankAccountList = sink.getArray();

    for ( BankAccount account: bankAccountList ) {
      account = (BankAccount) account.fclone();
      account.setIntegrationId("");
      accountDAO.put(account);
    }

    return new ResultResponse.Builder(x).setResult(false).setReason("User has been signed out of Quick Books").build();
  }

  @Override
  public ResultResponse bankAccountSync(X x) {
    List<AccountingBankAccount> results = new ArrayList<>();
    User            user           = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    DAO accountingBankDAO = (DAO) x.get("accountingBankAccountCacheDAO");

    ResultResponse resultResponse = null;

    try {
      String query = "select * from account where AccountType = 'Bank'";
      List<Account> accounts = sendRequest(x, query, "account");

      for ( Account account : accounts ) {
        AccountingBankAccount xBank = new AccountingBankAccount();
        xBank.setRealmId(token.getRealmId());
        xBank.setQuickBooksBankAccountId(account.getId());
        xBank.setName(account.getName());
        xBank.setCurrencyCode(account.getCurrencyRef().getValue());
        results.add(xBank);
        accountingBankDAO.put(xBank);
      }

      resultResponse =  new ResultResponse.Builder(x)
        .setResult(true)
        .setBankAccountList(results.toArray(new AccountingBankAccount[accounts.size()]))
        .build();
      return saveResult(x,"bankAccountSync", resultResponse);

    } catch ( Exception e ) {
      logger.error(e);
      ResultResponse response = errorHandler(e);
      ArraySink sink = new ArraySink();
      if ( token != null && token.getRealmId() != null ) {
        accountingBankDAO.where(
          EQ(AccountingBankAccount.REALM_ID, token.getRealmId())
        ).select(sink);
        results = sink.getArray();
      }
      response.setBankAccountList(results.toArray(new AccountingBankAccount[results.size()]));
      return saveResult(x,"bankAccountSync", response);
    }
  }

  @Override
  public ResultResponse invoiceResync(X x, net.nanopay.invoice.model.Invoice invoice) {
    QuickbooksInvoice quickInvoice = (QuickbooksInvoice) invoice.fclone();
    User user = ((Subject) x.get("subject")).getUser();

    ResultResponse resultResponse = null;

    try {

      // if it's receivable, skip it for now
      if ( invoice.getPayeeId() == user.getId() && invoice.getStatus() == InvoiceStatus.PROCESSING ) {
        quickInvoice.setDesync(true);
        invoiceDAO.inX(x).put(quickInvoice);
        return new ResultResponse.Builder(x)
          .setResult(true).build();
      }

      if ( invoice.getStatus() == InvoiceStatus.PAID ) {}

      Transaction payment = createPaymentFor(x, quickInvoice);
      create(x, payment);
      quickInvoice.setDesync(false);
      quickInvoice.setComplete(true);
      invoiceDAO.inX(x).put(quickInvoice);

      resultResponse = new ResultResponse.Builder(x)
        .setResult(true).build();
      return saveResult(x,"invoiceResync", resultResponse);
    } catch ( Exception e ) {
      logger.error(e);
      quickInvoice.setDesync(true);
      invoiceDAO.inX(x).put(quickInvoice);
      resultResponse = errorHandler(e);
      return saveResult(x,"bankAccountSync", resultResponse);
    }
  }

  public void reSyncInvoices(X x) {
    User            user           = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    Logger logger = (Logger) x.get("logger");
    // 1. find all the deSync invoices
    ArraySink select = (ArraySink) invoiceDAO.inX(x).where(AND(
      EQ(QuickbooksInvoice.REALM_ID, token.getRealmId()),
      EQ(QuickbooksInvoice.DESYNC, true)
    )).select(new ArraySink());
    ArrayList<QuickbooksInvoice> quickInvoices = (ArrayList<QuickbooksInvoice>) select.getArray();

    // 2. prepare the batch request
    BatchOperation batchOperation = new BatchOperation();
    String request = "";
    Gson gson = new Gson();
    for ( QuickbooksInvoice quickInvoice : quickInvoices ) {
      Transaction paymentFor = createPaymentFor(x, quickInvoice);
      batchOperation.addEntity(paymentFor, OperationEnum.CREATE, quickInvoice.getQuickId());
      String json1 = gson.toJson(paymentFor);
      request = request + "{ " + json1 + ", quickInvoiceId:" + quickInvoice.getId() + " }, ";
    }
    logger.debug("QBO batch request: " + request);

    batchOperation(x, batchOperation, null);
    String json = gson.toJson(batchOperation.getFaultResult());
    logger.debug("QBO batch response: " + json);
    // 3. get the result of the batch request
    Set<String> failedSet = new HashSet<>();
    for (String batchId : batchOperation.getFaultResult().keySet()) {
      failedSet.add(batchId);
    }

    for ( QuickbooksInvoice quickInvoice : quickInvoices ) {
      if ( ! failedSet.contains(quickInvoice.getQuickId()) ) {
        quickInvoice.setDesync(false);
        invoiceDAO.inX(x).put(quickInvoice);
      } else {
        System.out.println(quickInvoice.getQuickId());
      }
    }
  }

  public ResultResponse errorHandler(Throwable e ) {
    this.logger.error(e);

    ResultResponse resultResponse = new ResultResponse();
    resultResponse.setResult(false);

    if ( e instanceof AccountingException ) {
      AccountingException accountingException = (AccountingException) e;

      // if error codes has already been set
      if ( accountingException.getErrorCodes() != null ) {
        resultResponse.setErrorCode(accountingException.getErrorCodes());
        resultResponse.setReason(e.getMessage());
        return resultResponse;
      }

      if ( accountingException.getCause() != null ) {
        Throwable temp = accountingException.getCause();
        if ( temp instanceof AuthenticationException ) {
          resultResponse.setErrorCode(AccountingErrorCodes.TOKEN_EXPIRED);
          resultResponse.setReason(AccountingErrorCodes.TOKEN_EXPIRED.getLabel());
          this.omLogger.log("Quickbooks post request");
        } else {
          this.omLogger.log("Quickbooks timeout");
          resultResponse.setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR);
          resultResponse.setReason(AccountingErrorCodes.ACCOUNTING_ERROR.getLabel());
        }

        return resultResponse;
      }
    }

    resultResponse.setErrorCode(AccountingErrorCodes.INTERNAL_ERROR);
    resultResponse.setReason(e.getMessage());
    return resultResponse;
  }

  public boolean isValidContact(NameBase quickContact, HashMap<String, List<ContactResponseItem>> contactErrors) {
    ContactResponseItem error = new ContactResponseItem();
    error.setName(quickContact.getDisplayName());

    if ( quickContact.getPrimaryEmailAddr() == null && SafetyUtil.isEmpty(quickContact.getCompanyName()) ) {
      contactErrors.get("MISS_BUSINESS_EMAIL").add(error);
      return false;
    }

    if ( SafetyUtil.isEmpty(quickContact.getCompanyName()) ) {
      contactErrors.get("MISS_BUSINESS").add(error);
      return false;
    }

    if ( quickContact.getPrimaryEmailAddr() == null ) {
      error.setBusinessName(quickContact.getCompanyName());
      contactErrors.get("MISS_EMAIL").add(error);
      return false;
    }

    return true;
  }

  public ContactMismatchPair importContact(foam.core.X x, NameBase importContact, HashMap<String, List<ContactResponseItem>> contactErrors) {
    User              user         = ((Subject) x.get("subject")).getUser();
    DAO            userDAO        = ((DAO) x.get("localUserUserDAO")).inX(x);
    DAO            businessDAO    = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO            agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    EmailAddress email = importContact.getPrimaryEmailAddr();

    Contact existContact = (Contact) contactDAO.inX(x).find(AND(
      EQ(Contact.EMAIL, email.getAddress().toLowerCase()),
      EQ(Contact.OWNER, user.getId())
    ));

    if ( existContact instanceof QuickbooksContact &&
       ((QuickbooksContact) existContact).getLastUpdated() >= importContact.getMetaData().getLastUpdatedTime().getTime() ) {
        throw new RuntimeException("skip");
    }

    // existing user
    User existUser = (User) userDAO.find(
      EQ(User.EMAIL, email.getAddress().toLowerCase())
    );

    // If the contact is a existing contact
    if ( existContact != null ) {
      existContact = (Contact) existContact.fclone();

      // existing user
      if ( existUser != null ) {
        existContact.setFirstName(existUser.getFirstName());
        existContact.setLastName(existUser.getLastName());
        return new ContactMismatchPair.Builder(x)
          .setExistContact(existContact)
          .setResultCode(ContactMismatchCode.EXISTING_USER_CONTACT)
          .build();
      }

      if ( existContact instanceof  QuickbooksContact &&
           (( QuickbooksContact ) existContact).getQuickId().equals(importContact.getId()) ) {
        contactDAO.inX(x).put(
          updateQuickbooksContact(x, importContact, (QuickbooksContact) existContact.fclone(), false, contactErrors)
        );
      } else {
        return new ContactMismatchPair.Builder(x)
          .setResultCode(ContactMismatchCode.EXISTING_CONTACT)
          .setExistContact(existContact)
          .setNewContact(createQuickbooksContactFrom(x, importContact, false, contactErrors))
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
          QuickbooksContact temp = createQuickbooksContactFrom(x, importContact, true, contactErrors);
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          temp.setFirstName(existUser.getFirstName());
          temp.setLastName(existUser.getLastName());
          temp.setOrganization(business.getOrganization());
          temp.setBusinessId(business.getId());
          temp.setEmail(business.getEmail());
          return new ContactMismatchPair.Builder(x)
            .setExistContact(temp)
            .setResultCode(ContactMismatchCode.EXISTING_USER)
            .build();
        }

        if ( sink.getArray().size() > 1) {
          QuickbooksContact temp = createQuickbooksContactFrom(x, importContact, true, contactErrors);
          temp.setChooseBusiness(true);
          temp.setEmail(email.getAddress().toLowerCase());
          temp.setFirstName(existUser.getFirstName());
          temp.setLastName(existUser.getLastName());
          temp.setOrganization("MULTI_BUSINESS");
          return new ContactMismatchPair.Builder(x)
            .setExistContact(temp)
            .setResultCode(ContactMismatchCode.EXISTING_USER_MULTI)
            .build();
        }
      }

      if ( existUser == null ) {
        contactDAO.inX(x).put(createQuickbooksContactFrom(x, importContact, false, contactErrors));
        cacheDAO.inX(x).put(
          new AccountingContactEmailCache.Builder(x)
            .setQuickId(importContact.getId())
            .setRealmId(token.getRealmId())
            .setEmail(email.getAddress().toLowerCase())
            .build()
        );
      }
    }

    return null;
  }

  public QuickbooksContact createQuickbooksContactFrom(foam.core.X x, NameBase importContact, boolean existUser,  HashMap<String, List<ContactResponseItem>> contactErrors) {
    return updateQuickbooksContact(x, importContact, new QuickbooksContact(), existUser, contactErrors);
  }

  public QuickbooksContact updateQuickbooksContact(X x, NameBase importContact, QuickbooksContact existContact, boolean existUser,  HashMap<String, List<ContactResponseItem>> contactErrors) {
    User            user           = ((Subject) x.get("subject")).getUser();
    CountryService  countryService = (CountryService) x.get("countryService");
    RegionService   regionService  = (RegionService) x.get("regionService");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    EmailAddress email = importContact.getPrimaryEmailAddr();

    QuickbooksContact newContact = existContact;

    if ( ! existUser ) {
      /*
       * Address accounting
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

        portalAddress.setSuite(customerAddress.getLine1());
        portalAddress.setCity(customerAddress.getCity());
        portalAddress.setPostalCode(customerAddress.getPostalCode() != null ? customerAddress.getPostalCode() : "");
        portalAddress.setRegionId(region != null ? region.getCode() : null);
        portalAddress.setCountryId(country != null ? country.getCode() : null);

        newContact.setBusinessAddress(portalAddress);
      } else {
          ContactResponseItem error = new ContactResponseItem();
          error.setName(importContact.getDisplayName());
          error.setBusinessName(importContact.getCompanyName());
          contactErrors.get("MISS_ADDRESS").add(error);
      }

      /*
       * Phone accounting
       */
      String businessPhone =
        importContact.getPrimaryPhone() != null ?
        importContact.getPrimaryPhone().getFreeFormNumber() : "";
      Boolean businessPhoneNumberVerified = ! SafetyUtil.isEmpty(businessPhone);

      String mobilePhone =
        importContact.getMobile() != null ?
        importContact.getMobile().getFreeFormNumber() : "";
      Boolean mobilePhoneVerified = ! SafetyUtil.isEmpty(mobilePhone);

      newContact.setOrganization(importContact.getCompanyName());
      if ( importContact.getGivenName() != null ) {
        newContact.setFirstName(importContact.getGivenName());
      }
      if ( importContact.getFamilyName() != null ) {
        newContact.setLastName(importContact.getFamilyName());
      }
      newContact.setPhoneNumber(businessPhone);
      newContact.setPhoneNumberVerified(businessPhoneNumberVerified);
      newContact.setMobileNumber(mobilePhone);
      newContact.setMobileNumberVerified(mobilePhoneVerified);
    }


    newContact.setEmail(email.getAddress().toLowerCase());
    newContact.setType("Contact");
    newContact.setGroup(user.getSpid() + "-sme");
    newContact.setQuickId(importContact.getId());
    newContact.setRealmId(token.getRealmId());
    newContact.setOwner(user.getId());
    newContact.setLastUpdated(importContact.getMetaData().getLastUpdatedTime().getTime());
    newContact.setLastDateUpdated(new Date());

    return newContact;
  }

  public InvoiceResponseItem prepareErrorItemFrom(Transaction qInvoice) {
    Date dueDate = getDueDateFrom(qInvoice);
    BigDecimal amount  = getTotalAmountFrom(qInvoice);

    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");

    InvoiceResponseItem errorItem = new InvoiceResponseItem();
    if ( dueDate != null ) {
      errorItem.setDueDate(format.format(dueDate));
    } else {
      errorItem.setDueDate("");
    }

    if ( qInvoice.getDocNumber() != null ) {
      errorItem.setInvoiceNumber(qInvoice.getDocNumber());
    } else {
      errorItem.setInvoiceNumber("");
    }

    if ( amount != null ) {
      errorItem.setAmount(amount.toString() + " " + qInvoice.getCurrencyRef().getValue());
    } else {
      errorItem.setAmount("");
    }

    return errorItem;
  }

  public ContactResponseItem prepareContactResponseItem(NameBase contact) {
    ContactResponseItem responseItem = new ContactResponseItem();
    responseItem.setName(contact.getDisplayName());
    responseItem.setBusinessName(contact.getCompanyName());
    return responseItem;
  }

  public String importInvoice(X x, Transaction qInvoice, HashMap<String, List<InvoiceResponseItem>> invoiceErrors) {
    // get data from invoice
    Date dueDate = getDueDateFrom(qInvoice);
    BigDecimal balance = getBalanceFrom(qInvoice);
    BigDecimal amount  = getTotalAmountFrom(qInvoice);

    // prepare error item
    InvoiceResponseItem errorItem = prepareErrorItemFrom(qInvoice);

    User user = ((Subject) x.get("subject")).getUser();
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    // check currency support
    if ( ! qInvoice.getCurrencyRef().getValue().equals("USD") &&
         ! qInvoice.getCurrencyRef().getValue().equals("CAD") ) {
      invoiceErrors.get("CURRENCY_NOT_SUPPORT").add(errorItem);
      return "Invoice " + qInvoice.getDocNumber() +
        " can not import because we don't support currency " + qInvoice.getCurrencyRef().getValue();
    }

    QuickbooksInvoice existInvoice = (QuickbooksInvoice) invoiceDAO.inX(x).find(
      AND(
        EQ(QuickbooksInvoice.QUICK_ID,   qInvoice.getId()),
        EQ(QuickbooksInvoice.REALM_ID,   token.getRealmId()),
        EQ(QuickbooksInvoice.CREATED_BY, user.getId())
      ));

    if ( existInvoice != null ) {

      if ( existInvoice.getLastUpdated() >= qInvoice.getMetaData().getLastUpdatedTime().getTime() ) {
        return "skip";
      }
      existInvoice = (QuickbooksInvoice) existInvoice.fclone();

      // if desync, continue
      if ( existInvoice.getDesync() ) {
        return "skip";
      }

      if ( qInvoice instanceof Invoice && net.nanopay.invoice.model.InvoiceStatus.DRAFT != existInvoice.getStatus() ) {
        return "skip";
      }

      if (! (
          net.nanopay.invoice.model.InvoiceStatus.UNPAID  ==   existInvoice.getStatus() ||
          net.nanopay.invoice.model.InvoiceStatus.DRAFT   == existInvoice.getStatus() ||
          net.nanopay.invoice.model.InvoiceStatus.OVERDUE == existInvoice.getStatus() ))
      {
        return "skip";
      }

      if ( balance.doubleValue() == 0.0 && existInvoice.getAmount() != 0 ) {
        existInvoice.setPaymentMethod(PaymentStatus.VOID);
        existInvoice.setStatus(InvoiceStatus.VOID);
        existInvoice.setDraft(true);
        invoiceDAO.inX(x).put(existInvoice);
        invoiceDAO.inX(x).remove(existInvoice);
        return "skip";
      }
    }

    if ( existInvoice == null ) {

      if ( balance.doubleValue() == 0.0 ) {
        return "skip";
      }

      existInvoice = new QuickbooksInvoice();
    }

    // 1. Check the customer or vendor email
    String id = qInvoice instanceof Bill ?
      ( (Bill) qInvoice )   .getVendorRef().getValue() :
      ( (Invoice) qInvoice ).getCustomerRef().getValue();

    if ( id == null || SafetyUtil.isEmpty(id) ) {
      invoiceErrors.get("MISS_CONTACT").add(errorItem);
      return "Invoice " + qInvoice.getDocNumber() + " can not import because contact do not exist.";
    }

    AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.inX(x).find(AND(
      EQ(AccountingContactEmailCache.QUICK_ID, id),
      EQ(AccountingContactEmailCache.REALM_ID, token.getRealmId())
    ));

    if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
      invoiceErrors.get("MISS_CONTACT").add(errorItem);
      return "Invoice " + qInvoice.getDocNumber() + " can not import because contact do not exist.";
    }

    // 2. If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    Contact contact = (Contact) contactDAO.inX(x).find(
      AND(
        EQ(QuickbooksContact.EMAIL, cache.getEmail()),
        EQ(QuickbooksContact.OWNER, user.getId())
      ));
    if ( contact == null ||  ! ( contact instanceof  QuickbooksContact)) {
      invoiceErrors.get("MISS_CONTACT").add(errorItem);
      return "Invoice " + qInvoice.getDocNumber() + " can not import because contact do not exist.";
    }

    Currency currency = (Currency) currencyDAO.inX(x).find(qInvoice.getCurrencyRef().getValue());
    double doubleAmount = balance.doubleValue() * Math.pow(10.0, currency.getPrecision());

    if ( qInvoice instanceof Bill ) {
      existInvoice.setPayerId(user.getId());
      existInvoice.setPayeeId(contact.getId());
      existInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
      existInvoice.setDueDate(( (Bill) qInvoice ).getDueDate());
      //existInvoice.setInvoiceFile(getAttachments(x, "bill", qInvoice.getId()));
    }

    if ( qInvoice instanceof Invoice) {
      existInvoice.setPayerId(contact.getId());
      existInvoice.setPayeeId(user.getId());
      existInvoice.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
      existInvoice.setDraft(true);
      existInvoice.setDueDate(( (Invoice) qInvoice ).getDueDate());
     // existInvoice.setInvoiceFile(getAttachments(x, "invoice", qInvoice.getId()));
    }

    existInvoice.setAmount(Math.round(doubleAmount));
    existInvoice.setDesync(false);
    existInvoice.setInvoiceNumber(qInvoice.getDocNumber());
    existInvoice.setDestinationCurrency(qInvoice.getCurrencyRef().getValue());
    existInvoice.setIssueDate(qInvoice.getTxnDate());
    existInvoice.setQuickId(qInvoice.getId());
    existInvoice.setRealmId(token.getRealmId());
    existInvoice.setBusinessName(token.getBusinessName());
    existInvoice.setCreatedBy(user.getId());
    existInvoice.setContactId(contact.getId());
    existInvoice.setLastUpdated(qInvoice.getMetaData().getLastUpdatedTime().getTime());
    existInvoice.setLastDateUpdated(new Date());

    invoiceDAO.inX(x).put(existInvoice);

    return null;
  }

  public Date getDueDateFrom(Transaction qbsInvoice) {
    return qbsInvoice instanceof Bill ?
      ( (Bill) qbsInvoice ) .getDueDate() : ( (Invoice) qbsInvoice ) .getDueDate();
  }

  public BigDecimal getBalanceFrom(Transaction qbsInvoice) {
    return qbsInvoice instanceof Bill ?
      ( (Bill) qbsInvoice ) .getBalance() : ( (Invoice) qbsInvoice ) .getBalance();
  }

  public BigDecimal getTotalAmountFrom(Transaction qbsInvoice) {
    return qbsInvoice instanceof Bill ?
      ( (Bill) qbsInvoice ) .getTotalAmt() : ( (Invoice) qbsInvoice ) .getTotalAmt();
  }

  public File[] getAttachments(X x, String type, String id) {
    User user = ((Subject) x.get("subject")).getUser();
    BlobService blobStore    = (BlobService) x.get("blobStore");
    DAO               fileDAO      = ((DAO) x.get("fileDAO")).inX(x);

    String query = "select * from attachable where AttachableRef.EntityRef.Type = '" + type +
                   "' and AttachableRef.EntityRef.value = '" + id + "'";

    List<Attachable> list = sendRequest(x, query, "attachable");

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
        Logger logger = (Logger) x.get("logger");
        logger.log("Unexpected error fetching atachments",e);
        throw new AccountingException(e.getMessage(), AccountingErrorCodes.INTERNAL_ERROR);
      }
    }).filter(Objects::nonNull)
      .collect(Collectors.toList());

    return files.toArray(new File[files.size()]);
  }

  public Transaction createPaymentFor(X x, QuickbooksInvoice quickInvoice) {
    User user        = ((Subject) x.get("subject")).getUser();

    String type = "";
    Currency currency = null;
    BankAccount account = null;

    if ( quickInvoice.getPayeeId() == user.getId() ) {
      type = "Invoice";
      currency = (Currency) currencyDAO.inX(x).find(quickInvoice.getSourceCurrency());
      account = BankAccount.findDefault(x, user, quickInvoice.getSourceCurrency());
    } else {
      type = "Bill";
      currency = (Currency) currencyDAO.inX(x).find(quickInvoice.getDestinationCurrency());
      account = BankAccount.findDefault(x, user, quickInvoice.getDestinationCurrency());
    }

    if ( SafetyUtil.isEmpty(account.getIntegrationId()) ) {
      throw new AccountingException("No bank accounts synchronised to Quick", AccountingErrorCodes.MISSING_BANK);
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
    QuickbooksContact contact = (QuickbooksContact) contactDAO.inX(x).find(quickInvoice.getContactId());
    ReferenceType contactRef = new ReferenceType();
    contactRef.setName(contact.getOrganization());
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

    result.addAll(sendRequest(x, queryCustomer, "customer"));
    result.addAll(sendRequest(x, queryVendor, "vendor"));

    return result;
  }

  public NameBase fetchContactById(foam.core.X x, String type, String id) {
    String query = "select * from "+ type +" where id = '"+ id +"'";
    return (NameBase) sendRequest(x, query, type).get(0);
  }

  public Transaction fetchInvoiceById(X x, String type, String id) {
    String query = "select * from "+ type +" where id = '"+ id +"'";
    return (Transaction) sendRequest(x, query, type).get(0);
  }

  public List fetchInvoices(X x) throws Exception {

    List result = new ArrayList();

    String queryBill    = "select * from bill";
    String queryInvoice = "select * from invoice";

    result.addAll(sendRequest(x, queryBill, "bill"));
    result.addAll(sendRequest(x, queryInvoice, "invoice"));

    return result;
  }

  public CompanyInfo fetchCompanyInfo(X x) {

    List result = new ArrayList();

    String query = "select * from CompanyInfo";

    result.addAll(sendRequest(x, query,"CompanyInfo"));

    return (CompanyInfo) result.get(0);
  }


  public List sendRequest(foam.core.X x, String query, String table) {
    User user       = ((Subject) x.get("subject")).getUser();
    DAO store       = ((DAO) x.get("quickbooksTokenDAO")).inX(x);
    Logger logger = (Logger) x.get("logger");
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                 configDAO = ((DAO) x.get("quickbooksConfigDAO")).inX(x);
    QuickbooksConfig    config    = (QuickbooksConfig)configDAO.find(app.getUrl());
    QuickbooksToken  token = (QuickbooksToken) store.inX(x).find(user.getId());

    if ( token == null || token.getRealmId() == null || token.getBusinessName() == null ) {
      throw new AccountingException(AccountingErrorCodes.TOKEN_EXPIRED.getLabel(), AccountingErrorCodes.TOKEN_EXPIRED);
    }

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(token.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, token.getRealmId());
      DataService service =  new DataService(context);
      logger.debug("QBO request: " + query);
      List response = new ArrayList() ;
      if ( query.startsWith("select") ) {
        QueryResult queryResult = service.executeQuery("select count(*) from " + table);
        int count =  queryResult.getTotalCount() == null ? 1 : queryResult.getTotalCount();
        int i = 1;
        while (i < count + 1) {
          response.addAll(service.executeQuery(query+ " STARTPOSITION " + String.valueOf(i) + " MAXRESULTS 100" ).getEntities());
          i += 100;
        }
      } else {
        this.omLogger.log("Quickbooks pre request");
        response = service.executeQuery(query).getEntities();
        this.omLogger.log("Quickbooks post request");
      }
      Gson gson = new Gson();
      String json = gson.toJson(response);
      logger.debug("QBO response: " + json);
      return response;
    } catch ( Exception e ) {
      throw new AccountingException("Error fetch QuickBook data.", e);
    }
  }

  public IEntity create(foam.core.X x, IEntity object) {
    User user       = ((Subject) x.get("subject")).getUser();
    DAO store       = ((DAO) x.get("quickbooksTokenDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                         configDAO = ((DAO) x.get("quickbooksConfigDAO")).inX(x);
    QuickbooksConfig                 config    = (QuickbooksConfig)configDAO.find(app.getUrl());
    QuickbooksToken  token = (QuickbooksToken) store.find(user.getId());


    if ( token == null ) {
      throw new AccountingException(AccountingErrorCodes.TOKEN_EXPIRED.getLabel(), AccountingErrorCodes.TOKEN_EXPIRED);
    }

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(token.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, token.getRealmId());
      DataService service =  new DataService(context);

      this.omLogger.log("Quickbooks pre request");
      IEntity response = service.add(object);
      this.omLogger.log("Quickbooks post request");
      return response;
    } catch ( Exception e ) {
      throw new AccountingException("Error fetch QuickBook data.", e);
    }
  }

  public void batchOperation(X x, BatchOperation operation, CallbackHandler callbackHandler) {
    User user       = ((Subject) x.get("subject")).getUser();
    DAO store       = ((DAO) x.get("quickbooksTokenDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                         configDAO = ((DAO) x.get("quickbooksConfigDAO")).inX(x);
    QuickbooksConfig                 config    = (QuickbooksConfig)configDAO.find(app.getUrl());
    QuickbooksToken  token = (QuickbooksToken) store.find(user.getId());

    if ( token == null ) {
      throw new AccountingException(AccountingErrorCodes.TOKEN_EXPIRED.getLabel(), AccountingErrorCodes.TOKEN_EXPIRED);
    }

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(token.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, token.getRealmId());
      DataService service =  new DataService(context);

      this.omLogger.log("Quickbooks pre request");
      service.executeBatch(operation);
      this.omLogger.log("Quickbooks post request");
    } catch ( Exception e ) {
      throw new AccountingException("Error fetch QuickBook data.", e);
    }
  }

  public HashMap<String, List<ContactResponseItem>> initContactErrors() {
    HashMap<String, List<ContactResponseItem>> contactErrors = new HashMap<>();

    contactErrors.put("MISS_BUSINESS_EMAIL", new ArrayList<>());
    contactErrors.put("MISS_BUSINESS", new ArrayList<>());
    contactErrors.put("MISS_EMAIL", new ArrayList<>());
    contactErrors.put("MISS_ADDRESS", new ArrayList<>());
    contactErrors.put("OTHER", new ArrayList<>());

    return contactErrors;
  }

  public HashMap<String, List<InvoiceResponseItem>> initInvoiceErrors() {
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = new HashMap<>();

    invoiceErrors.put("MISS_CONTACT", new ArrayList<>());
    invoiceErrors.put("CURRENCY_NOT_SUPPORT", new ArrayList<>());
    invoiceErrors.put("OTHER", new ArrayList<>());

    return invoiceErrors;
  }

  public ResultResponse saveResult(X x, String method, ResultResponse resultResponse) {
    User user = ((Subject) x.get("subject")).getUser();

    ResultResponseWrapper resultWrapper = new ResultResponseWrapper();
    resultWrapper.setMethod(method);
    resultWrapper.setUserId(user.getId());
    resultWrapper.setResultResponse(resultResponse);
    resultWrapper.setTimeStamp(new Date().getTime());
    resultDAO.inX(x).put(resultWrapper);
    return resultResponse;
  }
}
