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
    'com.xero.api.XeroClient',
    'com.xero.model.*',
    'foam.blob.BlobService',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'net.nanopay.model.Business',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.Address',
    'net.nanopay.integration.AccountingBankAccount',
    'net.nanopay.integration.ResultResponse',
    'net.nanopay.integration.xero.model.XeroContact',
    'net.nanopay.integration.xero.model.XeroInvoice',
    'net.nanopay.tx.model.Transaction',
    'java.math.BigDecimal',
    'java.util.ArrayList',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List'
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
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
Logger           logger       = (Logger) x.get("logger");
try {

  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    return new ResultResponse(false, "User has not connected to Xero");
  }
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
  client_.getContacts();
  return new ResultResponse(true, "User is Signed in");
} catch (Throwable e) {
  e.printStackTrace();
  logger.error(e);
  return new ResultResponse(false, "User is not Signed in");
}
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
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
Logger           logger       = (Logger) x.get("logger");

try {

  // Check that user has accessed xero before
  if ( tokenStorage == null ) {
    return new ResultResponse(false, "User has not connected to Xero");
  }

  // Configures the client Object with the users token data
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

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
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
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
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
DAO              notification = (DAO) x.get("notificationDAO");
Logger           logger       = (Logger) x.get("logger");

// Check that user has accessed xero before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Xero");
}

// Configures the client Object with the users token data
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  List <com.xero.model.Contact> updatedContact = new ArrayList<>();
  DAO                           contactDAO     = (DAO) x.get("contactDAO");
                                contactDAO     = contactDAO.where(INSTANCE_OF(XeroContact.class));
  XeroContact                   xContact;
  Sink                          sink;

  // Go through each xero Contact and assess what should be done with it
  for ( com.xero.model.Contact xeroContact : client_.getContacts() ) {
    sink = new ArraySink();
    sink = contactDAO.where(
      EQ(
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
    }
    xContact = addContact(xContact, xeroContact);
    xContact.setOwner(user.getId());

    // TEST CODE
    Address address = new Address();
    address.setAddress1("eoo");
    address.setCity("totot");
    address.setPostalCode("h0h0h0");
    address.setStreetName("lalsal");
    address.setStreetNumber("11");
    DAO country = (DAO) x.get("countryDAO");
    address.setCountryId("CA");
    address.setRegionId("ON");
    Phone num = new Phone();
    num.setNumber("1234567890");
    num.setVerified(true);
    xContact.setPhone(num);
    xContact.setAddress(address);
    xContact.setBusinessPhone(num);
    xContact.setBusinessAddress(address);

    // Try to add the contact to portal
    try {
      contactDAO.put(xContact);
    } catch ( Throwable e ) {
      logger.warning(e);
      // If the contact is not accepted into portal send a notification informing user
      // why data was not accepted
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody(
        "Xero Contact: " + xeroContact.getName() +
        " cannot sync due to the following required fields being empty:" +
        (SafetyUtil.isEmpty(xContact.getEmail())?"[Email Address]":"")+
        (SafetyUtil.isEmpty(xContact.getFirstName())?"[First Name]":"")+
        (SafetyUtil.isEmpty(xContact.getLastName())?"[LastName]":"")+".");
      notification.put(notify);
    }
  }
  if ( ! updatedContact.isEmpty() ) {
    client_.updateContact(updatedContact);
  }
  return new ResultResponse(true, "All contacts have been synchronized");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
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
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
DAO              notification = (DAO) x.get("notificationDAO");
Logger           logger       = (Logger) x.get("logger");

// Check that user has accessed xero before
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Xero");
}

