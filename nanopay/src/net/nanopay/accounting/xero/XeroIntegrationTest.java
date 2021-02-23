package net.nanopay.accounting.xero;

import com.xero.model.Contact;
import com.xero.model.CurrencyCode;
import com.xero.model.Invoice;
import com.xero.model.InvoiceStatus;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.accounting.ContactMismatchPair;
import net.nanopay.accounting.resultresponse.ContactResponseItem;
import net.nanopay.accounting.resultresponse.InvoiceResponseItem;
import java.math.BigDecimal;
import java.util.*;

public class XeroIntegrationTest extends foam.nanos.test.Test {

  Contact contact = new Contact();
  List<Invoice> invoice = new ArrayList<>();

  @Override
  public void runTest(X x) {
    XeroIntegrationService xeroService = (XeroIntegrationService) x.get("xeroService");
    xeroService.setX(x);
    createToken(x);
    testContactSync(x, xeroService);
    testInvoiceSync(x, xeroService);
  }

  public void createToken(X x) {
    DAO tokenDAO =  (DAO) x.get("xeroTokenDAO");
    User user = ((Subject) x.get("subject")).getUser();
    XeroToken token = new XeroToken();
    token.setId(user.getId());
    token.setBusinessName("test company");
    token.setOrganizationId("1234567890");
    tokenDAO.put(token);
  }

  public void testContactSync(X x, XeroIntegrationService xeroService ) {
    Logger logger = (Logger) x.get("logger");

    HashMap<String, List<ContactResponseItem>> contactErrors = xeroService.initContactErrors();
    Contact xeroContact = new Contact();
    Calendar date = new GregorianCalendar();
    ContactMismatchPair result;

    // empty everything, should fail
    xeroContact.setName("");
    xeroContact.setFirstName("");
    xeroContact.setLastName("");
    xeroContact.setEmailAddress("");
    xeroContact.setContactID("1");
    xeroContact.setUpdatedDateUTC(date);
    test( ! xeroService.isValidContact(xeroContact,contactErrors), "Empty Contanct" );

    // empty email, should fail
    xeroContact = new Contact();
    xeroContact.setName("Business name");
    xeroContact.setFirstName("");
    xeroContact.setLastName("");
    xeroContact.setEmailAddress("");
    xeroContact.setContactID("2");
    xeroContact.setUpdatedDateUTC(date);
    test( ! xeroService.isValidContact(xeroContact, contactErrors), "Empty Email" );

    // empty business name, should fail
    xeroContact = new Contact();
    xeroContact.setName("");
    xeroContact.setFirstName("");
    xeroContact.setLastName("");
    xeroContact.setEmailAddress("a@nanopay.net");
    xeroContact.setContactID("3");
    xeroContact.setUpdatedDateUTC(date);
    test( ! xeroService.isValidContact(xeroContact, contactErrors), "Empty Business name" );

    try {
      // invalid email, should fail
      xeroContact = new Contact();
      xeroContact.setName("Business name");
      xeroContact.setFirstName("");
      xeroContact.setLastName("");
      xeroContact.setEmailAddress("a.net");
      xeroContact.setContactID("4");
      xeroContact.setUpdatedDateUTC(date);
      result = xeroService.importContact(x, xeroContact);
      test(false, "Invalid Email");
    } catch (Exception e) {
      logger.log(e);
      test(true, "Invalid Email");
    }

    try {
      // optional first and last name, should pass
      xeroContact = new Contact();
      xeroContact.setName("Optional business name");
      xeroContact.setFirstName("");
      xeroContact.setLastName("");
      xeroContact.setEmailAddress("optionalname@nanopay.net");
      xeroContact.setContactID("5");
      xeroContact.setUpdatedDateUTC(date);
      result = xeroService.importContact(x, xeroContact);
      test(true, "Optional name");
    } catch (Exception e) {
      logger.log(e);
      test(false, "Optional name");
    }

    try {
      // number in first name, should fail
      xeroContact = new Contact();
      xeroContact.setName("Business name");
      xeroContact.setFirstName("f1rst");
      xeroContact.setLastName("last");
      xeroContact.setEmailAddress("b@nanopay.net");
      xeroContact.setContactID("6");
      xeroContact.setUpdatedDateUTC(date);
      result = xeroService.importContact(x, xeroContact);
    } catch (Exception e) {
      logger.log(e);
    }

    try {
      // number in last name, should fail
      xeroContact = new Contact();
      xeroContact.setName("Business name");
      xeroContact.setFirstName("first");
      xeroContact.setLastName("1ast");
      xeroContact.setEmailAddress("b@nanopay.net");
      xeroContact.setContactID("7");
      xeroContact.setUpdatedDateUTC(date);
      result = xeroService.importContact(x, xeroContact);
    } catch (Exception e) {
      logger.log(e);
    }

    try {
      // valid everything, should pass
      xeroContact = new Contact();
      xeroContact.setName("valid fields business name");
      xeroContact.setFirstName("first");
      xeroContact.setLastName("last");
      xeroContact.setEmailAddress("validfields@nanopay.net");
      xeroContact.setContactID("8");
      xeroContact.setUpdatedDateUTC(date);
      result = xeroService.importContact(x, xeroContact);
      test(true, "All Valid Contacts");
    } catch (Exception e) {
      logger.log(e);
      test(false, "All Valid Contacts");
    }

  }

