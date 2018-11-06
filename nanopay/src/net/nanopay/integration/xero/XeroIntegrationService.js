/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'XeroIntegrationService',
  documentation: 'Xero Integration functions to synchronizing with xero and verifying if signed in',
  implements: [
    'net.nanopay.integration.IntegrationService'
  ],

  javaImports: [
    'com.xero.api.XeroApiException',
    'com.xero.api.XeroClient',
    'com.xero.model.Account',
    'com.xero.model.AccountType',
    'com.xero.model.InvoiceStatus',
    'com.xero.model.InvoiceType',
    'com.xero.model.Payment',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'java.math.BigDecimal',
    'java.util.*',
    'net.nanopay.integration.xero.model.XeroContact',
    'net.nanopay.integration.xero.model.XeroInvoice',
    'net.nanopay.integration.ResultResponse',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  methods: [
    {
      name: 'isSignedIn',
      javaCode:
`/*
Info:   Function to check if user is Signed into Xero
Input:  x: the context to use DAOs
        user: The current user
Output: True:  if no exception is thrown when trying to get
               the contacts from xero
        False: if an exception is thrown signaling that the
               user was not signed in
*/
try {
  DAO          store        = (DAO) x.get("tokenStorageDAO");
  TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
  Group        group        = user.findGroup(x);
  AppConfig    app          = group.getAppConfig(x);
  DAO          configDAO    = (DAO) x.get("xeroConfigDAO");
  XeroConfig   config       = (XeroConfig)configDAO.find(app.getUrl());

  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    return new ResultResponse(false,"User has not connected to Xero");
  }
  XeroClient client_ = new XeroClient(config);
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
  client_.getContacts();
  return new ResultResponse(true,"User is Signed in");
} catch (Exception e) {
  e.printStackTrace();
}
return new ResultResponse(false,"User is not Signed in");
`
    },
    {
      name: 'syncSys',
      javaCode:
` /*
Info:   Function to synchronize all xero information to portal
Input:  x: the context to use DAOs
        user: The currenct user
Output: True:  if all points synchronize to portal
        False: if any point does not synchronize to portal
*/
DAO          store        = (DAO) x.get("tokenStorageDAO");
TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
Group        group        = user.findGroup(x);
AppConfig    app          = group.getAppConfig(x);
DAO          configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig   config       = (XeroConfig)configDAO.find(app.getUrl());
try {

  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    return new ResultResponse(false,"User has not connected to Xero");
  }

  // Configures the client Object with the users token data
  XeroClient client_ = new XeroClient(config);
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

  // Checks whether user has accounts to process payments onto the xero platform
  List<com.xero.model.Account> updatedAccount     = new ArrayList<>();
  Boolean                      hasSalesAccount    = false;
  Boolean                      hasExpensesAccount = false;
  for ( com.xero.model.Account xeroAccount : client_.getAccounts() ) {
    if ( "000".equals(xeroAccount.getCode()) ) {
      hasSalesAccount = true;
    }
    if ( "001".equals(xeroAccount.getCode()) ) {
      hasExpensesAccount = true;
    }
  }

  // Create an account object for the sales if one is not already created
  if ( ! hasSalesAccount ) {
    Account salesAccount = new Account();
    salesAccount.setEnablePaymentsToAccount(true);
    salesAccount.setType(AccountType.SALES);
    salesAccount.setCode("000");
    salesAccount.setName(user.getSpid().toString() + " Sales");
    salesAccount.setTaxType("NONE");
    salesAccount.setDescription(
      "Sales account for invoices paid using the " +
      user.getSpid().toString() + " System");
    updatedAccount.add(salesAccount);
  }

  // Create an account object for the expenses if one is not already created
  if ( ! hasExpensesAccount ) {
    Account expensesAccount = new Account();
    expensesAccount.setEnablePaymentsToAccount(true);
    expensesAccount.setType(AccountType.EXPENSE);
    expensesAccount.setCode("001");
    expensesAccount.setName(user.getSpid().toString() + " Expenses");
    expensesAccount.setTaxType("NONE");
    expensesAccount.setDescription(
      "Expenses account for invoices paid using the " +
      user.getSpid().toString() + " System");
    updatedAccount.add(expensesAccount);
  }
  if ( ! updatedAccount.isEmpty() ) {
    client_.createAccounts(updatedAccount);
  }

  // Attempts to sync contacts and invoices
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
} catch ( XeroApiException e ) {
  e.printStackTrace();
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
} catch ( Exception e1 ) {
  e1.printStackTrace();
  return new ResultResponse(false, e1.getMessage());
}`
    },
    {
      name: 'contactSync',
      javaCode:
`/*
Info:   Function to synchronize Contact data between the systems
Input:  x: the context to use DAOs
        user: The currenct user
Output: True:  if contacts were successfully synchronized
        False: if contacts were not successfully synchronize
*/
DAO          store        = (DAO) x.get("tokenStorageDAO");
DAO          notification = (DAO) x.get("notificationDAO");
Group        group        = user.findGroup(x);
AppConfig    app          = group.getAppConfig(x);
DAO          configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig   config       = (XeroConfig)configDAO.find(app.getUrl());

// Check that user has accessed xero before
TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
if ( tokenStorage == null ) {
  return new ResultResponse(false,"User has not connected to Xero");
}

// Configures the client Object with the users token data
XeroClient client_ = new XeroClient(config);
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  List <com.xero.model.Contact> updatedContact = new ArrayList<>();
  DAO                           contactDAO     = (DAO) x.get("contactDAO");
                                contactDAO     = contactDAO.where(MLang.INSTANCE_OF(XeroContact.class));
  XeroContact                   xContact;
  Sink                          sink;

  // Go through each xero Contact and assess what should be done with it
  for ( com.xero.model.Contact xeroContact : client_.getContacts() ) {
    sink = new ArraySink();
    sink = contactDAO.where(
      MLang.EQ(
        XeroContact.XERO_ID,
        xeroContact.getContactID()))
      .limit(1).select(sink);
    List list = ((ArraySink) sink).getArray();

    // Check if Contact already exists on the portal
    if ( list.size() == 0 ) {
      xContact = new XeroContact();
    } else {
      xContact = (XeroContact) list.get(0);
      xContact = (XeroContact) xContact.fclone();

      // If the portal Contact was updated while logged out from xero
      if ( xContact.getDesync() ) {
        xeroContact = resyncContact(xContact, xeroContact);
        xContact.setDesync(false);
        contactDAO.put(xContact);
        updatedContact.add(xeroContact);
        continue;
      }
    }
    xContact = addContact(xContact, xeroContact);
    xContact.setOwner(user.getId());

    // Try to add the contact to portal
    try {
      contactDAO.put(xContact);
    } catch ( Exception e ) {

      // If the contact is not accepted into portal send a notification informing user
      // why data was not accepted
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody(
        "Xero Contact: " + xeroContact.getName() +
        " cannot sync due to the following required fields being empty:" +
        ("".equals(xContact.getEmail())?"[Email Address]":"")+
        ("".equals(xContact.getFirstName())?"[First Name]":"")+
        ("".equals(xContact.getLastName())?"[LastName]":"")+".");
      notification.put(notify);
    }
  }
  if ( ! updatedContact.isEmpty() ) {
    client_.updateContact(updatedContact);
  }
  return new ResultResponse(true,"All contacts have been synchronized");
} catch ( XeroApiException e ) {
  e.printStackTrace();
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
} catch ( Exception e1 ) {
  e1.printStackTrace();
  return new ResultResponse(false, e1.getMessage());
}`
    },
    {
      name: 'invoiceSync',
      javaCode:
`/*
Info:   Function to synchronize Invoice data between the systems
Input:  x: the context to use DAOs
        user: The currenct user
Output: True:  if invoices were successfully synchronized
        False: if invoices were not successfully synchronize
*/
DAO          store        = (DAO) x.get("tokenStorageDAO");
DAO          notification = (DAO) x.get("notificationDAO");
Group        group        = user.findGroup(x);
AppConfig    app          = group.getAppConfig(x);
DAO          configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig   config       = (XeroConfig)configDAO.find(app.getUrl());

// Check that user has accessed xero before
TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
if ( tokenStorage == null ) {
  return new ResultResponse(false,"User has not connected to Xero");
}

// Configures the client Object with the users token data
XeroClient client_ = new XeroClient(config);
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  List <com.xero.model.Invoice> updatedInvoices = new ArrayList<>();
  XeroInvoice                   xInvoice;
  Sink                          sink;
  DAO                           invoiceDAO      = (DAO) x.get("invoiceDAO");
                                invoiceDAO      = invoiceDAO.where(MLang.INSTANCE_OF(XeroInvoice.class));

  // Go through each xero Invoices and assess what should be done with it
  for (com.xero.model.Invoice xeroInvoice : client_.getInvoices()) {
    if ( InvoiceStatus.PAID == xeroInvoice.getStatus()
          || InvoiceStatus.VOIDED == xeroInvoice.getStatus() ) {
          continue;
    }
    sink = new ArraySink();
    sink = invoiceDAO.where(
      MLang.EQ(
        XeroInvoice.XERO_ID,
        xeroInvoice.getInvoiceID()))
      .limit(1).select(sink);
    List list = ((ArraySink) sink).getArray();

    // Check if Invoice already exists on the portal
    if ( list.size() == 0 ) {
      xInvoice = new XeroInvoice();
    } else {
      xInvoice = (XeroInvoice) list.get(0);
      xInvoice = (XeroInvoice) xInvoice.fclone();
      if ( xInvoice.getDesync() ) {
        resyncInvoice(x, xInvoice, xeroInvoice);
        xInvoice.setDesync(false);
        invoiceDAO.put(xInvoice);
        continue;
      }
    }
    xInvoice = addInvoice(x, xInvoice, xeroInvoice);

    // If the invoice is not accepted into Nano portal send a notification informing user
    // why data was not accepted
    if ( xInvoice == null ) {
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody(
        "Xero Invoice # " +
        xeroInvoice.getInvoiceNumber() +
        " cannot sync due to an Invalid Contact: " +
        xeroInvoice.getContact().getName());
      notification.put(notify);
      continue;
    }
    invoiceDAO.put(xInvoice);
  }
  if ( ! updatedInvoices.isEmpty() ) {
    client_.updateInvoice(updatedInvoices);
  }
  return new ResultResponse(true,"All invoices have been synchronized");
} catch ( XeroApiException e ) {
  e.printStackTrace();
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
} catch ( Exception e1 ) {
  e1.printStackTrace();
  return new ResultResponse(false, e1.getMessage());
}`
    },
    {
      name: 'addContact',
      javaReturns: 'net.nanopay.integration.xero.model.XeroContact',
      args: [
        {
          name: 'nano',
          javaType: 'net.nanopay.integration.xero.model.XeroContact',
        },
        {
          name: 'xero',
          javaType: 'com.xero.model.Contact',
        }
      ],
      javaCode:
`/*
Info:   Function to fill in information from xero into Nano portal
Input:  nano: The object that will be filled in
        xero: The Xero object to be used
Output: Returns the Nano Object after being filled in from Xero portal
*/
nano.setXeroId(xero.getContactID());
nano.setEmail((xero.getEmailAddress() == null) ? "" : xero.getEmailAddress());
nano.setOrganization(xero.getName());
nano.setFirstName((xero.getFirstName() == null) ? "" : xero.getFirstName());
nano.setLastName((xero.getLastName() == null) ? "" : xero.getLastName());
nano.setXeroUpdate(true);
return nano;`
    },
    {
      name: 'resyncContact',
      javaReturns: 'com.xero.model.Contact',
      args: [
        {
          name: 'nano',
          javaType: 'net.nanopay.integration.xero.model.XeroContact',
        },
        {
          name: 'xero',
          javaType: 'com.xero.model.Contact',
        }
      ],
      javaCode:
`/*
Info:   Function to make Xero match Nano object. Occurs when Nano object is updated and user is not logged into Xero
Input:  nano: The currently updated object on the portal
        xero: The Xero object to be resynchronized
Output: Returns the Xero Object after being updated from nano portal
*/
xero.setContactID(nano.getXeroId());
xero.setName(nano.getOrganization());
xero.setEmailAddress(nano.getEmail());
xero.setFirstName(nano.getFirstName());
xero.setLastName(nano.getLastName());
return xero;`
    },
    {
      name: 'addInvoice',
      javaReturns: 'net.nanopay.integration.xero.model.XeroInvoice',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'nano',
          javaType: 'net.nanopay.integration.xero.model.XeroInvoice',
        },
        {
          name: 'xero',
          javaType: 'com.xero.model.Invoice',
        }
      ],
      javaCode:
`/*
Info:   Function to fill in information from xero into Nano portal
Input:     x: The context that allows access to services
        nano: The object that will be filled in
        xero: The Xero object to be used
Output: Returns the Nano Object after being filled in from Xero portal
*/
User        user         = (User) x.get("user");
XeroContact contact;
Boolean     validContact = true;
DAO         notification = (DAO) x.get("notificationDAO");
Sink        sink         = new ArraySink();
DAO         contactDAO   = (DAO) x.get("localContactDAO");
            contactDAO   = contactDAO.where(
              MLang.AND(
                MLang.INSTANCE_OF(XeroContact.class),
                MLang.EQ(
                  XeroContact.ORGANIZATION,
                  xero.getContact().getName())))
              .limit(1);
            contactDAO.select(sink);
List list = ((ArraySink) sink).getArray();

// Checks to verify that the contact exists in the Nano System before accepting the invoice in to the Nano system
if ( list.size() == 0 ) {

  // Attempts to add the contact to the system if possible
  contact = new XeroContact();
  contact = addContact(contact, xero.getContact());
  contact.setOwner(user.getId());
  try {
    contactDAO.put(contact);
  } catch (Exception e) {

    // If the contact is not accepted into Nano portal send a notification informing user why data was not accepted
    Notification notify = new Notification();
    notify.setBody(
      "Xero Contact #" +
      xero.getContact().getContactID() +
      "cannot sync due to the following required fields being empty:" +
      ("".equals(xero.getContact().getEmailAddress()) ? "[Email Address]" : "") +
      ("".equals(xero.getContact().getFirstName()) ? "[First Name]" : "") +
      ("".equals(xero.getContact().getLastName()) ? "[LastName]" : "") + ".");
    notification.put(notify);
    validContact = false;
  }
} else {
  contact = (XeroContact) list.get(0);
  contact = (XeroContact) contact.fclone();
}
if ( ! validContact ) {
  return null;
}
if ( xero.getType() == InvoiceType.ACCREC ) {
  nano.setPayerId(contact.getId());
  nano.setPayeeId(user.getId());
  nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
  nano.setDraft(true);
  nano.setInvoiceNumber(xero.getInvoiceNumber());
} else {
  nano.setPayerId(user.getId());
  nano.setPayeeId(contact.getId());
  nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.UNPAID);
}
nano.setXeroId(xero.getInvoiceID());
nano.setDestinationCurrency(xero.getCurrencyCode().value());
nano.setIssueDate(xero.getDate().getTime());
nano.setDueDate(xero.getDueDate().getTime());
nano.setAmount((xero.getAmountDue().movePointRight(2)).longValue());
nano.setDesync(false);
nano.setXeroUpdate(true);
return nano;`
    },
    {
      name: 'resyncInvoice',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'nano',
          javaType: 'net.nanopay.integration.xero.model.XeroInvoice',
        },
        {
          name: 'xero',
          javaType: 'com.xero.model.Invoice',
        }
      ],
      javaCode:
`/*
Info:   Function to make Xero match Nano object. Occurs when Nano object is updated and user is not logged into Xero
Input:  nano: The currently updated object on the portal
        xero: The Xero object to be resynchronized
Output: Returns the Xero Object after being updated from nano portal
*/
User                user         = (User) x.get("user");
Group               group        = user.findGroup(x);
AppConfig           app          = group.getAppConfig(x);
DAO                 configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig          config       = (XeroConfig)configDAO.find(app.getUrl());

XeroClient client_ = new XeroClient(config);
try {
  List<Account> xeroAccountsList = client_.getAccounts();
  int j;
  Boolean      isPayer      = true;

  // Determine if current user is the Payer
  if ( InvoiceType.ACCREC == xero.getType() ) {
    isPayer = false;
  }

  // Finds the account to be used to show a payment made in the system
  for ( j = 0; j < xeroAccountsList.size(); j++ ) {
    com.xero.model.Account xeroAccount = xeroAccountsList.get(j);

    // If the account doesn't have a code
    if (xeroAccount.getCode() == null){
      continue;
    }

    //Accounts Receivable Code
    if ( "000".equals(xeroAccount.getCode()) && isPayer == false ) {
      break;
    }

    //Accounts Payable Code
    if ( "001".equals(xeroAccount.getCode()) && isPayer == true ) {
      break;
    }
  }
  com.xero.model.Invoice xeroInvoice = xero;
  com.xero.model.Account xeroAccount = xeroAccountsList.get(j);
  List<com.xero.model.Invoice> xeroInvoiceList  = new ArrayList<>();

  // Checks to see if the xero invoice was set to Authorized before; if not sets it to authorized
  if ( ! (InvoiceStatus.AUTHORISED == xeroInvoice.getStatus()) ) {
    xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
    xeroInvoiceList.add( xeroInvoice );
    client_.updateInvoice(xeroInvoiceList);
  }

  // Creates a payment for the full amount for the invoice and sets it paid to the dummy account on xero
  Payment payment = new Payment();
  payment.setInvoice(xeroInvoice);
  payment.setAccount(xeroAccount);
  Calendar cal = Calendar.getInstance();
  cal.setTime(new Date());
  payment.setDate(cal);
  payment.setAmount(BigDecimal.valueOf(nano.getAmount()).movePointLeft(2));
  List<Payment> paymentList = new ArrayList<>();
  paymentList.add(payment);
  client_.createPayments(paymentList);
} catch ( XeroApiException e ) {
  e.printStackTrace();

} catch ( Exception e ) {
  e.printStackTrace();
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
DAO          store        = (DAO) x.get("tokenStorageDAO");
TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
if ( tokenStorage == null ) {
  return new ResultResponse(false,"User has not connected to Xero");
}
tokenStorage.setToken(" ");
tokenStorage.setTokenSecret(" ");
tokenStorage.setTokenTimestamp("0");
store.put(tokenStorage);
return new ResultResponse(true,"User has been Signed out of Xero");
`
    },

]
});
