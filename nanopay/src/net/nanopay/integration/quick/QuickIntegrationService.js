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
    'foam.blob.BlobService',
    'java.net.URL',
    'java.net.URLEncoder',
    'foam.nanos.fs.File',
    'net.nanopay.model.Business',
    'foam.dao.Sink',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.lib.json.JSONParser',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.integration.ResultResponse',
    'net.nanopay.integration.quick.model.QuickQueryCustomerResponse',
    'net.nanopay.tx.model.Transaction',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.HttpClient',
    'org.apache.http.client.methods.HttpGet',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
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
    'foam.nanos.auth.*',
    'foam.nanos.auth.User',
    'net.nanopay.integration.AccountingBankAccount',
  ],

  methods: [
    {
      name: 'isSignedIn',
      javaCode:
`Logger              logger       = (Logger) x.get("logger");
  DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
  Group               group        = user.findGroup(x);
  AppConfig           app          = group.getAppConfig(x);
  DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
  QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
  QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId());
try {
  // Check that user has accessed quickbooks before
  if ( tokenStorage == null ) {
    return new ResultResponse(false,"User has not connected to QuickBooks");
  }
  String query = getRequest(x, tokenStorage, config, "customer");
  if ( "null".equals(query) ) {
    throw new Throwable ("An error occured when requesting data");
  }
  return new ResultResponse(true,"User is Signed in");
} catch ( Throwable e ) {
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
} catch ( Throwable e ) {
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
} catch ( Throwable e ) {
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
} catch ( Throwable e ) {
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
  return new ResultResponse(false, "No Customers retrieved");
}
try {
JSONParser parser = new JSONParser();
QuickQueryCustomerResponse quick = new QuickQueryCustomerResponse();
quick = (QuickQueryCustomerResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
QuickQueryCustomers customersList = quick.getQueryResponse();
return importContacts(x, customersList.getCustomer(), user);
} catch (Throwable e) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage());
} `,
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
  return new ResultResponse(false, "No Vendors retrieved");
}
try{
JSONParser parser = new JSONParser();
QuickQueryVendorResponse quick = new QuickQueryVendorResponse();
quick = (QuickQueryVendorResponse) parser.parseString(query, quick.getClassInfo().getObjClass());
QuickQueryVendors customersList = quick.getQueryResponse();
return importContacts(x, customersList.getVendor(), user);
} catch (Throwable e) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, e.getMessage());
} `,
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
  return new ResultResponse(false, "No bills retrieved");
}
try {
DAO notification = (DAO) x.get("notificationDAO");
DAO invoiceDAO   = (DAO) x.get("invoiceDAO");
DAO contactDAO   = (DAO) x.get("localContactDAO");
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

  // get attachments
  foam.nanos.fs.File[] files = getAttachments(x, "bill", invoice.getId());
  if ( files != null && files.length != 0 ) {
    portal.setInvoiceFile(files);
  }

  invoiceDAO.put(portal);

}
return new ResultResponse(true, "Bills were synchronised");
} catch (Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occured: "+ e);

}
`,
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
  return new ResultResponse(false, "No invoices were retieved");
}
try {
DAO invoiceDAO = (DAO) x.get("invoiceDAO");
DAO contactDAO = (DAO) x.get("localContactDAO");
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
    if ( portal.getDesync() ) {
      ResultResponse isSync = resyncInvoice(x, portal, invoice);
      if( isSync.getResult() ) {
        portal.setDesync(false);
        invoiceDAO.put(portal);
      } else {
        throw new Throwable(isSync.getReason());
      }
    }
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

  // get attachments
  foam.nanos.fs.File[] files = getAttachments(x, "invoice", invoice.getId());
  if ( files != null && files.length != 0 ) {
    portal.setInvoiceFile(files);
  }
  invoiceDAO.put(portal);

}
return new ResultResponse(true, "Invoices were synchronised");
} catch (Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occured: "+ e);

}
`,
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
CountryService countryService = (CountryService) x.get("countryService");
RegionService  regionService  = (RegionService) x.get("regionService");

try{
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
  portal.setOwner(user.getId());
  
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

    portal.setBusinessAddress(portalAddress);
  }
  
  /*
   * Phone integration
   */
  String busPhoneNumber =
    customer.getPrimaryPhone() != null ?
    customer.getPrimaryPhone().getFreeFormNumber() : "";

  String mobilePhoneNumber =
    customer.getMobile() != null ?
    customer.getMobile().getFreeFormNumber() : "";

  Phone businessPhone = new Phone.Builder(x)
    .setNumber( busPhoneNumber )
    .setVerified( !busPhoneNumber.equals("") )
    .build();

  Phone mobilePhone = new Phone.Builder(x)
    .setNumber( mobilePhoneNumber )
    .setVerified( !mobilePhoneNumber.equals("") )
    .build();
    
  portal.setBusinessPhone(businessPhone);
  portal.setMobile(mobilePhone);


  DAO userDAO = (DAO) x.get("localUserDAO");
  Business business =(Business) userDAO.find(
    AND(
      EQ(
        User.EMAIL,
        portal.getEmail()
      ),
      INSTANCE_OF(Business.getOwnClassInfo())
    )
  );
  if (business != null)
  {
    portal.setBusinessId(business.getId());
  }
  contactDAO.put(portal);
}
return new ResultResponse(true, "Contacts were synchronized");
} catch (Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occured: "+ e);
}
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
try {
  HttpGet httpget = new HttpGet(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/query?query=select%20*%20from%20" + URLEncoder.encode(query, "UTF-8"));
  httpget.setHeader("Authorization", "Bearer " + ts.getAccessToken());
  httpget.setHeader("Content-Type", "application/json");
  httpget.setHeader("Api-Version", "alpha");
  httpget.setHeader("Accept", "application/json");
  HttpResponse response = httpclient.execute(httpget);
  BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
  if (response.getStatusLine().getStatusCode() != 200) {
    throw new Throwable("Get request failed");
  }
  return rd.readLine();
} catch (Throwable e) {
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
} catch (Throwable e) {
  return null;
}`,
    },
    {
      name: 'getAttachments',
      javaReturns: 'foam.nanos.fs.File[]',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'type',
          javaType: 'String',
        },
        {
          name: 'value',
          javaType: 'String',
        },
      ],
      javaCode:
`User              user         = (User) x.get("user");
Group             group        = user.findGroup(x);
AppConfig         app          = group.getAppConfig(x);
BlobService       blobStore    = (BlobService) x.get("blobStore");
DAO               fileDAO      = (DAO) x.get("fileDAO");
DAO               configDAO    = (DAO) x.get("quickConfigDAO");
DAO               store        = (DAO) x.get("quickTokenStorageDAO");
QuickConfig       config       = (QuickConfig) configDAO.find(app.getUrl());
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
JSONParser        parser       = x.create(JSONParser.class);

String query = "attachable where AttachableRef.EntityRef.Type = '" + type + "' and AttachableRef.EntityRef.value = '" + value + "'";
QuickQueryAttachableResponse response = (QuickQueryAttachableResponse) parser.parseString(getRequest(x, tokenStorage, config, query), QuickQueryAttachableResponse.class);
if ( response == null ) {
 return null;
}

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
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'nano',
          javaType: 'net.nanopay.integration.quick.model.QuickInvoice',
        },
        {
          name: 'quick',
          javaType: 'net.nanopay.integration.quick.model.QuickQueryInvoice',
        }
      ],
      javaCode:
`/*
Info:   Function to make Quick match Nano object. Occurs when Nano object is updated and user is not logged into Quick
Input:  nano: The currently updated object on the portal
        quick: The Quick object to be resynchronized
Output: Returns the Quick Object after being updated from nano portal
*/
DAO               store          = (DAO) x.get("quickTokenStorageDAO");
DAO               transactionDAO = (DAO) x.get("localTransactionDAO");
DAO               userDAO        = (DAO) x.get("localUserDAO");
User              user           = (User) x.get("user");
QuickTokenStorage tokenStorage   = (QuickTokenStorage) store.find(user.getId());
Group             group          = user.findGroup(x);
AppConfig         app            = group.getAppConfig(x);
DAO               configDAO      = (DAO) x.get("quickConfigDAO");
QuickConfig       config         = (QuickConfig)configDAO.find(app.getUrl());
Logger            logger         = (Logger) x.get("logger");
Sink              sink           = new ArraySink();
transactionDAO.where(
  AND(
    OR(
      EQ(Transaction.PAYEE_ID,user.getId()),
      EQ(Transaction.PAYER_ID,user.getId())
    ),
    EQ(Transaction.INVOICE_ID,nano.getId())
  )
).limit(1).select(sink);
List list = ((ArraySink) sink).getArray();
Transaction transaction = (Transaction) list.get(0);
net.nanopay.account.Account account = transaction.findSourceAccount(x);
BankAccount bankAccount = (BankAccount) account;