// Configures the client Object with the users token data
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  List <com.xero.model.Invoice> updatedInvoices = new ArrayList<>();
  XeroInvoice                   xInvoice;
  Sink                          sink;
  DAO                           invoiceDAO      = (DAO) x.get("invoiceDAO");
                                invoiceDAO      = invoiceDAO.where(INSTANCE_OF(XeroInvoice.class));

  // Go through each xero Invoices and assess what should be done with it
  for (com.xero.model.Invoice xeroInvoice : client_.getInvoices()) {
    if ( InvoiceStatus.PAID == xeroInvoice.getStatus()
          || InvoiceStatus.VOIDED == xeroInvoice.getStatus() ) {
          continue;
    }
    sink = new ArraySink();
    sink = invoiceDAO.where(
      EQ(
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
        ResultResponse isSync = resyncInvoice(x, xInvoice, xeroInvoice);
        if(isSync.getResult()) {
          xInvoice.setDesync(false);
          invoiceDAO.put(xInvoice);
          continue;
        }
        throw new Throwable(isSync.getReason());
      }
    }
    //TODO: Remove this when we accept other currencies
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ){
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody("Xero Invoice # " +
        xeroInvoice.getInvoiceNumber()+
        " cannot sync due to portal only accepting CAD and USD");
      notification.put(notify);
      continue;
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
  return new ResultResponse(true, "All invoices have been synchronized");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
  if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
    return new ResultResponse(false, "An error has occured please sync again");
  }
  return new ResultResponse(false, e.getMessage());
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
nano.setEmail(SafetyUtil.isEmpty(xero.getEmailAddress()) ? "" : xero.getEmailAddress());
nano.setOrganization(xero.getName());
nano.setBusinessName(xero.getName());
nano.setFirstName(SafetyUtil.isEmpty(xero.getFirstName()) ? "" : xero.getFirstName());
nano.setLastName(SafetyUtil.isEmpty(xero.getLastName()) ? "" : xero.getLastName());
nano.setXeroUpdate(true);
return nano;`
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
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
User             user         = (User) x.get("user");
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
Group            group        = user.findGroup(x);
AppConfig        app          = group.getAppConfig(x);
DAO              configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig       config       = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_      = new XeroClient(config);
BlobService      blobStore    = (BlobService) x.get("blobStore");
Logger           logger       = (Logger) x.get("logger");

client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

XeroContact contact;
boolean     validContact = true;
Sink        sink         = new ArraySink();
DAO         fileDAO      = (DAO) x.get("fileDAO");
DAO         contactDAO   = (DAO) x.get("localContactDAO");
            contactDAO   = contactDAO.where(
              AND(
                INSTANCE_OF(XeroContact.class),
                EQ(
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

  // TEST CODE
  Address address = new Address();
  address.setAddress1("eoo");
  address.setCity("totot");
  address.setPostalCode("h0h0h0");
  address.setStreetName("lalsal");
  address.setStreetNumber("11");
  address.setCountryId("CA");
  address.setRegionId("ON");
  Phone num = new Phone();
  num.setNumber("1234567890");
  num.setVerified(true);
  contact.setPhone(num);
  contact.setBusinessPhone(num);
  contact.setAddress(address);
  contact.setBusinessAddress(address);
  DAO userDAO = (DAO) x.get("localUserDAO");
  Business business =(Business) userDAO.find(
    AND(
      EQ(
        User.EMAIL,
        contact.getEmail()
      ),
      INSTANCE_OF(Business.getOwnClassInfo())
    )
  );
  if (business != null)
  {
    contact.setBusinessId(business.getId());
  }
  try {
    contactDAO.put(contact);
  } catch (Throwable e) {
    logger.error(e);
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
//TODO: Change when the currency is not CAD and USD
nano.setDestinationCurrency(xero.getCurrencyCode().value());
nano.setIssueDate(xero.getDate().getTime());
nano.setDueDate(xero.getDueDate().getTime());
nano.setAmount((xero.getAmountDue().movePointRight(2)).longValue());
nano.setDesync(false);
nano.setXeroUpdate(true);

// get invoice attachments
if ( ! xero.isHasAttachments() ) {
  return nano;
}

// try to get attachments
List<Attachment> attachments;
try {
  attachments = client_.getAttachments("Invoices", xero.getInvoiceID());
} catch ( Throwable ignored ) {
  return nano;
}

// return invoice if attachments is null or size is 0
if ( attachments == null || attachments.size() == 0 ) {
  return nano;
}

// iterate through all attachments
File[] files = new File[attachments.size()];
for ( int i = 0 ; i < attachments.size() ; i++ ) {
  try {
    Attachment attachment = attachments.get(i);
    long filesize = attachment.getContentLength().longValue();

    // get attachment content and create blob
    java.io.ByteArrayInputStream bais = client_.getAttachmentContent("Invoices",
      xero.getInvoiceID(), attachment.getFileName(), null);
    foam.blob.Blob data = blobStore.put_(x, new foam.blob.InputStreamBlob(bais, filesize));

    // create file
    files[i] = new File.Builder(x)
      .setId(attachment.getAttachmentID())
      .setOwner(user.getId())
      .setMimeType(attachment.getMimeType())
      .setFilename(attachment.getFileName())
      .setFilesize(filesize)
      .setData(data)
      .build();
    fileDAO.inX(x).put(files[i]);
  } catch ( Throwable ignored ) { }
}

// set files on nano invoice
nano.setInvoiceFile(files);
return nano;`
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
DAO              store          = (DAO) x.get("xeroTokenStorageDAO");
DAO              transactionDAO = (DAO) x.get("localTransactionDAO");
DAO              accountDAO     = (DAO) x.get("accountDAO");
User             user           = (User) x.get("user");
XeroTokenStorage tokenStorage   = (XeroTokenStorage) store.find(user.getId());
Group            group          = user.findGroup(x);
AppConfig        app            = group.getAppConfig(x);
DAO              configDAO      = (DAO) x.get("xeroConfigDAO");
XeroConfig       config         = (XeroConfig)configDAO.find(app.getUrl());
XeroClient       client_        = new XeroClient(config);
Logger           logger         = (Logger) x.get("logger");
Sink             sink           = new ArraySink();
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
String currency;
if (user.getId() == transaction.getPayeeId()) {
  currency = transaction.getDestinationCurrency();
} else {
  currency = transaction.getSourceCurrency();
}
net.nanopay.account.Account account = accountDAO.find(
  AND(
    INSTANCE_OF(BankAccount.getOwnClassInfo()),
    EQ(net.nanopay.account.Account.OWNER,
       user.getId()),
    EQ(net.nanopay.account.Account.DENOMINATION,
      currency)
  )
);

