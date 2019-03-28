package net.nanopay.accounting.quickbooks;

import com.intuit.ipp.core.Context;
import com.intuit.ipp.core.IEntity;
import com.intuit.ipp.core.ServiceType;
import com.intuit.ipp.data.*;
import com.intuit.ipp.exception.AuthenticationException;
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
import foam.nanos.NanoService;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.*;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.accounting.*;
import net.nanopay.accounting.quickbooks.model.QuickbooksContact;
import net.nanopay.accounting.quickbooks.model.QuickbooksInvoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.Business;
import net.nanopay.model.Currency;

import java.math.BigDecimal;
import java.net.URL;
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
  }

  @Override
  public ResultResponse isSignedIn(X x) {
    User user = (User) x.get("user");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    if ( token == null  || ! (user.getIntegrationCode() == IntegrationCode.QUICKBOOKS)) {
      return new ResultResponse.Builder(x).setResult(false).setErrorCode(AccountingErrorCodes.NOT_SIGNED_IN).build();
    }

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse contactSync(X x) {
    List<ContactMismatchPair> result = new ArrayList<>();
    List<String> invalidContacts = new ArrayList<>();
    List<String> success = new ArrayList<>();

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
          } else {
            success.add("QuickBooks contact " + contact.getDisplayName() + " import successfully");
          }

        } catch ( Exception e ) {
          logger.error(e);
          invalidContacts.add("Can not import quickbooks contact # " + contact.getId() + ", " + e.getMessage());
        }

      }

    } catch ( Exception e ) {
      return saveResult(x, "contactSync" ,errorHandler(e));
    }

    return saveResult(x, "contactSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setContactSyncMismatches(result.toArray(new ContactMismatchPair[result.size()]))
      .setContactSyncErrors(invalidContacts.toArray(new String[invalidContacts.size()]))
      .setSuccessContact(success.toArray(new String[success.size()]))
      .build());
  }

  @Override
  public ResultResponse invoiceSync(X x) {
    User user = (User) x.get("user");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    List<String> errorResult = new ArrayList<>();
    List<String> successResult = new ArrayList<>();

    try {

      List<Transaction> list = fetchInvoices(x);
      CompanyInfo companyInfo = fetchCompanyInfo(x);

      token.setBusinessName(companyInfo.getCompanyName());
      tokenDAO.put(token.fclone());
      for ( Transaction invoice : list ) {

        try {
          String importResult = importInvoice(x, invoice);
          if ( importResult != null ) {
            errorResult.add(importResult);
          } else {
            successResult.add("QuickBooks invoice " + invoice.getDocNumber() + " import successfully.");
          }

        } catch ( Exception e ) {
          logger.error(e);
          errorResult.add(e.getMessage());
        }
      }

      reSyncInvoices(x);

    } catch (Exception e) {
      return saveResult(x, "invoiceSync" ,errorHandler(e));
    }

    return saveResult(x, "invoiceSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setInvoiceSyncErrors(errorResult.toArray(new String[errorResult.size()]))
      .setSuccessInvoice(successResult.toArray(new String[successResult.size()]))
      .build());
  }

  @Override
  public ResultResponse singleInvoiceSync(X x, net.nanopay.invoice.model.Invoice nanoInvoice){
    User user = (User) x.get("user");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    List<String> errorResult = new ArrayList<>();
    List<String> successResult = new ArrayList<>();


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

      String importResult = importInvoice(x, invoice);
      if ( importResult != null ) {
        errorResult.add(importResult);
      } else {
        successResult.add("QuickBooks invoice " + invoice.getDocNumber() + " import successfully.");
      }

    } catch ( Exception e ) {
      saveResult(x, "singleInvoiceSync", errorHandler(e));
    }

    return saveResult(x, "singleInvoiceSync", new ResultResponse.Builder(x)
      .setResult(true)
      .setInvoiceSyncErrors(errorResult.toArray(new String[errorResult.size()]))
      .setSuccessInvoice(successResult.toArray(new String[successResult.size()]))
      .build());
  }

  @Override
  public ResultResponse removeToken(X x) {
    User              user         = (User) x.get("user");
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
      account.setIntegrationId("");
      accountDAO.put(account.fclone());
    }

    return new ResultResponse.Builder(x).setResult(false).setReason("User has been signed out of Quick Books").build();
  }

  @Override
  public ResultResponse bankAccountSync(X x) {
    List<AccountingBankAccount> results = new ArrayList<>();
    User            user           = (User) x.get("user");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());
    DAO accountingBankDAO = (DAO) x.get("accountingBankAccountCacheDAO");

    ResultResponse resultResponse = null;
    ResultResponseWrapper resultWrapper = new ResultResponseWrapper();
    resultWrapper.setMethod("bankAccountSync");
    resultWrapper.setUserId(user.getId());

    try {
      String query = "select * from account where AccountType = 'Bank'";
      List<Account> accounts = sendRequest(x, query);

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
      resultWrapper.setResultResponse(resultResponse);
      resultDAO.inX(x).put(resultWrapper);
      return resultResponse;

    } catch ( Exception e ) {
      logger.error(e);
      ResultResponse response = errorHandler(e);
      ArraySink sink = new ArraySink();
      accountingBankDAO.where(
        EQ(AccountingBankAccount.REALM_ID, token.getRealmId())
      ).select(sink);
      results = sink.getArray();
      response.setBankAccountList(results.toArray(new AccountingBankAccount[results.size()]));
      resultWrapper.setResultResponse(resultResponse);
      resultDAO.inX(x).put(resultWrapper);
      return response;
    }
  }

  @Override
  public ResultResponse invoiceResync(X x, net.nanopay.invoice.model.Invoice invoice) {
    QuickbooksInvoice quickInvoice = (QuickbooksInvoice) invoice.fclone();
    User user = (User) x.get("user");

    ResultResponse resultResponse = null;
    ResultResponseWrapper resultWrapper = new ResultResponseWrapper();
    resultWrapper.setMethod("invoiceResync");
    resultWrapper.setUserId(user.getId());

    try {

      // if it's receivable, skip it for now
      if ( invoice.getPayeeId() == user.getId() && invoice.getStatus() == InvoiceStatus.PENDING ) {
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
      resultWrapper.setResultResponse(resultResponse);
      resultDAO.inX(x).put(resultWrapper);
      return resultResponse;
    } catch ( Exception e ) {
      logger.error(e);
      quickInvoice.setDesync(true);
      invoiceDAO.inX(x).put(quickInvoice);
      resultResponse = errorHandler(e);
      resultWrapper.setResultResponse(resultResponse);
      resultDAO.inX(x).put(resultWrapper);
      return resultResponse;
    }
  }

  public void reSyncInvoices(X x) {
    User            user           = (User) x.get("user");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    // 1. find all the deSync invoices
    ArraySink select = (ArraySink) invoiceDAO.inX(x).where(AND(
      EQ(QuickbooksInvoice.REALM_ID, token.getRealmId()),
      EQ(QuickbooksInvoice.DESYNC, true)
    )).select(new ArraySink());
    ArrayList<QuickbooksInvoice> quickInvoices = (ArrayList<QuickbooksInvoice>) select.getArray();

    // 2. prepare the batch request
    BatchOperation batchOperation = new BatchOperation();

    for ( QuickbooksInvoice quickInvoice : quickInvoices ) {
      batchOperation.addEntity(createPaymentFor(x, quickInvoice), OperationEnum.CREATE, quickInvoice.getQuickId());
    }

    batchOperation(x, batchOperation, null);

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
        e.printStackTrace();
        return resultResponse;
      }

      if ( accountingException.getCause() != null ) {
        Throwable temp = accountingException.getCause();
        if ( temp instanceof AuthenticationException ) {
          resultResponse.setErrorCode(AccountingErrorCodes.TOKEN_EXPIRED);
          resultResponse.setReason(AccountingErrorCodes.TOKEN_EXPIRED.getLabel());
        } else {
          resultResponse.setErrorCode(AccountingErrorCodes.ACCOUNTING_ERROR);
          resultResponse.setReason(AccountingErrorCodes.ACCOUNTING_ERROR.getLabel());
        }

        temp.printStackTrace();
        return resultResponse;
      }
    }

    resultResponse.setErrorCode(AccountingErrorCodes.INTERNAL_ERROR);
    resultResponse.setReason(e.getMessage());
    return resultResponse;
  }

  public boolean isValidContact(NameBase quickContact, List<String> invalidContacts) {
    if (
      quickContact.getPrimaryEmailAddr() == null ||
      SafetyUtil.isEmpty(quickContact.getCompanyName()) )
    {
      String str = "Quick Contact # " +
        quickContact.getId() +
        " can not be added because the contact is missing: " +
        (quickContact.getPrimaryEmailAddr() == null ? "[Email]" : "") +
        (SafetyUtil.isEmpty(quickContact.getCompanyName()) ? " [Company Name] " : "");
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
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    EmailAddress email = importContact.getPrimaryEmailAddr();

    cacheDAO.inX(x).put(
      new AccountingContactEmailCache.Builder(x)
        .setQuickId(importContact.getId())
        .setRealmId(token.getRealmId())
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
        return new ContactMismatchPair.Builder(x)
          .setExistContact(existContact)
          .setResultCode(ContactMismatchCode.EXISTING_USER_CONTACT)
          .build();
      }

      if ( existContact instanceof  QuickbooksContact &&
           (( QuickbooksContact ) existContact).getQuickId().equals(importContact.getId()) ) {
        contactDAO.inX(x).put(
          updateQuickbooksContact(x, importContact, (QuickbooksContact) existContact.fclone(), false)
        );
      } else {
        return new ContactMismatchPair.Builder(x)
          .setResultCode(ContactMismatchCode.EXISTING_CONTACT)
          .setExistContact(existContact)
          .setNewContact(createQuickbooksContactFrom(x, importContact, false))
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
          QuickbooksContact temp = createQuickbooksContactFrom(x, importContact, true);
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          temp.setOrganization(business.getOrganization());
          temp.setBusinessName(business.getBusinessName());
          temp.setBusinessId(business.getId());
          temp.setEmail(business.getEmail());
          return new ContactMismatchPair.Builder(x)
            .setExistContact(temp)
            .setResultCode(ContactMismatchCode.EXISTING_USER)
            .build();
        }

        if ( sink.getArray().size() > 1) {
          QuickbooksContact temp = createQuickbooksContactFrom(x, importContact, true);
          temp.setChooseBusiness(true);
          temp.setEmail(email.getAddress());
          temp.setFirstName(existUser.getFirstName());
          temp.setLastName(existUser.getLastName());
          temp.setOrganization("TBD");
          temp.setBusinessName("TBD");
          return new ContactMismatchPair.Builder(x)
            .setExistContact(temp)
            .setResultCode(ContactMismatchCode.EXISTING_USER_MULTI)
            .build();
        }
      }

      if ( existUser == null ) {
        contactDAO.inX(x).put(createQuickbooksContactFrom(x, importContact, false));
      }
    }

    return null;
  }

  public QuickbooksContact createQuickbooksContactFrom(foam.core.X x, NameBase importContact, boolean existUser) {
    return updateQuickbooksContact(x, importContact, new QuickbooksContact(), existUser);
  }

  public QuickbooksContact updateQuickbooksContact(X x, NameBase importContact, QuickbooksContact existContact, boolean existUser) {
    User            user           = (User) x.get("user");
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
        portalAddress.setPostalCode(customerAddress.getPostalCode());
        portalAddress.setRegionId(country != null ? country.getCode() : null);
        portalAddress.setCountryId(region != null ? region.getCode() : null);

        newContact.setBusinessAddress(portalAddress);
      }

      /*
       * Phone accounting
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
      if ( importContact.getGivenName() != null ) {
        newContact.setFirstName(importContact.getGivenName());
      }
      if ( importContact.getGivenName() != null ) {
        newContact.setLastName(importContact.getFamilyName());
      }
      newContact.setBusinessPhone(businessPhone);
      newContact.setMobile(mobilePhone);
    }


    newContact.setEmail(email.getAddress());
    newContact.setType("Contact");
    newContact.setGroup("sme");
    newContact.setQuickId(importContact.getId());
    newContact.setRealmId(token.getRealmId());
    newContact.setOwner(user.getId());

    return newContact;
  }

  public String importInvoice(X x, Transaction qInvoice) {

    if ( ! qInvoice.getCurrencyRef().getValue().equals("USD") &&
         ! qInvoice.getCurrencyRef().getValue().equals("CAD") ) {
      return "Invoice " + qInvoice.getDocNumber() +
        " can not import because we don't support currency " + qInvoice.getCurrencyRef().getValue();
    }

    User user = (User) x.get("user");
    QuickbooksToken token = (QuickbooksToken) tokenDAO.inX(x).find(user.getId());

    QuickbooksInvoice existInvoice = (QuickbooksInvoice) invoiceDAO.inX(x).find(
      AND(
        EQ(QuickbooksInvoice.QUICK_ID,   qInvoice.getId()),
        EQ(QuickbooksInvoice.REALM_ID,   token.getRealmId()),
        EQ(QuickbooksInvoice.CREATED_BY, user.getId())
      ));

    BigDecimal balance = qInvoice instanceof Bill ?
      ( (Bill) qInvoice ) .getBalance() : ( (Invoice) qInvoice ) .getBalance();

    if ( existInvoice != null ) {

      existInvoice = (QuickbooksInvoice) existInvoice.fclone();

      // if desync, continue
      if ( existInvoice.getDesync() ) {
        return null;
      }

      if ( qInvoice instanceof Invoice && net.nanopay.invoice.model.InvoiceStatus.DRAFT != existInvoice.getStatus() ) {
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

      existInvoice = new QuickbooksInvoice();
    }

    // 1. Check the customer or vendor email
    String id = qInvoice instanceof Bill ?
      ( (Bill) qInvoice )   .getVendorRef().getValue() :
      ( (Invoice) qInvoice ).getCustomerRef().getValue();

    AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.inX(x).find(AND(
      EQ(AccountingContactEmailCache.QUICK_ID, id),
      EQ(AccountingContactEmailCache.REALM_ID, token.getRealmId())
    ));

    if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
      return "Invoice " + qInvoice.getDocNumber() + " can not import because contact do not exist.";
    }

    // 2. If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    Contact contact = (Contact) contactDAO.inX(x).find(
      AND(
        EQ(QuickbooksContact.EMAIL, cache.getEmail()),
        EQ(QuickbooksContact.OWNER, user.getId())
      ));
    if ( contact == null ) {
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
        throw new AccountingException(e.getMessage(), AccountingErrorCodes.INTERNAL_ERROR);
      }
    }).filter(Objects::nonNull)
      .collect(Collectors.toList());

    return files.toArray(new File[files.size()]);
  }

  public Transaction createPaymentFor(X x, QuickbooksInvoice quickInvoice) {
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

  public Transaction fetchInvoiceById(X x, String type, String id) {
    String query = "select * from "+ type +" where id = '"+ id +"'";
    return (Transaction) sendRequest(x, query).get(0);
  }

  public List fetchInvoices(X x) throws Exception {

    List result = new ArrayList();

    String queryBill    = "select * from bill";
    String queryInvoice = "select * from invoice";

    result.addAll(sendRequest(x, queryBill));
    result.addAll(sendRequest(x, queryInvoice));

    return result;
  }

  public CompanyInfo fetchCompanyInfo(X x) {

    List result = new ArrayList();

    String query = "select * from CompanyInfo";

    result.addAll(sendRequest(x, query));

    return (CompanyInfo) result.get(0);
  }


  public List sendRequest(foam.core.X x, String query) {
    User user       = (User) x.get("user");
    DAO store       = ((DAO) x.get("quickbooksTokenDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                 configDAO = ((DAO) x.get("quickbooksConfigDAO")).inX(x);
    QuickbooksConfig    config    = (QuickbooksConfig)configDAO.find(app.getUrl());
    QuickbooksToken  token = (QuickbooksToken) store.inX(x).find(user.getId());

    if ( token == null ) {
      throw new AccountingException(AccountingErrorCodes.TOKEN_EXPIRED.getLabel(), AccountingErrorCodes.TOKEN_EXPIRED);
    }

    try {
      Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

      OAuth2Authorizer oauth = new OAuth2Authorizer(token.getAccessToken());
      Context context = new Context(oauth, ServiceType.QBO, token.getRealmId());
      DataService service =  new DataService(context);

      return service.executeQuery(query).getEntities();
    } catch ( Exception e ) {
      throw new AccountingException("Error fetch QuickBook data.", e);
    }
  }

  public IEntity create(foam.core.X x, IEntity object) {
    User user       = (User) x.get("user");
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

      return service.add(object);
    } catch ( Exception e ) {
      throw new AccountingException("Error fetch QuickBook data.", e);
    }
  }

  public void batchOperation(X x, BatchOperation operation, CallbackHandler callbackHandler) {
    User user       = (User) x.get("user");
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

      service.executeBatch(operation);
    } catch ( Exception e ) {
      throw new AccountingException("Error fetch QuickBook data.", e);
    }
  }

  public ResultResponse saveResult(X x, String method, ResultResponse resultResponse) {
    User user = (User) x.get("user");

    ResultResponseWrapper resultWrapper = new ResultResponseWrapper();
    resultWrapper.setMethod(method);
    resultWrapper.setUserId(user.getId());
    resultWrapper.setResultResponse(resultResponse);

    return resultResponse;
  }
}
