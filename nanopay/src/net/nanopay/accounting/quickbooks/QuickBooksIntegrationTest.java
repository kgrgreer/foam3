package net.nanopay.accounting.quickbooks;

import com.intuit.ipp.data.*;
import com.xero.model.Contact;
import com.xero.model.CurrencyCode;
import com.xero.model.InvoiceStatus;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.accounting.ContactMismatchPair;
import net.nanopay.accounting.ResultResponse;
import net.nanopay.accounting.quickbooks.QuickbooksIntegrationService;
import net.nanopay.accounting.resultresponse.ContactResponseItem;
import net.nanopay.accounting.resultresponse.InvoiceResponseItem;
import net.nanopay.accounting.xero.XeroIntegrationService;
import net.nanopay.accounting.xero.XeroToken;
import net.nanopay.iso20022.CurrencyReference2;
import net.nanopay.exchangeable.Currency;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

public class QuickBooksIntegrationTest extends foam.nanos.test.Test {

  List<NameBase> contact = new ArrayList<>();
  List<Transaction> invoice = new ArrayList<>();

  @Override
  public void runTest(X x) {

    QuickbooksIntegrationService quickbooksService = (QuickbooksIntegrationService) x.get("quickbooksService");
    quickbooksService.setX(x);
    try {
      quickbooksService.start();
    } catch (Exception e) {
      e.printStackTrace();
      return;
    }
    createToken(x);
    testContactSync(x, quickbooksService);
    testInvoiceSync(x, quickbooksService);

  }

  public void testContactSync(X x, QuickbooksIntegrationService quickbooksService) {
    NameBase quickBooksContact = new Customer();
    ContactMismatchPair result;
    HashMap<String, List<ContactResponseItem>> contactErrors = quickbooksService.initContactErrors();
    Date date = new Date();
    ModificationMetaData metaData = new ModificationMetaData();
    metaData.setLastUpdatedTime(date);
    EmailAddress email = new EmailAddress();
    email.setAddress("");


    // empty everything, should fail
    quickBooksContact.setCompanyName("");
    quickBooksContact.setGivenName("");
    quickBooksContact.setFamilyName("");
    quickBooksContact.setPrimaryEmailAddr(null);
    quickBooksContact.setId("1");
    quickBooksContact.setMetaData(metaData);
    test(! quickbooksService.isValidContact(quickBooksContact, contactErrors), "Empty Contact" );

    // empty email, should fail
    quickBooksContact = new Customer();
    quickBooksContact.setCompanyName("empty email Business name");
    quickBooksContact.setGivenName("");
    quickBooksContact.setFamilyName("");
    quickBooksContact.setPrimaryEmailAddr(null);
    quickBooksContact.setId("2");
    quickBooksContact.setMetaData(metaData);
    test(! quickbooksService.isValidContact(quickBooksContact, contactErrors), "Empty Email & business name" );

    try {
      email = new EmailAddress();
      email.setAddress("aqbo.net");
      // invalid email, should fail
      quickBooksContact = new Customer();
      quickBooksContact.setCompanyName("invalid email business name");
      quickBooksContact.setGivenName("");
      quickBooksContact.setFamilyName("");
      quickBooksContact.setPrimaryEmailAddr(email);
      quickBooksContact.setId("3");
      quickBooksContact.setMetaData(metaData);
      quickbooksService.importContact(x,quickBooksContact, contactErrors);
      test(false, "Invalid Email");
    } catch (Exception e) {
      e.printStackTrace();
      test(true, "Invalid Email");
    }

    email = new EmailAddress();
    email.setAddress("aqbo@nanopay.net");
    // empty business name, should fail
    quickBooksContact = new Customer();
    quickBooksContact.setCompanyName("");
    quickBooksContact.setGivenName("");
    quickBooksContact.setFamilyName("");
    quickBooksContact.setPrimaryEmailAddr(email);
    quickBooksContact.setId("4");
    quickBooksContact.setMetaData(metaData);
    test(! quickbooksService.isValidContact(quickBooksContact, contactErrors), "Empty Business name" );

    try {
      email = new EmailAddress();
      email.setAddress("optionalnameqbo@nanopay.net");
      // optional first and last name, should pass
      quickBooksContact = new Customer();
      quickBooksContact.setCompanyName("Optional business name");
      quickBooksContact.setGivenName("");
      quickBooksContact.setFamilyName("");
      quickBooksContact.setPrimaryEmailAddr(email);
      quickBooksContact.setId("5");
      quickBooksContact.setMetaData(metaData);
      result = quickbooksService.importContact(x, quickBooksContact, contactErrors);
      if ( result == null ) {
        test(true, "Optional First & last Names");
      } else {
        test(false, "Optional First & last Names");
      }
    } catch (Exception e) {
      e.printStackTrace();
      test(false, "Optional First & last Names");
    }

    try {
      email = new EmailAddress();
      email.setAddress("bqbo@nanopay.net");
      // number in first name, should fail
      quickBooksContact = new Customer();
      quickBooksContact.setCompanyName("company name");
      quickBooksContact.setGivenName("n4me");
      quickBooksContact.setFamilyName("last");
      quickBooksContact.setPrimaryEmailAddr(email);
      quickBooksContact.setId("6");
      quickBooksContact.setMetaData(metaData);
      quickbooksService.importContact(x,quickBooksContact, contactErrors);
      test(false, "Number in First Name");
    } catch (Exception e) {
      e.printStackTrace();
      test(true, "Number in First Name");
    }

    try {
      // number in last name, should fail
      quickBooksContact = new Customer();
      quickBooksContact.setCompanyName("company name");
      quickBooksContact.setGivenName("name");
      quickBooksContact.setFamilyName("l4st");
      quickBooksContact.setPrimaryEmailAddr(email);
      quickBooksContact.setId("7");
      quickBooksContact.setMetaData(metaData);
      quickbooksService.importContact(x,quickBooksContact, contactErrors);
      test(false, "Number in Last Name");
    } catch (Exception e) {
      e.printStackTrace();
      test(true, "Number in Last Name");
    }

    try {
      email = new EmailAddress();
      email.setAddress("validfieldsqbo@nanopay.net");
      // valid everything, should pass
      quickBooksContact = new Customer();
      quickBooksContact.setCompanyName("valid fields business name");
      quickBooksContact.setGivenName("first");
      quickBooksContact.setFamilyName("last");
      quickBooksContact.setPrimaryEmailAddr(email);
      quickBooksContact.setId("8");
      quickBooksContact.setMetaData(metaData);
      result = quickbooksService.importContact(x, quickBooksContact, contactErrors);
      if ( result == null ) {
        test(true, "All Valid Fields Contact");
      } else {
        test(false, "All Valid Fields Contact");
      }
    } catch (Exception e) {
      e.printStackTrace();
      test(false, "All Valid Fields Contact");
    }
  }

