package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import net.nanopay.fx.ascendantfx.AscendantFX;
import net.nanopay.fx.ascendantfx.AscendantFXServiceProvider;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;
import net.nanopay.fx.ascendantfx.AscendantUserPayeeJunction;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.TransactionStatus;

/**
 * This DAO would accept FX Quote if it is not yet accepted and then submit deal to AscendantFX
 */
public class AscendantFXTransactionDAO
    extends ProxyDAO {

  public AscendantFXTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! (obj instanceof AscendantFXTransaction) ) {
      return getDelegate().put_(x, obj);
    }

    AscendantFXTransaction transaction = (AscendantFXTransaction) obj;
    if ( ! transaction.getAccepted() ) {
      transaction.accept(x);
    }

    //Submit transation to AscendantFX
    AscendantFX ascendantFX = (AscendantFX) x.get("ascendantFX");
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x, ascendantFX);
    try {
      if ( ascendantPaymentService.submitPayment(transaction) ) {
        transaction.setStatus(TransactionStatus.SENT);
      } else {
        transaction.setStatus(TransactionStatus.DECLINED);
      }
    } catch (Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error Submiting Deal to AscendantFX.", t);
    }


    return super.put_(x, obj);
  }

}
