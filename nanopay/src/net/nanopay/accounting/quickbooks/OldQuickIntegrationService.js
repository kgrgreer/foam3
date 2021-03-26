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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.accounting.quickbooks',
  name: 'QuickIntegrationService',
  documentation: 'Quick Integration functions to synchronizing with quickbooks and verifying if signed in',
  implements: [
    'net.nanopay.accounting.IntegrationService'
  ],

  javaImports: [
    'com.intuit.ipp.core.Context',
    'com.intuit.ipp.core.ServiceType',
    'com.intuit.ipp.data.*',
    'com.intuit.ipp.exception.FMSException',
    'com.intuit.ipp.security.OAuth2Authorizer',
    'com.intuit.ipp.services.DataService',
    'com.intuit.ipp.util.Config',
    'foam.blob.BlobService',
    'foam.core.Currency',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.lib.NetworkPropertyPredicate',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.mlang.sink.Count',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',

    'java.io.BufferedReader',
    'java.io.InputStreamReader',
    'java.math.BigDecimal',
    'java.net.URL',
    'java.net.URLEncoder',
    'java.text.SimpleDateFormat',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'java.util.regex.Matcher',
    'java.util.regex.Pattern',

    'net.nanopay.accounting.AccountingBankAccount',
    'net.nanopay.accounting.AccountingContactEmailCache',
    'net.nanopay.accounting.ResultResponse',
    'net.nanopay.accounting.quickbooks.model.*',
    'net.nanopay.accounting.quickbooks.model.QuickQueryCustomerResponse',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.model.Business',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.HttpClient',
    'org.apache.http.client.methods.HttpGet',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.HttpClients',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'isSignedIn',
      documentation: `Used to check if the access-token's are expired for the specific users`,
      javaCode:
`Logger            logger       = (Logger) x.get("logger");
DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
User              user         = ((Subject) x.get("subject")).getUser();
Group             group        = user.findGroup(x);
AppConfig         app          = group.getAppConfig(x);
DAO               configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig       config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

// Check that user has accessed Quickbooks before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to QuickBooks");
}

// Attempt to make a get call to check if signed in
try {
  ResultResponse query = getRequest(x, tokenStorage, config, "customer");
  if ( ! query.getResult() ) {
    throw new Throwable (query.getReason());
  }
  return new ResultResponse(true, "User is Signed in");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "User is not Signed in");
}`
    },
    {
      name: 'syncSys',
      documentation: `Calls the functions that retrieve contacts and invoices. If fails returns error messages for each`,
      javaCode:
`Logger logger = (Logger) x.get("logger");
try {
  ResultResponse contacts = contactSync(x);
  ResultResponse invoices = invoiceSync(x);

  if ( contacts.getResult() && invoices.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {

    // Constructs the error message as a result of the error messages of the other issues from each section
    String str = "" ;

    // Error message from contacts
    if ( ! contacts.getResult() ) {
      str+= contacts.getReason();
    }

    //Error message from invoices
    if ( ! invoices.getResult() ) {
      str+= invoices.getReason();
    }

    return new ResultResponse(false, str);
  }
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage() + " ");
}`
    },
    {
      name: 'contactSync',
      documentation: `Calls the functions that retrieve customers and vendors. If fails returns error messages for each`,
      javaCode:
`DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
User              user         = ((Subject) x.get("subject")).getUser();
Group             group        = user.findGroup(x);
AppConfig         app          = group.getAppConfig(x);
DAO               configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig       config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
Logger            logger       = (Logger) x.get("logger");

// Check that user has accessed Quickbooks before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to QuickBooks");
}

try {
  ResultResponse customer = getCustomers(x, getRequest(x, tokenStorage, config, "customer"), user );
  ResultResponse vendor = getVendors(x, getRequest(x, tokenStorage, config, "vendor"), user );
  if ( customer.getResult() && vendor.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {

    // Constructs the error message as a result of the error messages of the other issues from each section
    String str = "" ;

    // Error message from customers
    if ( ! customer.getResult() ) {
      str+= customer.getReason();
    }

    // Error message from vendors
    if ( ! vendor.getResult() ) {
      str+= vendor.getReason();
    }

    return new ResultResponse(false, str);
  }
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage() + " ");
}`
    },
    {
      name: 'invoiceSync',
      documentation: `Calls the functions that retrieve invoices and bills. If fails returns error messages for each`,
      javaCode:
`DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
User              user         = ((Subject) x.get("subject")).getUser();
Group             group        = user.findGroup(x);
AppConfig         app          = group.getAppConfig(x);
DAO               configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig       config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
Logger            logger       = (Logger) x.get("logger");

// Check that user has accessed Quickbooks before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to QuickBooks");
}

try {
  ResultResponse invoice = getInvoices(x, getRequest(x, tokenStorage, config, "invoice"), user);
  ResultResponse bill = getBills(x, getRequest(x, tokenStorage, config, "bill"), user);
  if ( invoice.getResult() && bill.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {

    // Constructs the error message as a result of the error messages of the other issues from each section
    String str = "" ;

    // Error message from invoices
    if ( ! invoice.getResult() ) {
      str+= invoice.getReason();
    }

    // Error message from bills
    if ( ! bill.getResult() ) {
      str+= bill.getReason();
    }

    return new ResultResponse(false, str);
  }
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage() + " ");
}`
    },
    {
      name: 'getCustomers',
      documentation: `Retrieves the query and parses to Query models for Customers`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'query',
          type: 'net.nanopay.accounting.ResultResponse',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger logger = (Logger) x.get("logger");

//If the request failed
if ( ! query.getResult() ) {
  return new ResultResponse(false, "No Customers retrieved");
}

//Parses the query and loads relevant data into model
try {
  JSONParser parser = new JSONParser();
  QuickQueryCustomerResponse quick = new QuickQueryCustomerResponse();
  quick = (QuickQueryCustomerResponse) parser.parseString(query.getReason(), quick.getClassInfo().getObjClass());
  QuickQueryCustomers customersList = quick.getQueryResponse();
  return importContacts(x, customersList.getCustomer(), user);
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage() + " ");
}`,
    },
    {
      name: 'getVendors',
      documentation: `Retrieves the query and parses to Query models for Vendors`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'query',
          type: 'net.nanopay.accounting.ResultResponse',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger logger = (Logger) x.get("logger");

//If the request failed
if ( ! query.getResult() ) {
  return new ResultResponse(false, "No Vendors retrieved");
}

//Parses the query and loads relevant data into model
try {
  JSONParser parser = new JSONParser();
  QuickQueryVendorResponse quick = new QuickQueryVendorResponse();
  quick = (QuickQueryVendorResponse) parser.parseString(query.getReason(), quick.getClassInfo().getObjClass());
  QuickQueryVendors customersList = quick.getQueryResponse();
  return importContacts(x, customersList.getVendor(), user);
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage() + " ");
}`,
    },
    {
      name: 'getBills',
      documentation: `Retrieves the query and parses to Query models for Bills, then pulls relative data and applys to portal model`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'query',
          type: 'net.nanopay.accounting.ResultResponse',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`
Logger logger = (Logger) x.get("logger");
DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
DAO               cacheDAO     = (DAO) x.get("AccountingContactEmailCacheDAO");
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

//If the request failed
if ( ! query.getResult() ) {
  return new ResultResponse(false, "No bills retrieved");
}

try {
  DAO invoiceDAO   = ((DAO) x.get("invoiceDAO")).inX(x);
  DAO contactDAO   = ((DAO) x.get("contactDAO")).inX(x);
  DAO currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);

  //Parses the query and loads relevant data into model
  JSONParser             parser   = new JSONParser();
  QuickQueryBillResponse quick    = (QuickQueryBillResponse) parser.parseString(query.getReason(), QuickQueryBillResponse.getOwnClassInfo().getObjClass());
  QuickQueryBills        billList = quick.getQueryResponse();
  QuickQueryBill[]       bills    = billList.getBill();

  // Converts the Query Bill to an Invoice
  for ( QuickQueryBill qInvoice : bills ) {

    // Searches for a previously existing invoice
    QuickInvoice portal = (QuickInvoice) invoiceDAO.find(
      AND(
        EQ(QuickInvoice.QUICK_ID, qInvoice.getId()),
        EQ(QuickInvoice.REALM_ID, tokenStorage.getRealmId()),
        EQ(QuickInvoice.CREATED_BY, user.getId())
      ));

    if ( portal != null ) {

      // Clone the invoice to make changes
      portal = (QuickInvoice) portal.fclone();

      // Checks to see if the invoice needs to be updated in QuickBooks
      if ( portal.getDesync() ) {
        ResultResponse isSync = resyncInvoice(x, portal);
        if ( isSync.getResult() ) {
          portal.setDesync(false);
          portal.setComplete(true);
          invoiceDAO.put(portal);
        } else {
          logger.error(isSync.getReason());
        }
        continue;
      }

      if (! (
         net.nanopay.invoice.model.InvoiceStatus.UNPAID  == portal.getStatus() ||
         net.nanopay.invoice.model.InvoiceStatus.DRAFT   == portal.getStatus() ||
         net.nanopay.invoice.model.InvoiceStatus.OVERDUE == portal.getStatus() ))
      {
        continue;
      }

      // if paid/void on QuickBook, remove it from Ablii
      if ( qInvoice.getBalance() == 0.0 && portal.getAmount() != 0 ) {
        portal.setPaymentMethod(PaymentStatus.VOID);
        portal.setStatus(InvoiceStatus.VOID);
        portal.setDraft(true);
        invoiceDAO.inX(x).put(portal);
        invoiceDAO.inX(x).remove(portal);
        continue;
      }

    } else {

      // Checks if the invoice was paid
      if ( qInvoice.getBalance() == 0 ) {
        continue;
      }

      // Create an invoice
      portal = new QuickInvoice();
    }

    // Searches for a previous existing Contact
    AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.find(AND(
      EQ(AccountingContactEmailCache.QUICK_ID, qInvoice.getVendorRef().getValue()),
      EQ(AccountingContactEmailCache.REALM_ID, tokenStorage.getRealmId())
    ));

    if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
      continue;
    }

    Contact contact = (Contact) contactDAO.find(
      AND(
        EQ(QuickContact.EMAIL, cache.getEmail()),
        EQ(QuickContact.OWNER, user.getId())
      ));

    // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    if ( contact == null ) {
      // TODO: handle the mismatch
      continue;
    }

    // TODO change to accept all currencies
    // Only allows CAD and USD
    if ( ! ("CAD".equals(qInvoice.getCurrencyRef().getValue()) || "USD".equals(qInvoice.getCurrencyRef().getValue())) ) {
      Notification notify = new Notification();
      String s = "Quick Invoice # " +
        qInvoice.getId() +
        " can not be sync'd because the currency " +
        qInvoice.getCurrencyRef().getValue() +
        " is not supported in this system ";
      notify.setBody(s);
      user.doNotify(x, notify);
      continue;
    }
    portal.setDesync(false);
    portal.setPayerId(user.getId());
    portal.setPayeeId(contact.getId());
    portal.setContactId(contact.getId());
    portal.setQuickId(qInvoice.getId());
    portal.setRealmId(tokenStorage.getRealmId());
    portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);

    Currency currency = (Currency) currencyDAO.find(qInvoice.getCurrencyRef().getValue());
    double doubleAmount = qInvoice.getBalance() * Math.pow(10.0, currency.getPrecision());
    portal.setAmount(Math.round(doubleAmount));

    portal.setInvoiceNumber(qInvoice.getDocNumber());
    portal.setQuickId(qInvoice.getId());
    portal.setRealmId(tokenStorage.getRealmId());
    portal.setDestinationCurrency(qInvoice.getCurrencyRef().getValue());
    portal.setIssueDate(getDate(qInvoice.getTxnDate()));
    portal.setDueDate(getDate(qInvoice.getDueDate()));
    portal.setDesync(false);
    portal.setCreatedBy(user.getId());

    // Get attachments from invoice
    // foam.nanos.fs.File[] files = getAttachments(x, "bill", qInvoice.getId());
    // if ( files != null && files.length != 0 ) {
    //   portal.setInvoiceFile(files);
    // }

    invoiceDAO.put(portal);
  }
  return new ResultResponse(true, "Bills were synchronised");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occurred: "+ e);
}
`,
    },
    {
      name: 'getInvoices',
      documentation: `Retrieves the query and parses to Query models for Invoices, then pulls relative data and applys to portal model`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'query',
          type: 'net.nanopay.accounting.ResultResponse',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`
Logger logger = (Logger) x.get("logger");
DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
DAO               cacheDAO     = (DAO) x.get("AccountingContactEmailCacheDAO");
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

//If the request failed
if ( ! query.getResult() ) {
  return new ResultResponse(false, "No invoices retrieved");
}

try {
  DAO invoiceDAO   = ((DAO) x.get("invoiceDAO")).inX(x);
  DAO contactDAO   = ((DAO) x.get("contactDAO")).inX(x);
  DAO currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);

  //Parses the query and loads relevant data into model
  JSONParser                parser      = new JSONParser();
  QuickQueryInvoiceResponse quick       = (QuickQueryInvoiceResponse) parser.parseString(query.getReason(), QuickQueryInvoiceResponse.getOwnClassInfo().getObjClass());
  QuickQueryInvoices        invoiceList = quick.getQueryResponse();
  QuickQueryInvoice[]       invoices    = invoiceList.getInvoice();
  for ( QuickQueryInvoice qInvoice: invoices ) {

    // Searches for a previously existing invoice
    QuickInvoice portal = (QuickInvoice) invoiceDAO.find(
      AND(
        EQ(QuickInvoice.QUICK_ID, qInvoice.getId()),
        EQ(QuickInvoice.REALM_ID, tokenStorage.getRealmId()),
        EQ(QuickInvoice.CREATED_BY, user.getId())
      ));

    if ( portal != null ) {

      // Clone the invoice to make changes
      portal = (QuickInvoice) portal.fclone();

      // Checks to see if the invoice needs to be updated in QuickBooks
      if ( portal.getDesync() ) {
        ResultResponse isSync = resyncInvoice(x, portal);
        if ( isSync.getResult() ) {
          portal.setDesync(false);
          portal.setComplete(true);
          invoiceDAO.put(portal);
        } else {
          logger.error(isSync.getReason());
        }
        continue;
      }

      if (! (
         net.nanopay.invoice.model.InvoiceStatus.UNPAID  == portal.getStatus() ||
         net.nanopay.invoice.model.InvoiceStatus.DRAFT   == portal.getStatus() ||
         net.nanopay.invoice.model.InvoiceStatus.OVERDUE == portal.getStatus() ))
      {
        continue;
      }

      // if paid/void on QuickBook, remove it from Ablii
      if ( qInvoice.getBalance() == 0.0 && portal.getAmount() != 0 ) {
        portal.setPaymentMethod(PaymentStatus.VOID);
        portal.setStatus(InvoiceStatus.VOID);
        portal.setDraft(true);
        invoiceDAO.inX(x).put(portal);
        invoiceDAO.inX(x).remove(portal);
        continue;
      }

    } else {
      // Checks if the invoice was paid
      if ( qInvoice.getBalance() == 0 ) {
        continue;
      }

      // Create an invoice
      portal = new QuickInvoice();
    }

    // Searches for a previous existing Contact
    AccountingContactEmailCache cache = (AccountingContactEmailCache) cacheDAO.find(AND(
      EQ(AccountingContactEmailCache.QUICK_ID, qInvoice.getCustomerRef().getValue()),
      EQ(AccountingContactEmailCache.REALM_ID, tokenStorage.getRealmId())
    ));

    if ( cache == null || SafetyUtil.isEmpty(cache.getEmail()) ) {
      continue;
    }

    Contact contact = (Contact) contactDAO.find(
      AND(
        EQ(QuickContact.EMAIL, cache.getEmail()),
        EQ(QuickContact.OWNER, user.getId())
      ));

    // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    if ( contact == null ) {
      // TODO: handle the mismatch
      continue;
    }

    // TODO change to accept all currencys
    // Only allows CAD and USD
    if ( ! ("CAD".equals(qInvoice.getCurrencyRef().getValue()) || "USD".equals(qInvoice.getCurrencyRef().getValue())) ) {
      Notification notify = new Notification();
      String s = "Quick Invoice # " +
        qInvoice.getId() +
        " can not be sync'd because the currency " +
        qInvoice.getCurrencyRef().getValue() +
        " is not supported in this system ";
      notify.setBody(s);
      user.doNotify(x, notify);
      continue;
    }
    portal.setPayerId(contact.getId());
    portal.setPayeeId(user.getId());
    portal.setContactId(contact.getId());
    portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
    portal.setDraft(true);

    Currency currency = (Currency) currencyDAO.find(qInvoice.getCurrencyRef().getValue());
    double doubleAmount = qInvoice.getBalance() * Math.pow(10.0, currency.getPrecision());
    portal.setAmount(Math.round(doubleAmount));

    portal.setInvoiceNumber(qInvoice.getDocNumber());
    portal.setQuickId(qInvoice.getId());
    portal.setRealmId(tokenStorage.getRealmId());
    portal.setDestinationCurrency(qInvoice.getCurrencyRef().getValue());
    portal.setIssueDate(getDate(qInvoice.getTxnDate()));
    portal.setDueDate(getDate(qInvoice.getDueDate()));
    portal.setDesync(false);
    portal.setCreatedBy(user.getId());

    // Get attachments
    // foam.nanos.fs.File[] files = getAttachments(x, "invoice", qInvoice.getId());
    // if ( files != null && files.length != 0 ) {
    //   portal.setInvoiceFile(files);
    // }

    invoiceDAO.put(portal);
  }
  return new ResultResponse(true, "Invoices were synchronised");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occurred: "+ e);
}
`,
    },
    {
      name: 'isValidContact',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'contact',
          type: 'net.nanopay.accounting.quickbooks.model.QuickQueryContact',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ],
      javaCode:
`

if (
  contact.getPrimaryEmailAddr() == null ||
  SafetyUtil.isEmpty(contact.getGivenName()) ||
  SafetyUtil.isEmpty(contact.getFamilyName()) ||
  SafetyUtil.isEmpty(contact.getCompanyName()) )
{
  return false;
}

Pattern p = Pattern.compile("[a-zA-Z]*");
Matcher firstName = p.matcher(contact.getGivenName());
Matcher lastName = p.matcher(contact.getFamilyName());
if ( ! firstName.matches() || ! lastName.matches() ) {
  return false;
}
return true;
`
    },
    {
      name: 'importContacts',
      documentation: `Retrieves the query and parses to Query models for Customers or Vendors, then pulls relative data and applys to portal model`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'contacts',
          type: 'net.nanopay.accounting.quickbooks.model.QuickQueryContact []',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ],
      javaCode:
`
Logger         logger         = (Logger) x.get("logger");
DAO            contactDAO     = ((DAO) x.get("contactDAO")).inX(x);
DAO            userDAO        = ((DAO) x.get("localUserUserDAO")).inX(x);
DAO            businessDAO    = ((DAO) x.get("localBusinessDAO")).inX(x);
DAO            agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));
CountryService countryService = (CountryService) x.get("countryService");
RegionService  regionService  = (RegionService) x.get("regionService");

DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
DAO               cacheDAO     = (DAO) x.get("AccountingContactEmailCacheDAO");
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

try {
  for ( QuickQueryContact customer : contacts ) {
    // if the contact not valid
    if ( ! this.isValidContact(x, customer, user) ) {
      continue;
    }

    QuickQueryEMail email  = customer.getPrimaryEmailAddr();

    cacheDAO.inX(x).put(
      new AccountingContactEmailCache.Builder(x)
        .setQuickId(customer.getId())
        .setRealmId(tokenStorage.getRealmId())
        .setEmail(email.getAddress())
      .build()
    );

    Contact existContact = (Contact) contactDAO.find(AND(
      EQ(Contact.EMAIL, email.getAddress()),
      EQ(Contact.OWNER, user.getId())
    ));

    // existing user
    User existUser = (User) userDAO.find(
      EQ(User.EMAIL, email.getAddress())
    );

    QuickContact newContact = new QuickContact();

    // If the contact is a existing contact
    if ( existContact != null ) {

      // existing user
      if ( existUser != null ) {
        continue;
      }

      if ( ! ( existContact instanceof QuickContact ) ) {
        // TODO: handle the mismatch
        continue;
      } else {
        newContact = (QuickContact) existContact.fclone();
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
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          newContact.setOrganization(business.getOrganization());
          newContact.setBusinessId(business.getId());
          newContact.setEmail(business.getEmail());
        }

        if ( sink.getArray().size() > 1) {
          // TODO: handle the mismatch
          continue;
        }

        newContact.setType("Contact");
        newContact.setGroup(user.getSpid() + "-sme");
        newContact.setQuickId(customer.getId());
        newContact.setRealmId(tokenStorage.getRealmId());
        newContact.setOwner(user.getId());
        contactDAO.put(newContact);
        continue;

      }
    }

    /*
     * Address integration
     */
    Address           portalAddress   = new Address();
    QuickQueryAddress customerAddress = customer.getBillAddr();

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
    String businessPhone =
      customer.getPrimaryPhone() != null ?
      customer.getPrimaryPhone().getFreeFormNumber() : "";

    Boolean businessPhoneNumberVerified = ! SafetyUtil.isEmpty(businessPhone);
    String mobilePhone = 
      customer.getMobile() != null ?
      customer.getMobile().getFreeFormNumber() : "";
    Boolean mobilePhoneVerified = ! SafetyUtil.isEmpty(mobilePhone);

    newContact.setEmail(email.getAddress());
    newContact.setOrganization(customer.getCompanyName());
    newContact.setFirstName(customer.getGivenName());
    newContact.setLastName(customer.getFamilyName());
    newContact.setOwner(user.getId());
    newContact.setBusinessPhoneNumber(businessPhone);
    newContact.setBusinessPhoneNumberVerified(businessPhoneNumberVerified);
    newContact.setBusinessPhone(businessPhone);
    newContact.setMobileNumber(mobilePhone);
    newContact.setMobileNumberVerified(mobilePhoneVerified);
    newContact.setGroup(user.getSpid() + "-sme");
    newContact.setQuickId(customer.getId());
    newContact.setRealmId(tokenStorage.getRealmId());
    contactDAO.put(newContact);
  }
  return new ResultResponse(true, "Contacts were synchronized");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occurred: "+ e);
}`,
    },
    {
      name: 'getRequest',
      documentation: `Makes all GET requests for QuickBooks`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'ts',
          type: 'net.nanopay.accounting.quickbooks.QuickTokenStorage',
        },
        {
          name: 'config',
          type: 'net.nanopay.accounting.quickbooks.QuickConfig',
        },
        {
          name: 'query',
          type: 'String',
        }
      ],
      javaCode:
`Logger     logger     = (Logger) x.get("logger");
HttpClient httpclient = HttpClients.createDefault();
try {
  HttpGet httpget = new HttpGet(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/query?query=select%20*%20from%20" + URLEncoder.encode(query, "UTF-8"));
  httpget.setHeader("Authorization", "Bearer " + ts.getAccessToken());
  httpget.setHeader("Content-Type", "application/json");
  httpget.setHeader("Api-Version", "alpha");
  httpget.setHeader("Accept", "application/json");
  HttpResponse response = httpclient.execute(httpget);
  BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
  if ( response.getStatusLine().getStatusCode() != 200 ) {
    throw new Throwable(response.getStatusLine().getReasonPhrase());
  }
  return new net.nanopay.accounting.ResultResponse(true, rd.readLine());
} catch ( Throwable e ) {
  logger.error(e);
  e.printStackTrace();
  return new net.nanopay.accounting.ResultResponse(false, e.getMessage() + " ");
}`,
    },
    {
      name: 'getDate',
      documentation: `Converts the data string`,
      type: 'Date',
      args: [
        {
          name: 'str',
          type: 'String',
        },
      ],
      javaCode:
`try {
  Date date = new SimpleDateFormat("yyyy-MM-dd").parse(str);
  return date;
} catch ( Throwable e ) {
  return null;
}`,
    },
    {
      name: 'getAttachments',
      documentation: `Gets attachments for the invoices`,
      javaType: 'foam.nanos.fs.File[]',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'type',
          type: 'String',
        },
        {
          name: 'value',
          type: 'String',
        },
      ],
      javaCode:
`User              user         = ((Subject) x.get("subject")).getUser();
Group             group        = user.findGroup(x);
AppConfig         app          = group.getAppConfig(x);
BlobService       blobStore    = (BlobService) x.get("blobStore");
DAO               fileDAO      = ((DAO) x.get("fileDAO")).inX(x);
DAO               configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
QuickConfig       config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
JSONParser        parser       = x.create(JSONParser.class);

String query = "attachable where AttachableRef.EntityRef.Type = '" + type + "' and AttachableRef.EntityRef.value = '" + value + "'";
ResultResponse request = getRequest(x, tokenStorage, config, query);

// There was an error in the get
if ( ! request.getResult() ) {
  return null;
}

QuickQueryAttachableResponse response = (QuickQueryAttachableResponse) parser.parseString(request.getReason(), QuickQueryAttachableResponse.class);
QuickQueryAttachables queryResponse = response.getQueryResponse();
if ( queryResponse == null ) {
 return null;
}

QuickQueryAttachable[] attachables = queryResponse.getAttachable();
foam.nanos.fs.File[] files = new foam.nanos.fs.File[attachables.length];
for ( int i = 0 ; i < attachables.length ; i++ ) {
  try {
    QuickQueryAttachable attachment = attachables[i];
    long filesize = attachment.getSize();

    URL url = new URL(attachment.getTempDownloadUri());
    foam.blob.Blob data = blobStore.put_(x, new foam.blob.InputStreamBlob(url.openStream(), filesize));

    // create file
    files[i] = new File.Builder(x)
     .setId(attachment.getId())
     .setOwner(user.getId())
     .setMimeType(attachment.getContentType())
     .setFilename(attachment.getFileName())
     .setFilesize(filesize)
     .setData(data)
     .build();
    fileDAO.inX(x).put(files[i]);
  } catch ( Throwable ignored ) { }
}

return files;`,
    },
    {
      name: 'resyncInvoice',
      documentation: `Updates Quickbooks with a processed invoice`,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          name: 'x',
          type: 'Context',
          swiftType: 'Context?'
        },
        {
          name: 'nano',
          type: 'net.nanopay.accounting.quickbooks.model.QuickInvoice',
        },
      ],
      javaCode:
`DAO                       store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
DAO                        userDAO      = ((DAO) x.get("localUserDAO")).inX(x);
User                       user         = ((Subject) x.get("subject")).getUser();
DAO                        currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);
QuickTokenStorage          tokenStorage = (QuickTokenStorage) store.find(user.getId());
Group                      group        = user.findGroup(x);
AppConfig                  app          = group.getAppConfig(x);
DAO                        configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig                config       = (QuickConfig)configDAO.find(app.getUrl());
Logger                     logger       = (Logger) x.get("logger");
HttpClient                 httpclient   = HttpClients.createDefault();
Outputter                  outputter    = new Outputter(x);
QuickContact               sUser;
BankAccount                account;
HttpPost                   httpPost;
outputter.setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false);

// Determines if the user is making a payment or bill payment and creates the right request to POST to QuickBooks
try {
  if ( nano.getPayeeId() == user.getId() ) {

    // Paying an invoice
    account = BankAccount.findDefault(x, user, nano.getSourceCurrency());
    sUser = (QuickContact) userDAO.find(nano.getContactId());
    QuickLineItem[] lineItem = new QuickLineItem[1];
    QuickLinkTxn[]  txnArray = new QuickLinkTxn[1];

    Currency currency = (Currency) currencyDAO.find(nano.getSourceCurrency());
    BigDecimal amount = new BigDecimal(nano.getAmount());
    amount = amount.movePointLeft(currency.getPrecision());

    QuickPostPayment payment = new QuickPostPayment();
    QuickQueryNameValue customer = new QuickQueryNameValue();

    customer.setName(sUser.getOrganization());
    customer.setValue("" + sUser.getQuickId());

    QuickQueryNameValue bInfo = new QuickQueryNameValue();
    bInfo.setValue(account.getIntegrationId());

    QuickLinkTxn txn = new QuickLinkTxn();
    txn.setTxnId(nano.getQuickId());
    txn.setTxnType("Invoice");
    txnArray[0] = txn;

    QuickLineItem item = new QuickLineItem();
    item.setAmount(amount.doubleValue());
    item.setLinkedTxn(txnArray);
    lineItem[0] = item;

    payment.setCustomerRef(customer);
    payment.setLine(lineItem);
    payment.setTotalAmt(amount.doubleValue());
    payment.setDepositToAccountRef(bInfo);

    httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + tokenStorage.getRealmId() + "/payment");
    httpPost.setHeader("Authorization", "Bearer " + tokenStorage.getAccessToken());
    httpPost.setHeader("Content-Type", "application/json");
    httpPost.setHeader("Api-Version", "alpha");
    httpPost.setHeader("Accept", "application/json");
    String body = outputter.stringify(payment);
    httpPost.setEntity(new StringEntity(body));
    logger.info(body);
  } else {

    // Paying a bill
    account = BankAccount.findDefault(x, user, nano.getDestinationCurrency());
    sUser = (QuickContact) userDAO.find(nano.getContactId());
    QuickLineItem[] lineItem = new QuickLineItem[1];
    QuickLinkTxn[] txnArray = new QuickLinkTxn[1];

    Currency currency = (Currency) currencyDAO.find(nano.getDestinationCurrency());
    BigDecimal amount = new BigDecimal(nano.getAmount());
    amount = amount.movePointLeft(currency.getPrecision());

    QuickPostBillPayment payment = new QuickPostBillPayment();
    QuickPayment cPayment = new QuickPayment();

    QuickQueryNameValue customer = new QuickQueryNameValue();
    customer.setName(sUser.getOrganization());
    customer.setValue("" + sUser.getQuickId());

    QuickLinkTxn txn = new QuickLinkTxn();
    txn.setTxnId(nano.getQuickId());
    txn.setTxnType("Bill");

    txnArray[0] = txn;
    QuickLineItem item = new QuickLineItem();
    item.setAmount(amount.doubleValue());
    item.setLinkedTxn(txnArray);
    lineItem[0] = item;

    payment.setVendorRef(customer);
    payment.setLine(lineItem);
    payment.setTotalAmt(amount.doubleValue());
    payment.setPayType("Check");
    QuickQueryNameValue bInfo = new QuickQueryNameValue();

    bInfo.setValue(account.getIntegrationId());

    cPayment.setBankAccountRef(bInfo);
    payment.setCheckPayment(cPayment);
    httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + tokenStorage.getRealmId() + "/billpayment");
    httpPost.setHeader("Authorization", "Bearer " + tokenStorage.getAccessToken());
    httpPost.setHeader("Content-Type", "application/json");
    httpPost.setHeader("Api-Version", "alpha");
    httpPost.setHeader("Accept", "application/json");
    String body = outputter.stringify(payment);
    httpPost.setEntity(new StringEntity(body));
  }
  try {

    // attempts to make a POST request
    HttpResponse response = httpclient.execute(httpPost);
    if ( response.getStatusLine().getStatusCode() != 200 ) {
      throw new Throwable("Post request failed: " + response.getStatusLine().getReasonPhrase());
    }
    return new ResultResponse(true, " ");
  } catch ( Throwable e ) {
    e.printStackTrace();
    logger.error(e.getMessage());
    return new ResultResponse(false, "The follow error has occurred: " + e.getMessage() + " ");
  }
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e.getMessage());
  return new ResultResponse(false, "The follow error has occurred: " + e.getMessage() + " ");
}`
    },
    {
      name: 'removeToken',
      documentation: `Removes the token making access to Quickbooks not possible`,
      javaCode:
`User              user         = ((Subject) x.get("subject")).getUser();
DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Quick Books");
}

// Clears the tokens simulating logout.
tokenStorage.setAccessToken(" ");
tokenStorage.setRefreshToken(" ");
tokenStorage.setPortalRedirect(" ");
store.put(tokenStorage);
return new ResultResponse(true, "User has been signed out of Quick Books");`
    },
    {
      name: 'pullBanks',
      documentation: `Pulls the bank accounts to allow linking with portal bank accounts`,
      javaCode:
`User                        user      = ((Subject) x.get("subject")).getUser();
DAO                         store     = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
Group                       group     = user.findGroup(x);
AppConfig                   app       = group.getAppConfig(x);
DAO                         configDAO = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig                 config    = (QuickConfig)configDAO.find(app.getUrl());
List<AccountingBankAccount> banks     = new ArrayList<>();
Logger                      logger    = (Logger) x.get("logger");

try {
  // Check that user has accessed Quickbooks before
  QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
  if ( tokenStorage == null ) {
    throw new Throwable("User is not synchronised to Quickbooks");
  }

  // Retrieves all Bank Accounts from Quickbooks
  ResultResponse query = getRequest(x, tokenStorage, config, "account where AccountType = \'Bank\'");
  if ( ! query.getResult() ) {
    throw new Throwable(query.getReason());
  }

  JSONParser parser = new JSONParser();
  QuickQueryBankResponse quick = (QuickQueryBankResponse) parser.parseString(query.getReason(), QuickQueryBankResponse.getOwnClassInfo().getObjClass());
  QuickPutBank accountList = quick.getQueryResponse();
  QuickBank[] accounts = accountList.getAccount();
  for ( QuickBank account : accounts ) {
    AccountingBankAccount xBank = new AccountingBankAccount();
    xBank.setAccountingName("QUICK");
    xBank.setAccountingId(account.getId());
    xBank.setName(account.getName());
    xBank.setCurrencyCode(account.getCurrencyRef().getValue());
    banks.add(xBank);
  }
  return banks;
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return banks;
}`
    },
    {
      name: 'importContact',
      type: 'void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'importContact',
          type: 'NameBase'
        }
      ],
      javaCode: `
Logger         logger         = (Logger) x.get("logger");
DAO            contactDAO     = ((DAO) x.get("contactDAO")).inX(x);
User              user         = ((Subject) x.get("subject")).getUser();
DAO            userDAO        = ((DAO) x.get("localUserUserDAO")).inX(x);
DAO            businessDAO    = ((DAO) x.get("localBusinessDAO")).inX(x);
DAO            agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));
CountryService countryService = (CountryService) x.get("countryService");
RegionService  regionService  = (RegionService) x.get("regionService");

DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());


EmailAddress email = importContact.getPrimaryEmailAddr();

Contact existContact = (Contact) contactDAO.find(AND(
  EQ(Contact.EMAIL, email.getAddress()),
  EQ(Contact.OWNER, user.getId())
));

// existing user
User existUser = (User) userDAO.find(
  EQ(User.EMAIL, email.getAddress())
);

QuickContact newContact = new QuickContact();

// If the contact is a existing contact
if ( existContact != null ) {

  // existing user
  if ( existUser != null ) {
    return;
  }

  if ( ! ( existContact instanceof QuickContact ) ) {
    contactDAO.remove(existContact);
    if ( existContact.getBankAccount() != 0 ) {
      newContact.setBankAccount(existContact.getBankAccount());
    }
  } else {
    newContact = (QuickContact) existContact.fclone();
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
      UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
      Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
      newContact.setOrganization(business.getOrganization());
      newContact.setBusinessId(business.getId());
      newContact.setEmail(business.getEmail());
    }

    if ( sink.getArray().size() > 1) {
      newContact.setChooseBusiness(true);
      newContact.setEmail(email.getAddress());
      newContact.setFirstName(existUser.getFirstName());
      newContact.setLastName(existUser.getLastName());
      newContact.setOrganization("TBD");
    }

    newContact.setType("Contact");
    newContact.setGroup(user.getSpid() + "-sme");
    newContact.setQuickId(importContact.getId());
    newContact.setRealmId(tokenStorage.getRealmId());
    newContact.setOwner(user.getId());
    contactDAO.put(newContact);
    return;

  }
}

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
String businessPhone =
  importContact.getPrimaryPhone() != null ?
  importContact.getPrimaryPhone().getFreeFormNumber() : "";
Boolean businessPhoneNumberVerified = ! SafetyUtil.isEmpty(businessPhone);

String mobilePhone = 
  importContact.getMobile() != null ?
  importContact.getMobile().getFreeFormNumber() : "";
Boolean mobilePhoneVerified = ! SafetyUtil.isEmpty(mobilePhone);

newContact.setEmail(email.getAddress());
newContact.setOrganization(importContact.getCompanyName());
newContact.setFirstName(importContact.getGivenName());
newContact.setLastName(importContact.getFamilyName());
newContact.setOwner(user.getId());
newContact.setBusinessPhoneNumber(businessPhone);
newContact.setBusinessPhoneNumberVerified(businessPhoneNumberVerified);
newContact.setMobileNumber(mobilePhone);
newContact.setMobileNumberVerified(mobilePhoneVerified);
newContact.setGroup(user.getSpid() + "-sme");
newContact.setQuickId(importContact.getId());
newContact.setRealmId(tokenStorage.getRealmId());
contactDAO.put(newContact);
      `
    },
    {
      name: 'fetchContacts',
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      javaCode: `
List result = new ArrayList();

String queryCustomer = "select * from customer";
String queryVendor   = "select * from vendor";

result.addAll(sendRequest(x, queryCustomer));
result.addAll(sendRequest(x, queryVendor));

return result;
      `
    },
    {
      name: 'fetchContactById',
      type: 'NameBase',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'type',
          type: 'String'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
      javaCode: `
String query = "select * from "+ type +" where id = '"+ id +"'";
return (NameBase) sendRequest(x, query).get(0);
      `
    },
    {
      name: 'sendRequest',
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'query',
          type: 'String'
        }
      ],
      javaCode:`
User                        user      = ((Subject) x.get("subject")).getUser();
DAO                         store     = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
Group                       group     = user.findGroup(x);
AppConfig                   app       = group.getAppConfig(x);
DAO                         configDAO = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig                 config    = (QuickConfig)configDAO.find(app.getUrl());
QuickTokenStorage  tokenStorage = (QuickTokenStorage) store.find(user.getId());

try {
  Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

  OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken());
  Context context = new Context(oauth, ServiceType.QBO, tokenStorage.getRealmId());
  DataService service =  new DataService(context);

  return service.executeQuery(query).getEntities();
} catch (FMSException e) {
  e.printStackTrace();
}

return null;
      `
    },
    {
      name: 'sendNotification',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'body',
          type: 'String'
        }
      ],
      javaCode:`
        User user = ((Subject) x.get("subject")).getUser();
        Notification notify = new Notification.Builder(x)
          .setBody(body)
          .build();
        user.doNotify(x, notify);
      `
    },
    {
      name: 'reSyncInvoice',
      async: true,
      type: 'net.nanopay.accounting.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'net.nanopay.invoice.model.Invoice',
          name: 'invoice'
        }
      ],
      javaCode: `
      return null;
      `
    }
  ]
});