HttpClient httpclient = HttpClients.createDefault();
HttpPost httpPost;
Outputter outputter = new Outputter(foam.lib.json.OutputterMode.NETWORK);
outputter.setOutputClassNames(false);
QuickContact sUser;
try {
  if (transaction.getPayerId() == user.getId()) {
    sUser = (QuickContact) userDAO.find(transaction.getPayeeId());
    QuickLineItem[] lineItem = new QuickLineItem[1];
    QuickLinkTxn[]  txnArray = new QuickLinkTxn[1];

    BigDecimal amount = new BigDecimal(transaction.getAmount());
    amount = amount.movePointLeft(2);

    QuickPostPayment payment = new QuickPostPayment();
    QuickQueryNameValue customer = new QuickQueryNameValue();

    customer.setName(sUser.getBusinessName());
    customer.setValue("" + sUser.getQuickId());

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
    httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + tokenStorage.getRealmId() + "/payment");
    httpPost.setHeader("Authorization", "Bearer " + tokenStorage.getAccessToken());
    httpPost.setHeader("Content-Type", "application/json");
    httpPost.setHeader("Api-Version", "alpha");
    httpPost.setHeader("Accept", "application/json");
    String body = outputter.stringify(payment);
    httpPost.setEntity(new StringEntity(body));
    System.out.println(body);
  } else {
    sUser = (QuickContact) userDAO.find(transaction.getPayerId());
    QuickLineItem[] lineItem = new QuickLineItem[1];
    QuickLinkTxn[] txnArray = new QuickLinkTxn[1];

    BigDecimal amount = new BigDecimal(transaction.getAmount());
    amount = amount.movePointLeft(2);

    QuickPostBillPayment payment = new QuickPostBillPayment();
    QuickPayment cPayment = new QuickPayment();
    //Get Account Data from QuickBooks

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

    bInfo.setName(bankAccount.getName());
    bInfo.setValue(""+bankAccount.getId());

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
    HttpResponse response = httpclient.execute(httpPost);
    BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
    if (response.getStatusLine().getStatusCode() != 200) {
      throw new Throwable("Post request failed: "+response.getStatusLine().getReasonPhrase());
    }
    return new ResultResponse(true, " ");
  } catch (Throwable e) {
    e.printStackTrace();
    logger.error(e.getMessage());
    return new ResultResponse(false, "The follow error has occured: " + e.getMessage());
  }
}catch (Throwable e) {
  e.printStackTrace();
  logger.error(e.getMessage());
  return new ResultResponse(false, "The follow error has occured: " + e.getMessage());
}`
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
DAO               userDAO      = (DAO) x.get("localUserDAO");

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
  String query = getRequest(x, tokenStorage, config, "account where AccountType = \\\'Bank\\\'");
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
} catch ( Throwable e){
  e.printStackTrace();
  logger.error(e);
  return banks;
}`
    }
  ]
});
