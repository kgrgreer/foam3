package net.nanopay.tax;

import foam.core.*;
import foam.nanos.auth.User;
import foam.nanos.auth.Address;
import foam.dao.DAO;
import foam.core.FObject;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import java.util.*;

public class TaxMockService implements TaxService
{
  private final X x;

  public TaxMockService(X x) {
    this.x = x;
  }


  @Override
  public TaxQuote getTaxQuote(TaxQuoteRequest request) {
    TaxQuote result = new TaxQuote.Builder(this.x).build();
    List<TaxItem> taxedItems = new ArrayList<TaxItem>();
    Long amount = 0L;
    Long taxableAmount = 0L;
    Long totalTaxAmount = 0L;

    DAO taxDAO = (DAO) x.get("lineItemTaxDAO");

    for ( TaxItem taxItem : request.getTaxItems() ) {
      amount =+ taxItem.getAmount();
      List taxes = ((ArraySink) taxDAO
        .where(
          MLang.AND(
            MLang.EQ(LineItemTax.ENABLED, true),
            MLang.EQ(LineItemTax.TAX_CODE, taxItem.getTaxCode()),
            MLang.EQ(LineItemTax.FOR_TYPE, taxItem.getType())
          )
        )
        .select(new ArraySink())).getArray();

        for (Object t : taxes ) {
          LineItemTax tax = (LineItemTax) t;
          taxableAmount =+ taxItem.getAmount();
          totalTaxAmount =+ tax.getTaxAmount(taxItem.getAmount());

          TaxItem taxedItem = new TaxItem.Builder(this.x).build();
          taxedItem.setAmount(taxItem.getAmount());
          taxedItem.setQuantity(taxItem.getQuantity());
          taxedItem.setDescription(taxItem.getDescription());
          taxedItem.setTaxCode(taxItem.getTaxCode());
          taxedItem.setTax(tax.getTaxAmount(taxItem.getAmount()));
          taxedItem.setType(tax.getTaxType());

          taxedItems.add(taxedItem);          


        }

    }

    Long totalAmount = amount + totalTaxAmount;

    result.setTotalAmount(totalAmount);
    result.setTotalExempt(0L);
    result.setTotalDiscount(0L);
    result.setTotalTax(totalTaxAmount);
    result.setTotalTaxable(taxableAmount);
    result.setTotalTaxCalculated(totalTaxAmount);
    result.setExchangeRate(1L);
    result.setTaxDate(new Date());
    TaxItem[] items = new TaxItem[taxedItems.size()];
    result.setTaxItems(taxedItems.toArray(items));


    return result;
  }

}
