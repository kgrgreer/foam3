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
    'foam.blob.BlobService',
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business',
    'net.nanopay.model.Currency',
    'net.nanopay.integration.AccountingBankAccount',
    'net.nanopay.integration.ResultResponse',
    'net.nanopay.integration.quick.model.*',
    'net.nanopay.integration.quick.model.QuickQueryCustomerResponse',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.HttpClient',
    'org.apache.http.client.methods.HttpGet',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.HttpClients',
    'java.io.BufferedReader',
    'java.io.InputStreamReader',
    'java.util.List',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.math.BigDecimal',
    'java.util.ArrayList',
    'java.net.URL',
    'java.net.URLEncoder',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'isSignedIn',
      documentation: `Used to check if the access-token's are expired for the specific users`,
      javaCode:
`Logger            logger       = (Logger) x.get("logger");
DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
User              user         = (User) x.get("user");
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
User              user         = (User) x.get("user");
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
User              user         = (User) x.get("user");
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
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'net.nanopay.integration.ResultResponse',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
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
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'net.nanopay.integration.ResultResponse',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
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
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'net.nanopay.integration.ResultResponse',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger logger = (Logger) x.get("logger");

//If the request failed
if ( ! query.getResult() ) {
  return new ResultResponse(false, "No bills retrieved");
}

try {
  DAO notification = ((DAO) x.get("notificationDAO")).inX(x);
  DAO invoiceDAO   = ((DAO) x.get("invoiceDAO")).inX(x);
  DAO contactDAO   = ((DAO) x.get("contactDAO")).inX(x);
  DAO currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);

  //Parses the query and loads relevant data into model
  JSONParser             parser   = new JSONParser();
  QuickQueryBillResponse quick    = (QuickQueryBillResponse) parser.parseString(query.getReason(), QuickQueryBillResponse.getOwnClassInfo().getObjClass());
  QuickQueryBills        billList = quick.getQueryResponse();
  QuickQueryBill[]       bills    = billList.getBill();

  // Converts the Query Bill to an Invoice
  for ( QuickQueryBill invoice : bills ) {

    // Searches for a previously existing invoice
    QuickInvoice portal = (QuickInvoice) invoiceDAO.find(
      AND(
        EQ(
          QuickInvoice.QUICK_ID,
          invoice.getId()
        ),
        EQ(
          QuickInvoice.CREATED_BY,
          user.getId()
        )
      )
    );

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

      // Only update the invoice if its not already in the process of changing
      if ( net.nanopay.invoice.model.InvoiceStatus.UNPAID != portal.getStatus() || net.nanopay.invoice.model.InvoiceStatus.DRAFT != portal.getStatus() ) {
        continue;
      }

    } else {

      // Checks if the invoice was paid
      if ( invoice.getBalance() == 0 ) {
        continue;
      }

      // Create an invoice
      portal = new QuickInvoice();
    }

    // Searches for a previous existing Contact
    QuickContact contact = (QuickContact) contactDAO.find(
      AND(
        EQ(
          QuickContact.QUICK_ID,
          invoice.getVendorRef().getValue()
        ),
        EQ(
          QuickContact.OWNER,
          user.getId()
        )
      )
    );

    // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    if ( contact == null ) {
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
    }

    // TODO change to accept all currencies
    // Only allows CAD and USD
    if ( ! ("CAD".equals(invoice.getCurrencyRef().getValue()) || "USD".equals(invoice.getCurrencyRef().getValue())) ) {
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
    portal.setDesync(false);
    portal.setPayerId(user.getId());
    portal.setContactId(contact.getId());
    portal.setQuickId(invoice.getId());
    portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);

    // Checks if the invoice was paid on
    if ( invoice.getBalance() == 0 ) {
      portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.VOID);
      portal.setPaymentMethod(net.nanopay.invoice.model.PaymentStatus.VOID);
    } else {
      Currency currency = (Currency) currencyDAO.find(invoice.getCurrencyRef().getValue());
      portal.setAmount(new BigDecimal(invoice.getBalance()).movePointRight(currency.getPrecision()).longValue());
    }
    portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
    portal.setIssueDate(getDate(invoice.getTxnDate()));
    portal.setDueDate(getDate(invoice.getDueDate()));
    portal.setCreatedBy(user.getId());

    // Get attachments from invoice
    foam.nanos.fs.File[] files = getAttachments(x, "bill", invoice.getId());
    if ( files != null && files.length != 0 ) {
      portal.setInvoiceFile(files);
    }

    invoiceDAO.put(portal);
  }
  return new ResultResponse(true, "Bills were synchronised");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occurred: "+ e);
}`,
    },
    {
      name: 'getInvoices',
      documentation: `Retrieves the query and parses to Query models for Invoices, then pulls relative data and applys to portal model`,
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X ',
        },
        {
          name: 'query',
          javaType: 'net.nanopay.integration.ResultResponse',
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
        }
      ],
      javaCode:
