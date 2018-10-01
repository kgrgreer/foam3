/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'XeroIntegrationService',
  documentation: 'Implementation of Token Service used for verifying email addresses',
  implements: [
    'net.nanopay.integration.xero.IntegrationService'
  ],

  javaImports: [
    'com.xero.model.Account',
    'com.xero.model.AccountType',
    'com.xero.model.InvoiceStatus',
    'com.xero.model.InvoiceType',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'com.xero.api.XeroClient',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.integration.xero.model.XeroContact',
    'net.nanopay.integration.xero.model.XeroInvoice',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'java.math.BigDecimal',
    'java.util.*'
  ],

  methods: [
    {
      name: 'isSignedIn',
      javaCode:
`try {
  DAO store = (DAO) x.get("tokenStorageDAO");
  TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
  if (tokenStorage == null) return false;
  XeroConfig config = new XeroConfig();
  XeroClient client_ = new XeroClient(config);
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
  client_.getContacts();
  return true;
} catch (Exception e) {
  e.printStackTrace();
}
return false;`
    },
    {
      name: 'syncSys',
      javaCode:
`DAO store = (DAO) x.get("tokenStorageDAO");
DAO notification = (DAO) x.get("notificationDAO");

TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
if (tokenStorage == null) return false;
try {
  XeroConfig config = new XeroConfig();

  // Retrieve only Invoices and Contacts created by Xero
  XeroClient client_ = new XeroClient(config);

  if (tokenStorage == null) return false;
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

  List<com.xero.model.Account> updatedAccount = new ArrayList<Account>();

  Account salesAccount = new Account();
  salesAccount.setEnablePaymentsToAccount(true);
  salesAccount.setType(AccountType.SALES);
  salesAccount.setCode("000");
  salesAccount.setName(user.getSpid().toString() + " Sales");
  salesAccount.setTaxType("NONE");
  salesAccount.setDescription("Sales account for invoices paid using the " + user.getSpid().toString() + " System");

  Account expensesAccount = new Account();
  expensesAccount.setEnablePaymentsToAccount(true);
  expensesAccount.setType(AccountType.EXPENSE);
  expensesAccount.setCode("001");
  expensesAccount.setName(user.getSpid().toString() + " Expenses");
  expensesAccount.setTaxType("NONE");
  expensesAccount.setDescription("Expenses account for invoices paid using the " + user.getSpid().toString() + " System");

  Boolean hasSalesAccount = false;
  Boolean hasExpensesAccount = false;

  for (com.xero.model.Account xeroAccount : client_.getAccounts()) {
    if (xeroAccount.getCode().equals("000")) {
      hasSalesAccount = true;
    }
    if (xeroAccount.getCode().equals("001")) {
      hasExpensesAccount = true;
    }
  }
  if (!hasSalesAccount) {
    updatedAccount.add(salesAccount);
  }
  if (!hasExpensesAccount) {
    updatedAccount.add(expensesAccount);
  }
  if (!updatedAccount.isEmpty()) {
    client_.createAccounts(updatedAccount);
  }

  if (contactSync(x, user) && invoiceSync(x, user))
    return true;
  else {
    return false;
  }
} catch (Exception e) {
  e.printStackTrace();
  return false;
}`
    },
    {
      name: 'contactSync',
      javaCode:
`DAO store = (DAO) x.get("tokenStorageDAO");
DAO notification = (DAO) x.get("notificationDAO");
TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
if (tokenStorage == null) return false;
XeroContact xContact;
Sink sink;
XeroConfig config = new XeroConfig();
XeroClient client_ = new XeroClient(config);
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
DAO contactDAO = (DAO) x.get("contactDAO");
try {
  contactDAO = contactDAO.where(MLang.INSTANCE_OF(XeroContact.class));
  List<com.xero.model.Contact> updatedContact = new ArrayList<com.xero.model.Contact>();
  for (com.xero.model.Contact xeroContact : client_.getContacts()) {
    sink = new ArraySink();
    sink = contactDAO.where(MLang.EQ(XeroContact.XERO_ID, xeroContact.getContactID()))
      .limit(1).select(sink);
    List list = ((ArraySink) sink).getArray();

    if (list.size() == 0) {
      xContact = new XeroContact();
    } else {
      xContact = (XeroContact) list.get(0);
      xContact = (XeroContact) xContact.fclone();

      if (xContact.getDesync()) {
        xeroContact = resyncContact(xContact, xeroContact);
        xContact.setDesync(false);
        contactDAO.put(xContact);
        updatedContact.add(xeroContact);
        continue;
      }
    }

    xContact = addContact(xContact, xeroContact);
    try {
      contactDAO.put(xContact);
    } catch (Exception e) {

      // If the contact is not accepted into Nano portal send a notification informing user why data was not accepted
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody("Xero Contact: " + xeroContact.getName() + " cannot sync due to the following required fields being empty:" + ((xContact.getEmail().isEmpty()) ? "[Email Address]" : "") + ((xContact.getFirstName().isEmpty()) ? "[First Name]" : "") + ((xContact.getLastName().isEmpty()) ? "[LastName]" : "") + ".");
      notification.put(notify);
    }
  }
  if (!updatedContact.isEmpty()) client_.updateContact(updatedContact);
  return true;
} catch (Exception e) {
  e.printStackTrace();
  return false;
}`
    },
    {
      name: 'invoiceSync',
      javaCode:
`DAO store = (DAO) x.get("tokenStorageDAO");
DAO notification = (DAO) x.get("notificationDAO");
TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
if (tokenStorage == null) return false;
DAO invoiceDAO = (DAO) x.get("invoiceDAO");
Sink sink;
XeroInvoice xInvoice;

XeroConfig config = new XeroConfig();
XeroClient client_ = new XeroClient(config);
client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

try {
  invoiceDAO = invoiceDAO.where(MLang.INSTANCE_OF(XeroInvoice.class));
  List<com.xero.model.Invoice> updatedInvoices = new ArrayList<>();
  for (com.xero.model.Invoice xeroInvoice : client_.getInvoices()) {
    if (xeroInvoice.getStatus().value().toLowerCase().equals(InvoiceStatus.PAID.value().toLowerCase())) {
      continue;
    }
    sink = new ArraySink();
    sink = invoiceDAO.where(MLang.EQ(Invoice.INVOICE_NUMBER, xeroInvoice.getInvoiceID()))
      .limit(1).select(sink);
    List list = ((ArraySink) sink).getArray();
    if (list.size() == 0) {
      xInvoice = new XeroInvoice();
    } else {
      xInvoice = (XeroInvoice) list.get(0);
      xInvoice = (XeroInvoice) xInvoice.fclone();
      if (xInvoice.getDesync()) {
        xeroInvoice = resyncInvoice(xInvoice, xeroInvoice);
        xInvoice.setDesync(false);
        invoiceDAO.put(xInvoice);
        updatedInvoices.add(xeroInvoice);
        continue;
      }
    }
    xInvoice = addInvoice(x, xInvoice, xeroInvoice);
    if (xInvoice == null) {
      // If the invoice is not accepted into Nano portal send a notification informing user why data was not accepted
      Notification notify = new Notification();
      notify.setUserId(user.getId());
      notify.setBody("Xero Invoice # " + xeroInvoice.getInvoiceID() + " cannot sync due to an Invalid Contact: " + xeroInvoice.getContact().getName());
      notification.put(notify);
      continue;
    }
    invoiceDAO.put(xInvoice);
  }
  if (!updatedInvoices.isEmpty()) client_.updateInvoice(updatedInvoices);

  return true;
} catch (Exception e) {
  e.printStackTrace();
  return false;
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
`nano.setXeroId(xero.getContactID());
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
User user = (User) x.get("user");
XeroContact contact;
Boolean validContact = true;
DAO notification = (DAO) x.get("notificationDAO");
Sink sink = new ArraySink();
DAO contactDAO = (DAO) x.get("localContactDAO");
contactDAO = contactDAO.where(MLang.INSTANCE_OF(XeroContact.class));
contactDAO.where(MLang.EQ(XeroContact.ORGANIZATION, xero.getContact().getName()))
  .limit(1).select(sink);
List list = ((ArraySink) sink).getArray();

// Checks to verify that the contact exists in the Nano System before accepting the invoice in to the Nano system
if (list.size() == 0) {

  // Attempts to add the contact to the system if possible
  contact = new XeroContact();
  contact = addContact(contact, xero.getContact());
  try {
    contactDAO.put(contact);
  } catch (Exception e) {

    // If the contact is not accepted into Nano portal send a notification informing user why data was not accepted
    Notification notify = new Notification();
    notify.setBody("Xero Contact #" + xero.getContact().getContactID() + "cannot sync due to the following required fields being empty:" + ((xero.getContact().getEmailAddress().equals(" ")) ? "[Email Address]" : "") + ((xero.getContact().getFirstName().equals(" ")) ? "[First Name]" : "") + ((xero.getContact().getLastName().equals(" ")) ? "[LastName]" : "") + ".");
    notification.put(notify);
    validContact = false;
  }
} else {
  contact = (XeroContact) list.get(0);
  contact = (XeroContact) contact.fclone();
}
if (!validContact) {
  return null;
}
if (xero.getType().equals(InvoiceType.ACCREC)) {
  nano.setPayerId(contact.getId());
  nano.setPayeeId(user.getId());
} else {
  nano.setPayerId(user.getId());

  nano.setPayeeId(contact.getId());
}
nano.setInvoiceNumber(xero.getInvoiceID());
nano.setDestinationCurrency(xero.getCurrencyCode().value());
nano.setIssueDate(xero.getDate().getTime());
nano.setDueDate(xero.getDueDate().getTime());
nano.setAmount((xero.getTotal().longValue()) * 100);
switch (xero.getStatus().toString()) {
  case "DRAFT": {
    nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.DRAFT);
    break;
  }
  case "VOIDED": {
    nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.VOID);
    break;
  }
  case "PAID": {
    nano.setPaymentMethod(PaymentStatus.NANOPAY);
    nano.setStatus(net.nanopay.invoice.model.InvoiceStatus.PAID);
    break;
  }
  default:
    break;
}
nano.setDesync(false);
nano.setXeroUpdate(true);

return nano;`
    },
    {
      name: 'resyncInvoice',
      javaReturns: 'com.xero.model.Invoice',
      args: [
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
xero.setAmountDue(new BigDecimal(nano.getAmount() / 100));
Calendar due = Calendar.getInstance();
due.setTime(nano.getDueDate());
xero.setDueDate(due);
switch (nano.getStatus().getName()) {
  case "Void": {
    xero.setStatus(InvoiceStatus.VOIDED);
    break;
  }
  case "Paid": {
    xero.setStatus(InvoiceStatus.PAID);
    break;
  }
  case "Draft": {
    xero.setStatus(InvoiceStatus.DRAFT);
    break;
  }
}
return xero;`
    },
]
});