  public void testInvoiceSync(X x, XeroIntegrationService xeroService) {
    Logger logger = (Logger) x.get("logger");
    Invoice xeroInvoice = new Invoice();
    HashMap<String, List<InvoiceResponseItem>> invoiceErrors = xeroService.initInvoiceErrors();
    Calendar date = new GregorianCalendar();

    try {
      // invalid currency
      xeroInvoice.setCurrencyCode(CurrencyCode.INR);
      xeroInvoice.setInvoiceID("1");
      xeroInvoice.setUpdatedDateUTC(date);
      test( ! xeroService.importInvoice(x, xeroInvoice, invoiceErrors,false), "Invalid Currency");
    } catch (Exception e) {
      logger.log(e);
      test(false, "Invalid Currency");
    }

    try {
      // not authorized, should fail
      xeroInvoice = new Invoice();
      xeroInvoice.setCurrencyCode(CurrencyCode.CAD);
      xeroInvoice.setStatus(InvoiceStatus.DRAFT);
      xeroInvoice.setInvoiceID("2");
      xeroInvoice.setUpdatedDateUTC(date);
      test( ! xeroService.importInvoice(x, xeroInvoice, invoiceErrors,false), "Not Authorized");
    } catch (Exception e) {
      logger.log(e);
      test(false, "Not Authorized");
    }

    try {
      // missing contact, should fail
      xeroInvoice = new Invoice();
      xeroInvoice.setCurrencyCode(CurrencyCode.CAD);
      xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
      xeroInvoice.setDueDate(date);
      xeroInvoice.setDate(date);
      xeroInvoice.setAmountDue(new BigDecimal(5));
      xeroInvoice.setInvoiceID("3");
      xeroInvoice.setUpdatedDateUTC(date);
      test( ! xeroService.importInvoice(x, xeroInvoice, invoiceErrors,false), "Missing Contact" );

    } catch (Exception e) {
      logger.log(e);
      test(false, "Missing Contact");
    }

    try {
      // all valid fields should pass
      xeroInvoice = new Invoice();
      xeroInvoice.setCurrencyCode(CurrencyCode.CAD);
      xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
      xeroInvoice.setDueDate(date);
      xeroInvoice.setDate(date);
      xeroInvoice.setContact(contact);
      xeroInvoice.setAmountDue(new BigDecimal(6));
      xeroInvoice.setInvoiceID("4");
      xeroInvoice.setUpdatedDateUTC(date);
      test( ! xeroService.importInvoice(x, xeroInvoice, invoiceErrors,false), "All Fields Valid" );
    } catch (Exception e) {
      logger.log(e);
      test(false, "All Fields Valid");
    }
  }

}
