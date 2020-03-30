package net.nanopay.contacts;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import net.nanopay.auth.PublicBusinessInfo;
import net.nanopay.model.Business;
import net.nanopay.payment.PaymentCode;

public class PaymentCodeService
    extends    ContextAwareSupport
    implements PaymentCodeServiceInterface, NanoService {
  protected DAO paymentCodeDAO;
  protected DAO businessDAO; 

  @Override
  public PublicBusinessInfo getPublicBusinessInfo(X x, String paymentCode) throws RuntimeException {
    Business loggedInBusiness = (Business) x.get("user");
    PaymentCode validatedPaymentCode = (PaymentCode) paymentCodeDAO.inX(x).find(paymentCode);
    if ( validatedPaymentCode == null ) {
      throw new RuntimeException("Invalid Payment Code");
    }
    Business business = (Business) businessDAO.find(validatedPaymentCode.getOwner());
    if ( business == null || ((Long) business.getId()).equals(loggedInBusiness.getId())) {
      throw new RuntimeException("Invalid Payment Code");
    }
    PublicBusinessInfo publicBusinessInfo = new PublicBusinessInfo(x, business);
    return publicBusinessInfo;
  }

  @Override
  public void start() {
    paymentCodeDAO   = (DAO) getX().get("localPaymentCodeDAO");
    businessDAO      = (DAO) getX().get("localBusinessDAO");
  }

}
