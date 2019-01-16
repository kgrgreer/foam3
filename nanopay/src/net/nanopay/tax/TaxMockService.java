package net.nanopay.tax;

import foam.core.*;
import foam.nanos.auth.User;
import foam.nanos.auth.Address;
import foam.dao.DAO;
import java.util.*;

public class TaxMockService implements TaxService
{
  private final X x;
  protected static Double TAX_PERCANTAGE = 10.0;
  protected static final String[] APPLICABLE_TAX_CODES = new String[] {"PF050099","PF160024"};

  public TaxMockService(X x) {
    this.x = x;
  }


  @Override
  public TaxQuote getTaxQuote(TaxQuoteRequest request) {
    TaxQuote result = new TaxQuote();
    List<TaxItem> taxedItems = new ArrayList<TaxItem>();
    Long amount = 0L;
    Long taxableAmount = 0L;

    User fromUser = (User) ((DAO) this.x.get("localUserDAO")).find_(this.x, request.getFromUser());
    if ( null == fromUser ) throw new RuntimeException("Tax calculation failed because fromUser cannot be found.");
    User toUser = (User) ((DAO) this.x.get("localUserDAO")).find_(this.x, request.getToUser());
    if ( null == toUser ) throw new RuntimeException("Tax calculation failed because toUser cannot be found.");
    Address address1 = null != fromUser.getAddress() ? fromUser.getAddress() : new Address();
    Address address2 = null != toUser.getAddress() ? toUser.getAddress() : new Address();

    for ( TaxItem taxItem : request.getTaxItems() ) {
      amount =+ taxItem.getAmount();
      if ( Arrays.stream(APPLICABLE_TAX_CODES).anyMatch(taxItem.getTaxCode()::equals)) {
        taxableAmount =+ taxItem.getAmount();
        TaxItem taxedItem = new TaxItem();
        taxedItem.setAmount(taxItem.getAmount());
        taxedItem.setQuantity(taxItem.getQuantity());
        taxedItem.setDescription(taxItem.getDescription());
        taxedItem.setTaxCode(taxItem.getTaxCode());
        Double taxAmount = (taxItem.getAmount()*(TAX_PERCANTAGE/100.0));
        taxedItem.setTax(taxAmount.longValue());

        TaxSummary summary[] = new TaxSummary[2];
        TaxSummary summary1 = new TaxSummary();
        summary1.setAddress(address1);
        summary1.setExemption(false);
        summary1.setJurisType("State");
        summary1.setNonTaxable(0L);
        summary1.setRate(5.0);
        summary1.setRateType("General");
        Double summaryTaxAmount1 = (taxItem.getAmount()*(summary1.getRate()/100.0));
        Long summaryTax1 = summaryTaxAmount1.longValue();
        summary1.setTax(summaryTax1);
        summary1.setTaxCalculated(summaryTax1);
        summary1.setTaxName(address1.getRegionId() + " State Tax");
        summary1.setTaxType("Sales");
        summary1.setTaxable(taxItem.getAmount());
        summary[0] = summary1;

        TaxSummary summary2 = new TaxSummary();
        summary2.setAddress(address2);
        summary2.setExemption(false);
        summary2.setJurisType("State");
        summary2.setNonTaxable(0L);
        summary2.setRate(5.0);
        summary2.setRateType("General");
        Double summaryTaxAmount2 = (taxItem.getAmount()*(summary2.getRate()/100.0));
        Long summaryTax2 = summaryTaxAmount2.longValue();
        summary2.setTax(summaryTax2);
        summary2.setTaxCalculated(summaryTax2);
        summary2.setTaxName(address2.getRegionId() + " State Tax");
        summary2.setTaxType("Sales");
        summary2.setTaxable(taxItem.getAmount());
        summary[1] = summary2;

        taxedItem.setSummary(summary);
        taxedItems.add(taxedItem);
      }
    }

    Double totalTaxAmount = (taxableAmount*(TAX_PERCANTAGE/100.0));
    Long totalTax  = totalTaxAmount.longValue();
    Long totalAmount = taxableAmount + totalTax;

    result.setTotalAmount(totalAmount);
    result.setTotalExempt(0L);
    result.setTotalDiscount(0L);
    result.setTotalTax(totalTax);
    result.setTotalTaxable(taxableAmount);
    result.setTotalTaxCalculated(totalTax);
    result.setExchangeRate(1L);
    result.setTaxDate(new Date());
    TaxItem[] items = new TaxItem[taxedItems.size()];
    result.setTaxItems(taxedItems.toArray(items));


    return result;
  }

}