`Logger logger = (Logger) x.get("logger");

//If the request failed
if ( ! query.getResult() ) {
  return new ResultResponse(false, "No invoices retrieved");
}

try {
  DAO notification = ((DAO) x.get("notificationDAO")).inX(x);
  DAO invoiceDAO   = ((DAO) x.get("invoiceDAO")).inX(x);
  DAO contactDAO   = ((DAO) x.get("contactDAO")).inX(x);
  DAO currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);

  //Parses the query and loads relevant data into model
  JSONParser                parser      = new JSONParser();
  QuickQueryInvoiceResponse quick       = (QuickQueryInvoiceResponse) parser.parseString(query.getReason(), QuickQueryInvoiceResponse.getOwnClassInfo().getObjClass());
  QuickQueryInvoices        invoiceList = quick.getQueryResponse();
  QuickQueryInvoice[]       invoices    = invoiceList.getInvoice();
  for ( QuickQueryInvoice invoice: invoices ) {

    // Searches for a previously existing invoice
    QuickInvoice portal = (QuickInvoice) invoiceDAO.find(
      AND(
        EQ(
          QuickInvoice.QUICK_ID,
          invoice.getId()
        ),
        EQ(
          QuickInvoice.CREATED_BY,
          user.getId()
        )
      )
    );

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

      // Only update invoices that are unpaid or drafts.
      if (
        net.nanopay.invoice.model.InvoiceStatus.UNPAID != portal.getStatus() &&
        net.nanopay.invoice.model.InvoiceStatus.DRAFT != portal.getStatus()
      ) {
        // Skip processing this invoice.
        continue;
      }

    } else {
      // Checks if the invoice was paid
      if ( invoice.getBalance() == 0 ) {
        continue;
      }

      // Create an invoice
      portal = new QuickInvoice();
    }

    // Searches for a previous existing Contact
    QuickContact contact = (QuickContact) contactDAO.find(
      AND(
        EQ(
          QuickContact.QUICK_ID,
          invoice.getCustomerRef().getValue()
        ),
        EQ(
          QuickContact.OWNER,
          user.getId()
        )
      )
    );

    // If the Contact doesn't exist send a notification as to why the invoice wasn't imported
    if ( contact == null ) {
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      String str = "Quick Invoice # " +
        invoice.getId() +
        " can not be sync'd because Quick Contact # " +
        invoice.getCustomerRef().getValue() +
        " is not in this system";
      notify.setBody(str);
      notification.put(notify);
      continue;
    }

    // TODO change to accept all currencys
    // Only allows CAD and USD
    if ( ! ("CAD".equals(invoice.getCurrencyRef().getValue()) || "USD".equals(invoice.getCurrencyRef().getValue())) ) {
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
    portal.setPayeeId(user.getId());
    portal.setContactId(contact.getId());
    portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
    portal.setDraft(true);

    // Checks if the invoice was paid on
    if ( invoice.getBalance() == 0 ) {
      portal.setStatus(net.nanopay.invoice.model.InvoiceStatus.VOID);
      portal.setDraft(false);
      portal.setPaymentMethod(net.nanopay.invoice.model.PaymentStatus.VOID);
    } else {
      Currency currency = (Currency) currencyDAO.find(invoice.getCurrencyRef().getValue());
      portal.setAmount(new BigDecimal(invoice.getBalance()).movePointRight(currency.getPrecision()).longValue());
    }
    portal.setInvoiceNumber(invoice.getDocNumber());
    portal.setQuickId(invoice.getId());
    portal.setDestinationCurrency(invoice.getCurrencyRef().getValue());
    portal.setIssueDate(getDate(invoice.getTxnDate()));
    portal.setDueDate(getDate(invoice.getDueDate()));
    portal.setDesync(false);
    portal.setCreatedBy(user.getId());

    // Get attachments
    foam.nanos.fs.File[] files = getAttachments(x, "invoice", invoice.getId());
    if ( files != null && files.length != 0 ) {
      portal.setInvoiceFile(files);
    }

    invoiceDAO.put(portal);
  }
  return new ResultResponse(true, "Invoices were synchronised");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "Error has occurred: "+ e);
}`,
    },
    {
      name: 'importContacts',
      documentation: `Retrieves the query and parses to Query models for Customers or Vendors, then pulls relative data and applys to portal model`,
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
`Logger         logger         = (Logger) x.get("logger");
DAO            contactDAO     = ((DAO) x.get("contactDAO")).inX(x);
DAO            notification   = ((DAO) x.get("notificationDAO")).inX(x);
CountryService countryService = (CountryService) x.get("countryService");
RegionService  regionService  = (RegionService) x.get("regionService");

try {
  for ( QuickQueryContact customer : contacts ) {
    QuickQueryEMail email  = customer.getPrimaryEmailAddr();

    // Checks if there is a pre-existing contact
    QuickContact portal = (QuickContact) contactDAO.find(
      AND(
        EQ(
          QuickContact.QUICK_ID,
          customer.getId()
        ),
        EQ(
          QuickContact.OWNER,
          user.getId()
        )
      )
    );
    if ( portal == null ) {

      // Checks if the required data to become a contact is present in the contact data from Quickbooks.
      // If not sends a notification informing user of missing data
      if ( email == null || SafetyUtil.isEmpty(customer.getGivenName()) || SafetyUtil.isEmpty(customer.getFamilyName()) || SafetyUtil.isEmpty(customer.getCompanyName()) ) {
        Notification notify = new Notification();
        notify.setUserId(user.getId());
        String str = "Quick Contact # " +
          customer.getId() +
          " can not be added because the contact is missing: " +
          (email == null ? "[Email]" : "") +
          (SafetyUtil.isEmpty(customer.getGivenName()) ? " [Given Name] " : "") +
          (SafetyUtil.isEmpty(customer.getCompanyName()) ? " [Company Name] " : "") +
          (SafetyUtil.isEmpty(customer.getFamilyName()) ? " [Family Name] " : "");
        notify.setBody(str);
        notification.put(notify);
        continue;
      }

      // Creates a contact
      portal = new QuickContact();
    } else {
      portal = (QuickContact) portal.fclone();
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
      .setVerified( ! busPhoneNumber.equals("") )
      .build();

    Phone mobilePhone = new Phone.Builder(x)
      .setNumber( mobilePhoneNumber )
      .setVerified( ! mobilePhoneNumber.equals("") )
      .build();

    // Look up to see if there is an associated business for the contact
    DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
    Business business = (Business) localBusinessDAO.find(
      EQ(
        User.EMAIL,
        email.getAddress()
      )
    );
    if ( business != null ) {
      portal.setBusinessId(business.getId());
    }

    portal.setQuickId(customer.getId());
    portal.setEmail(email.getAddress());
    portal.setOrganization(customer.getCompanyName());
    portal.setFirstName(customer.getGivenName());
    portal.setLastName(customer.getFamilyName());
    portal.setOwner(user.getId());
    portal.setBusinessPhone(businessPhone);
    portal.setMobile(mobilePhone);
    portal.setGroup("sme");
    contactDAO.put(portal);
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
      javaReturns: 'net.nanopay.integration.ResultResponse',
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
  return new net.nanopay.integration.ResultResponse(true, rd.readLine());
} catch ( Throwable e ) {
  logger.error(e);
  e.printStackTrace();
  return new net.nanopay.integration.ResultResponse(false, e.getMessage() + " ");
}`,
    },
    {
      name: 'getDate',
      documentation: `Converts the data string`,
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
} catch ( Throwable e ) {
  return null;
}`,
    },
    {
      name: 'getAttachments',
      documentation: `Gets attachments for the invoices`,
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
      ],
      javaCode:
`DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
DAO               userDAO      = ((DAO) x.get("localUserDAO")).inX(x);
User              user         = (User) x.get("user");
DAO               currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);
QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
Group             group        = user.findGroup(x);
AppConfig         app          = group.getAppConfig(x);
DAO               configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
QuickConfig       config       = (QuickConfig)configDAO.find(app.getUrl());
Logger            logger       = (Logger) x.get("logger");
HttpClient        httpclient   = HttpClients.createDefault();
Outputter         outputter    = new Outputter(foam.lib.json.OutputterMode.NETWORK);
QuickContact      sUser;
BankAccount       account;
HttpPost          httpPost;
outputter.setOutputClassNames(false);

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

    customer.setName(sUser.getBusinessName());
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
`User              user         = (User) x.get("user");
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
`User                        user      = (User) x.get("user");
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
    }
  ]
});
