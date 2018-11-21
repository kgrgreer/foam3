/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.integration.quick',
  name: 'QuickIntegrationService',
  documentation: 'Quick Integration functions to synchronizing with quick and verifying if signed in',
  implements: [
    'net.nanopay.integration.IntegrationService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.core.FObject',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.lib.json.JSONParser',
    'net.nanopay.integration.ResultResponse',
    'net.nanopay.integration.quick.model.QuickQueryCustomerResponse',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.HttpClient',
    'org.apache.http.client.methods.HttpGet',
    'org.apache.http.impl.client.HttpClients',
    'java.io.BufferedReader',
    'java.io.InputStreamReader',
    'net.nanopay.integration.quick.model.*',
    'java.util.List',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'foam.nanos.notification.Notification',
    'java.math.BigDecimal',
    'foam.lib.json.Outputter',
    'java.util.ArrayList',
    'foam.nanos.logger.Logger',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'net.nanopay.integration.AccountingBankAccount',
    'com.intuit.ipp.data.AccountTypeEnum'
  ],

  methods: [
    {
      name: 'isSignedIn',
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
try {
  DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
  Group               group        = user.findGroup(x);
  AppConfig           app          = group.getAppConfig(x);
  DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
  QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
  QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId());

  // Check that user has accessed quickbooks before
  if ( tokenStorage == null ) {
    return new ResultResponse(false,"User has not connected to QuickBooks");
  }
  String query = getRequest(x, tokenStorage, config, "customer");
  if ( "null".equals(query) ) {
    throw new Exception ("An error occured when requesting data");
  }
  return new ResultResponse(true,"User is Signed in");
} catch ( Exception e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "User is not Signed in");
}`
    },
    {
      name: 'syncSys',
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
try {
  ResultResponse contacts = contactSync(x, user);
  ResultResponse invoices = invoiceSync(x, user);
  if ( contacts.getResult() && invoices.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {
    String str = "" ;
    if ( ! contacts.getResult() ) {
      str+= contacts.getReason();
    }
    if ( ! invoices.getResult() ) {
      str+= invoices.getReason();
    }
    return new ResultResponse(false, str);
  }
} catch ( Exception e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage());
}`
    },
    {
      name: 'contactSync',
      javaCode:
`DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
Group               group        = user.findGroup(x);
AppConfig           app          = group.getAppConfig(x);
DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId());
Logger              logger       = (Logger) x.get("logger");

// Check that user has accessed quickbooks before
if ( tokenStorage == null ) {
  return new ResultResponse(false,"User has not connected to QuickBooks");
}
try {
  ResultResponse customer = getCustomers(x, getRequest(x, tokenStorage, config, "customer"), user );
  ResultResponse vendor = getVendors(x, getRequest(x, tokenStorage, config, "vendor"), user );
  if ( customer.getResult() && vendor.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {
    String str = "" ;
    if ( ! customer.getResult() ) {
      str+= customer.getReason();
    }
    if ( ! vendor.getResult() ) {
      str+= vendor.getReason();
    }
    return new ResultResponse(false, str);
  }
} catch ( Exception e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage());
}`
    },
    {
      name: 'invoiceSync',
      javaCode:
`DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
Group               group        = user.findGroup(x);
AppConfig           app          = group.getAppConfig(x);
DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId()); Logger              logger       = (Logger) x.get("logger");

// Check that user has accessed quickbooks before
if ( tokenStorage == null ) {
  return new ResultResponse(false,"User has not connected to QuickBooks");
}
try {
  ResultResponse invoice = getInvoices(x, getRequest(x, tokenStorage, config, "invoice"), user);
  ResultResponse bill = getBills(x, getRequest(x, tokenStorage, config, "bill"), user);
  if ( invoice.getResult() && bill.getResult() ) {
    return new ResultResponse(true, "All information has been synchronized");
  } else {
    String str = "" ;
    if ( ! invoice.getResult() ) {
      str+= invoice.getReason();
    }
    if ( ! bill.getResult() ) {
      str+= bill.getReason();
    }
    return new ResultResponse(false, str);
  }
} catch ( Exception e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage());
}`
    },
    {
      name: 'getCustomers',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'String',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
if ( "null".equals(query) ) {
  return new ResultResponse(false, "Customer data error");
}
JSONParser parser = new JSONParser();
QuickQueryCustomerResponse quick = new QuickQueryCustomerResponse();
quick = (QuickQueryCustomerResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
QuickQueryCustomers customersList = quick.getQueryResponse();
return importContacts(x, customersList.getCustomer(), user);`,
    },
    {
      name: 'getVendors',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'String',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
if ( "null".equals(query) ) {
  return new ResultResponse(false, "Vendor data error");
}
JSONParser parser = new JSONParser();
QuickQueryVendorResponse quick = new QuickQueryVendorResponse();
quick = (QuickQueryVendorResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
QuickQueryVendors customersList = quick.getQueryResponse();
return importContacts(x, customersList.getVendor(), user);`,
    },
    {
      name: 'getBills',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'String',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
if ( "null".equals(query) ) {
  return new ResultResponse(false, "Bill data error");
}
DAO notification = (DAO) x.get("notificationDAO");
DAO invoiceDAO   = (DAO) x.get("invoiceDAO");
DAO contactDAO   = (DAO) x.get("bareUserDAO");
Sink sink;
JSONParser parser = new JSONParser();
QuickQueryBillResponse quick = (QuickQueryBillResponse) parser.parseString(query, QuickQueryBillResponse.getOwnClassInfo().getObjClass());
QuickQueryBills billList = quick.getQueryResponse();
QuickQueryBill[] bills = billList.getBill();
for ( int i = 0; i < bills.length; i++ ) {
  QuickQueryBill invoice = bills[i];
  if ( invoice.getBalance() == 0 ) {
    continue;
  }
  QuickInvoice portal;
  sink = new ArraySink();
  invoiceDAO.where(AND(
    INSTANCE_OF(QuickInvoice.class),
    EQ(
      QuickInvoice.QUICK_ID,
      invoice.getId())))
    .limit(1)
    .select(sink);
  List list = ((ArraySink) sink).getArray();
  if ( list.size() == 0 ) {
    portal = new QuickInvoice();
  } else {
    portal = (QuickInvoice) list.get(0);
    portal = (QuickInvoice) portal.fclone();

  }
  sink = new ArraySink();
  contactDAO.where(AND(
    INSTANCE_OF(QuickContact.class),
    EQ(
      QuickContact.QUICK_ID,
      invoice.getVendorRef().getValue())))
    .limit(1)
    .select(sink);
    list = ((ArraySink) sink).getArray();
  if ( list.size() == 0 ) {
    Notification notify = new Notification();
    notify.setUserId(user.getId());
    String str = "Quick Bill # " +
      invoice.getId() +
      " can not be sync'd because Quick Contact # " +
      invoice.getVendorRef().getValue() +
      " is not in this system";
    notify.setBody(str);
    notification.put(notify);
    continue;
  } else {
    portal.setPayerId(((QuickContact) list.get(0)).getId());
  }
  portal.setPayeeId(user.getId());
  portal.setInvoiceNumber(invoice.getDocNumber());
  portal.setQuickId(invoice.getId());

  // TODO change to accept all currencys
  // Only allows CAD
  if ( ! "CAD".equals(invoice.getCurrencyRef().getValue()) ) {
    Notification notify = new Notification();
    notify.setUserId(user.getId());
    String s = "Quick Invoice # " +
      invoice.getId() +
      " can not be sync'd because the currency " +
      invoice.getCurrencyRef().getValue() +
      " is not supported in this system ";
    notify.setBody(s);
    notification.put(notify);
    continue;
  }
  portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
  portal.setIssueDate(getDate(invoice.getTxnDate()));
  portal.setDueDate(getDate(invoice.getDueDate()));
  portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
  portal.setDraft(true);

  //TODO change to associate with different currency
  portal.setAmount(new BigDecimal(invoice.getBalance()).movePointRight(2).longValue());
  portal.setDesync(false);
  invoiceDAO.put(portal);
}
return new ResultResponse(true, "Bills were synchronised");`,
    },
    {
      name: 'getInvoices',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'String',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
if ( "null".equals(query) ) {
  return new ResultResponse(false, "Invoice data error");
}

DAO invoiceDAO = (DAO) x.get("invoiceDAO");
DAO contactDAO = (DAO) x.get("bareUserDAO");
Sink sink;
DAO notification = (DAO) x.get("notificationDAO");

JSONParser parser = new JSONParser();
QuickQueryInvoiceResponse quick = (QuickQueryInvoiceResponse) parser.parseString(query, QuickQueryInvoiceResponse.getOwnClassInfo().getObjClass());
QuickQueryInvoices invoiceList = quick.getQueryResponse();
QuickQueryInvoice[] invoices = invoiceList.getInvoice();
for (int i = 0; i < invoices.length; i++) {
  QuickQueryInvoice invoice = invoices[i];
  if( invoice.getBalance() == 0){
    continue;
  }
  QuickInvoice portal;
  sink = new ArraySink();
  invoiceDAO.where(AND(
    INSTANCE_OF(QuickInvoice.class),
    EQ(
      QuickInvoice.QUICK_ID,
      invoice.getId())))
    .limit(1)
    .select(sink);
  List list = ((ArraySink) sink).getArray();
  if (list.size() == 0) {
    portal = new QuickInvoice();
  } else {
    portal = (QuickInvoice) list.get(0);
    portal = (QuickInvoice) portal.fclone();
  }
  sink = new ArraySink();
  contactDAO.where(AND(
    INSTANCE_OF(QuickContact.class),
    EQ(
      QuickContact.QUICK_ID,
      invoice.getCustomerRef().getValue())))
    .limit(1)
    .select(sink);
  list = ((ArraySink) sink).getArray();
  if (list.size() == 0) {
    Notification notify = new Notification();
    notify.setUserId(user.getId());
    String s = "Quick Invoice # " +
      invoice.getId() +
      " can not be sync'd because Quick Contact # " +
      invoice.getCustomerRef().getValue() +
      " is not in this system ";
    notify.setBody(s);
    notification.put(notify);
    continue;
  } else {
    portal.setPayeeId(((QuickContact) list.get(0)).getId());
  }
  portal.setPayerId(user.getId());
  portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
  portal.setInvoiceNumber(invoice.getDocNumber());
  portal.setQuickId(invoice.getId());

    // TODO change to accept all currencys
    // Only allows CAD
    if ( ! "CAD".equals(invoice.getCurrencyRef().getValue()) ) {
    Notification notify = new Notification();
    notify.setUserId(user.getId());
    String s = "Quick Invoice # " +
      invoice.getId() +
      " can not be sync'd because the currency " +
      invoice.getCurrencyRef().getValue() +
      " is not supported in this system ";
    notify.setBody(s);
    notification.put(notify);
    continue;
  }
  portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
  portal.setIssueDate(getDate(invoice.getTxnDate()));
  portal.setDueDate(getDate(invoice.getDueDate()));

  //TODO change to associate with different currency
  portal.setAmount(new BigDecimal(invoice.getBalance()).movePointRight(2).longValue());
  portal.setDesync(false);
  invoiceDAO.put(portal);

}
return new ResultResponse(true, "Invoices were synchronised");`,
    },
    {
      name: 'importContacts',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'contacts',
          javaType: 'net.nanopay.integration.quick.model.QuickQueryContact []',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        },
      ],
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
DAO contactDAO = (DAO) x.get("contactDAO");
DAO notification = (DAO) x.get("notificationDAO");
for (int i = 0; i < contacts.length; i++) {
  QuickQueryContact customer = contacts[i];
  QuickQueryEMail email = customer.getPrimaryEmailAddr();
  QuickContact portal = new QuickContact();
  portal.setQuickId(customer.getId());
  Sink sink = new ArraySink();
  contactDAO.where(AND(
    INSTANCE_OF(QuickContact.class),
    EQ(
      QuickContact.QUICK_ID,
      customer.getId())))
    .limit(1)
    .select(sink);
  List list = ((ArraySink) sink).getArray();
  if (list.size() == 0) {
    portal = new QuickContact();
    if (email == null || "".equals(customer.getGivenName()) || "".equals(customer.getFamilyName()) || "".equals(customer.getCompanyName())) {
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      String str = "Quick Contact # " +
        customer.getId() +
        " can not be added because the contact is missing: " +
        (email == null ? "[Email]" : "") +
        ("".equals(customer.getGivenName()) ? " [Given Name] " : "") +
        ("".equals(customer.getCompanyName()) ? " [Company Name] " : "") +
        ("".equals(customer.getFamilyName()) ? " [Family Name] " : "");
      notify.setBody(str);
      notification.put(notify);
      continue;
    }
  } else {
    portal = (QuickContact) list.get(0);
    portal = (QuickContact) portal.fclone();

  }
  portal.setQuickId(customer.getId());
  portal.setEmail(email.getAddress());
  portal.setOrganization(customer.getCompanyName());
  portal.setFirstName(customer.getGivenName());
  portal.setLastName(customer.getFamilyName());
  contactDAO.put(portal);
}
return new ResultResponse(true, "Contacts were synchronized");
`,
    },
    {
      name: 'getRequest',
      javaReturns: 'String',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'ts',
          javaType: 'net.nanopay.integration.quick.QuickTokenStorage',
        },
        {
          name: 'config',
          javaType: 'net.nanopay.integration.quick.QuickConfig',
        },
        {
          name: 'query',
          javaType: 'String',
        }
      ],
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
HttpClient httpclient = HttpClients.createDefault();
HttpGet httpget = new HttpGet(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/query?query=select%20*%20from%20" + query);
httpget.setHeader("Authorization", "Bearer " + ts.getAccessToken());
httpget.setHeader("Content-Type", "application/json");
httpget.setHeader("Api-Version", "alpha");
httpget.setHeader("Accept", "application/json");
try {
  HttpResponse response = httpclient.execute(httpget);
  BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
  if (response.getStatusLine().getStatusCode() != 200) {
    throw new Exception("Get request failed");
  }
  return rd.readLine();
} catch (Exception e) {
  e.printStackTrace();
  return "null";
}`,
    },
    {
      name: 'getDate',
      javaReturns: 'Date',
      args: [
        {
          name: 'str',
          javaType: 'String',
        },
      ],
      javaCode:
`try {
  Date date = new SimpleDateFormat("yyyy-MM-dd").parse(str);
  return date;
} catch (Exception e) {
  return null;
}`,
    },
    {
      name: 'removeToken',
      javaCode:
`/*
Info:   Function to remove the token data essentally signing the user out
Input:  x: the context to use DAOs
        user: The current user
Output: True:  if the token was sucessfully removed
        False: if the token was never created
*/
Logger            logger       = (Logger) x.get("logger");
DAO               store        = (DAO) x.get("quickTokenStorageDAO");
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
DAO               userDAO      = (DAO) x.get("bareUserDAO");

User nUser = (User) userDAO.find(user.getId());
nUser = (User) nUser.fclone();
nUser.setIntegrationCode(0);
userDAO.put(nUser);
if ( tokenStorage == null ) {
  return new ResultResponse(false,"User has not connected to Quick Books");
}
tokenStorage.setAccessToken(" ");
tokenStorage.setRefreshToken(" ");
tokenStorage.setPortalRedirect(" ");
store.put(tokenStorage);
return new ResultResponse(true,"User has been signed out of Quick Books");`
    },
    {
      name: 'pullBanks',
      javaCode:
`/*
Info:   Function to retrieve all the bank accounts
Input:  x: the context to use DAOs
        user: The current user
Output: Array of Bank Accounts
*/
DAO          store        = (DAO) x.get("quickTokenStorageDAO");
DAO          notification = (DAO) x.get("notificationDAO");
Group        group        = user.findGroup(x);
AppConfig    app          = group.getAppConfig(x);
DAO          configDAO    = (DAO) x.get("quickConfigDAO");
QuickConfig   config       = (QuickConfig)configDAO.find(app.getUrl());
List<AccountingBankAccount> banks = new ArrayList<>();
Logger       logger       = (Logger) x.get("logger");
try {
  // Check that user has accessed xero before
  QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
  if ( tokenStorage == null ) {
    new Error("User is not sync'd to quick");
  }
  String query = getRequest(x, tokenStorage, config, "account+where+AccountType+%3D+%27Bank%27");
  if ( "null".equals(query) ) {
    return null;
  }

  JSONParser parser = new JSONParser();
  QuickQueryBankResponse quick = (QuickQueryBankResponse) parser.parseString(query, QuickQueryBankResponse.getOwnClassInfo().getObjClass());
  QuickPutBank accountList = quick.getQueryResponse();
  QuickBank[] accounts = accountList.getAccount();
  for (int i = 0; i < accounts.length; i++) {
    QuickBank account = accounts[i];
    AccountingBankAccount xBank = new AccountingBankAccount();
    xBank.setAccountingName("QUICK");
    xBank.setAccountingId(account.getId());
    xBank.setName(account.getName());
    banks.add(xBank);
  }
  return banks;
} catch ( Exception e){
  e.printStackTrace();
  logger.error(e);
  return null;
}

`
   }
  ]
});