net.nanopay.bank.BankAccount bankAccount = (net.nanopay.bank.BankAccount) account;
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
try {
  //TODO: Add logic to send data to xero
  com.xero.model.Account           xeroAccount = client_.getAccount(bankAccount.getIntegrationId());
  List<com.xero.model.Invoice>     xeroInvoiceList = new ArrayList<>();
  if ( ! (InvoiceStatus.AUTHORISED == xero.getStatus()) ) {
    xero.setStatus(InvoiceStatus.AUTHORISED);
    xeroInvoiceList.add(xero);
    client_.updateInvoice(xeroInvoiceList);
  }

  // Creates a payment for the full amount for the invoice and sets it paid to the dummy account on xero
  Payment payment = new Payment();
  payment.setInvoice(xero);
  payment.setAccount(xeroAccount);
  Calendar cal = Calendar.getInstance();
  cal.setTime(new Date());
  payment.setDate(cal);
  //TODO: Change when the currency is not CAD and USD
  payment.setAmount(BigDecimal.valueOf(transaction.getAmount()).movePointLeft(2));
  List<Payment> paymentList = new ArrayList<>();
  paymentList.add(payment);
  client_.createPayments(paymentList);
  return new ResultResponse(true, " ");
} catch ( Throwable e ) {
  e.printStackTrace();
  logger.error(e);
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
DAO              store        = (DAO) x.get("xeroTokenStorageDAO");
DAO              userDAO      = (DAO) x.get("localUserDAO");

User nUser = (User) userDAO.find(user.getId());
nUser = (User) nUser.fclone();
nUser.setIntegrationCode(0);
userDAO.put(nUser);
XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
if ( tokenStorage == null ) {
  return new ResultResponse(false, "User has not connected to Xero");
}
tokenStorage.setToken(" ");
tokenStorage.setTokenSecret(" ");
tokenStorage.setTokenTimestamp("0");
store.put(tokenStorage);
return new ResultResponse(true, "User has been Signed out of Xero");
`
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

DAO                         store        = (DAO) x.get("xeroTokenStorageDAO");
DAO                         notification = (DAO) x.get("notificationDAO");
Group                       group        = user.findGroup(x);
AppConfig                   app          = group.getAppConfig(x);
DAO                         configDAO    = (DAO) x.get("xeroConfigDAO");
XeroConfig                  config       = (XeroConfig)configDAO.find(app.getUrl());
List<AccountingBankAccount> banks        = new ArrayList<>();
Logger                      logger       = (Logger) x.get("logger");
XeroTokenStorage            tokenStorage = (XeroTokenStorage) store.find(user.getId());
XeroClient                  client_      = new XeroClient(config);

try {
// Check that user has accessed xero before
if ( tokenStorage == null ) {
  throw new Throwable("User is not sync'd to xero");
}

// Configures the client Object with the users token data
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
List<com.xero.model.Account> updatedAccount = new ArrayList<>();

  for ( com.xero.model.Account xeroAccount :  client_.getAccounts() ) {
    AccountingBankAccount xBank = new AccountingBankAccount();
    if ( com.xero.model.AccountType.BANK != xeroAccount.getType() ) {
      continue;
    }
    xBank.setAccountingName("XERO");
    xBank.setAccountingId(xeroAccount.getAccountID());
    xBank.setName(xeroAccount.getName());
    banks.add(xBank);
  }
  return banks;

} catch ( Throwable e){
  e.printStackTrace();
  logger.error(e);
  return banks;
}
`
   }
 ]
});
