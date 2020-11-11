package net.nanopay.partner.treviso.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.CapabilityIntercept;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.test.Test;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.invoice.ruler.TrevisoInvoiceCapabilityRule;

import java.util.Arrays;

public class InvoiceTest extends Test {

  @Override
  public void runTest(X x) {
    test(verifySubmitInvoiceTest(x),"Submitting SUBMIT invoice returns unexpected invoice");
    test(verifyQuotedInvoiceTest(x), "Submitting QUOTED invoice returns unexpected invoice");
  }

  boolean verifySubmitInvoiceTest(X x) {
    var invoiceDAO = (DAO) x.get("invoiceDAO");
    var ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

    var invoice = new Invoice();
    invoice.setPaymentMethod(PaymentStatus.SUBMIT);
    invoice.setPayeeId(1348);
    invoice.setPayerId(1348);
    invoice.setAmount(500);

    try {
      invoiceDAO.remove(invoiceDAO.put(invoice));
    } catch (CapabilityIntercept e) {
      if ( Arrays.stream(e.getCapabilities())
        .noneMatch(TrevisoInvoiceCapabilityRule.USER_CAPABILITY_ID::equals)
      ) return false;

      if ( Arrays.stream(invoice.getCapablePayloads())
        .map(cp -> cp.getCapability())
        .noneMatch(TrevisoInvoiceCapabilityRule.OBJECT_CAPABILITY_ID::equals)
      ) return false;

    } catch (Exception e) {
      return false;
    }

    var ucj = new UserCapabilityJunction();
    ucj.setSourceId(1348);
    ucj.setTargetId(TrevisoInvoiceCapabilityRule.USER_CAPABILITY_ID);
    ucj.setStatus(CapabilityJunctionStatus.GRANTED);
    ucjDAO.put(ucj);

    invoice = new Invoice();
    invoice.setPaymentMethod(PaymentStatus.SUBMIT);
    invoice.setPayeeId(1348);
    invoice.setPayerId(1348);
    invoice.setAmount(500);

    try {
      invoiceDAO.remove(invoiceDAO.put(invoice));
    } catch(Exception e) {
      return false;
    }

    ucjDAO.remove(ucj);

    return true;
  }

  boolean verifyQuotedInvoiceTest(X x) {
    var invoiceDAO = (DAO) x.get("invoiceDAO");
    var invoice = new Invoice();

    invoice.setPaymentMethod(PaymentStatus.QUOTED);
    invoice.setPayeeId(1348);
    invoice.setPayerId(1348);
    invoice.setAmount(500);

    invoiceDAO.put(invoice);



    return true;
  }

}
