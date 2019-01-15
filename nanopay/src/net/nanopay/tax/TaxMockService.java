package net.nanopay.tax;

import foam.core.*;
import foam.nanos.auth.User;
import foam.nanos.auth.Address;
import foam.dao.DAO;
import java.util.*;

public class TaxMockService
    extends ContextAwareSupport
    implements TaxService
{

  protected static Double TAX_PERCANTAGE = 10.0;


  @Override
  public TaxQuote getTaxQuote(TaxQuoteRequest request) {
    TaxQuote result = new TaxQuote();
    Long amount = 0L;
    for ( TaxItem taxItem : request.getLines() ) {
      amount =+ taxItem.getAmount();
    }

    Double totalTaxAmount = (amount*(TAX_PERCANTAGE/100.0));
    Long totalTax  = totalTaxAmount.longValue();
    Long totalAmount = amount + totalTax;

    result.setType(request.getType());
    result.setTotalAmount(totalAmount);
    result.setTotalExempt(0L);
    result.setTotalDiscount(0L);
    result.setTotalTax(totalTax);
    result.setTotalTaxable(amount);
    result.setTotalTaxCalculated(totalTax);
    result.setExchangeRate(1L);
    result.setTaxDate(new Date());

    TaxSummary summary[] = new TaxSummary[2];
    User fromUser = (User) ((DAO) getX().get("localUserDAO")).find_(getX(), request.getFromUser());
    User toUser = (User) ((DAO) getX().get("localUserDAO")).find_(getX(), request.getToUser());
    Address address1 = null != fromUser.getAddress() ? fromUser.getAddress() : new Address();
    Address address2 = null != toUser.getAddress() ? toUser.getAddress() : new Address();

    TaxSummary summary1 = new TaxSummary();
    summary1.setAddress(address1);
    summary1.setExemption(false);
    summary1.setJurisCode("53");
    summary1.setJurisName(address1.getRegionId());
    summary1.setJurisType("State");
    summary1.setNonTaxable(0L);
    summary1.setRate(5.0);
    summary1.setRateType("General");
    Double summaryTaxAmount1 = (amount*(summary1.getRate()/100.0));
    Long summaryTax1 = summaryTaxAmount1.longValue();
    summary1.setTax(summaryTax1);
    summary1.setTaxAuthorityType(45);
    summary1.setTaxCalculated(summaryTax1);
    summary1.setTaxName(address1.getRegionId() + " State Tax");
    summary1.setTaxType("Sales");
    summary1.setTaxable(amount);
    summary[0] = summary1;

    TaxSummary summary2 = new TaxSummary();
    summary2.setAddress(address2);
    summary2.setExemption(false);
    summary2.setJurisCode("53");
    summary2.setJurisName(address2.getRegionId());
    summary2.setJurisType("State");
    summary2.setNonTaxable(0L);
    summary2.setRate(5.0);
    summary2.setRateType("General");
    Double summaryTaxAmount2 = (amount*(summary2.getRate()/100.0));
    Long summaryTax2 = summaryTaxAmount2.longValue();
    summary2.setTax(summaryTax2);
    summary2.setTaxAuthorityType(45);
    summary2.setTaxCalculated(summaryTax2);
    summary2.setTaxName(address2.getRegionId() + " State Tax");
    summary2.setTaxType("Sales");
    summary2.setTaxable(amount);
    summary[1] = summary2;

    result.setSummary(summary);

    return result;
  }

}
