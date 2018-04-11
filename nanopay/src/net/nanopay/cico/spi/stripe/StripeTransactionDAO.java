package net.nanopay.cico.spi.stripe;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.HashMap;
import java.util.Map;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.net.RequestOptions;

public class StripeTransactionDAO
  extends ProxyDAO
{
  public StripeTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public StripeTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  private static final Long STRIPE_ID = 2L;

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;
    transaction.setProviderId(STRIPE_ID);
    transaction.setStatus(TransactionStatus.PENDING);
    getDelegate().put_(x, transaction);

    Stripe.apiKey = "sk_test_KD0gUbEr1pATM7mTcB3eKNa0";

    Map<String, Object> chargeMap = new HashMap<String, Object>();
    chargeMap.put("amount", transaction.getAmount());
    chargeMap.put("currency", "cad");

    String notes = transaction.getNotes();
    chargeMap.put("description", SafetyUtil.isEmpty(notes) ? null : notes);

    // TODO: Need a proper token here.
    chargeMap.put("source", "tok_1234");

    Charge charge = null;

    try {
        charge = Charge.create(chargeMap);
        transaction.setStripeChargeId(charge.getId());
        transaction.setStatus(TransactionStatus.COMPLETED);
    } catch (StripeException e){
        transaction.setStatus(TransactionStatus.DECLINED);
        if(SafetyUtil.isEmpty(e.getMessage()))
            throw new RuntimeException("Stripe transaction failed.");
        else
            throw new RuntimeException(e.getMessage());
    }

    return getDelegate().put_(x, transaction);
  }
}