  public void testInvoiceSync(X x, QuickbooksIntegrationService quickbookService) {

    Transaction quickbooksInvoice = new com.intuit.ipp.data.Invoice();
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = quickbookService.initInvoiceErrors();
    Date date = new Date();
    ModificationMetaData metaData = new ModificationMetaData();
    metaData.setLastUpdatedTime(date);
    ReferenceType currencyRef = new ReferenceType();
    currencyRef.setValue("INR");
    currencyRef.setName("currencyCode");

    ReferenceType customerRef = new ReferenceType();
    customerRef.setValue("");
    customerRef.setName("customerId");

    try {
      // invalid currency
      quickbooksInvoice.setCurrencyRef(currencyRef);
      quickbooksInvoice.setId("1");
      quickbooksInvoice.setMetaData(metaData);
      if ( quickbookService.importInvoice(x, quickbooksInvoice, invoiceErrors) == null ) {
        test(false, "Invalid Currency");
      } else {
        test(true, "Invalid Currency");
      }
    } catch (Exception e) {
      e.printStackTrace();
      test(true, "Invalid Currency");
    }

    currencyRef = new ReferenceType();
    currencyRef.setValue("CAD");
    currencyRef.setName("currencyCode");

    try {
      // missing contact, should fail
      quickbooksInvoice = new com.intuit.ipp.data.Invoice();
      quickbooksInvoice.setCurrencyRef(currencyRef);
      quickbooksInvoice.setDocNumber("32893");
      ((Invoice) quickbooksInvoice).setDueDate(date);
      ((Invoice) quickbooksInvoice).setBalance(new BigDecimal(5));
      ((Invoice) quickbooksInvoice).setTotalAmt(new BigDecimal(5));
      ((Invoice) quickbooksInvoice).setCustomerRef(customerRef);
      quickbooksInvoice.setId("2");
      quickbooksInvoice.setMetaData(metaData);
      if ( quickbookService.importInvoice(x, quickbooksInvoice, invoiceErrors) == null ) {
        test(false, "Missing Contact");
      } else {
        test(true, "Missing Contact");
      }
    } catch (Exception e) {
      e.printStackTrace();
      test(true, "Missing Contact");
    }

    customerRef = new ReferenceType();
    customerRef.setValue("8");
    customerRef.setName("customerId");

    try {
      // all valid fields should pass
      quickbooksInvoice = new com.intuit.ipp.data.Invoice();
      quickbooksInvoice.setCurrencyRef(currencyRef);
      quickbooksInvoice.setDocNumber("4908348934");
      ((Invoice) quickbooksInvoice).setDueDate(date);
      ((Invoice) quickbooksInvoice).setBalance(new BigDecimal(9));
      ((Invoice) quickbooksInvoice).setTotalAmt(new BigDecimal(9));
      ((Invoice) quickbooksInvoice).setCustomerRef(customerRef);
      quickbooksInvoice.setId("3");
      quickbooksInvoice.setMetaData(metaData);
      if ( quickbookService.importInvoice(x, quickbooksInvoice, invoiceErrors) == null ) {
        test(true, "Valid Fields Invoice");
      } else {
        test(false, "Valid Fields Invoice");
      }
    } catch (Exception e) {
      e.printStackTrace();
      test(false, "Valid Fields Invoice");
    }
  }

  public void createToken(X x) {
    DAO tokenDAO =  (DAO) x.get("quickbooksTokenDAO");
    User user = (User) x.get("user");
    QuickbooksToken token = new QuickbooksToken();
    token.setId(user.getId());
    token.setBusinessName("test company");
    token.setRealmId("1234567890");
    tokenDAO.put(token);
  }

}
