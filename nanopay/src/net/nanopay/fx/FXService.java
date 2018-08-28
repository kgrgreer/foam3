package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;
import java.util.Date;

public class FXService
    extends ContextAwareSupport
    implements FXServiceInterface, NanoService {

  private final FXServiceProvider fxServiceProvider;
  protected DAO fxQuoteDAO_;
  protected DAO fxDealDAO_;

  public FXService(final FXServiceProvider fxServiceProvider) {
    this.fxServiceProvider = fxServiceProvider;
  }

  public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency, double sourceAmount, String direction, String valueDate) throws RuntimeException {
    ExchangeRateQuote quote = this.fxServiceProvider.getFXRate(sourceCurrency, targetCurrency, sourceAmount, direction, valueDate);
    if ( null != quote ) {
      DeliveryTimeFields timeFields = quote.getDeliveryTime();
      Date processTime = null == timeFields ? new Date() : timeFields.getProcessDate();
      FXQuote fxQuote = (FXQuote) fxQuoteDAO_.put(new FXQuote.Builder(getX())
          .setExpiryTime(null)
          .setQuoteDateTime(processTime)
          .setExternalId(quote.getId())
          .setSourceCurrency(sourceCurrency)
          .setTargetCurrency(targetCurrency)
          .setStatus(ExchangeRateStatus.QUOTED.getName())
          .build());
      quote.setId(String.valueOf(fxQuote.getId()));
    }

    return quote;
  }

  public FXAccepted acceptFXRate(FXQuote request) throws RuntimeException {
    FXAccepted fxAccepted = this.fxServiceProvider.acceptFXRate(request);
    if ( null != fxAccepted ) {
      request.setStatus(ExchangeRateStatus.ACCEPTED.getName());

      fxQuoteDAO_.put_(getX(), request);

    }
    return fxAccepted;
  }

  public FXDeal submitFXDeal(SubmitFXDeal request) {
    FXDeal submittedDeal = this.fxServiceProvider.submitFXDeal(request);
    if ( null != submittedDeal ) {
      fxDealDAO_.put(new FXDeal.Builder(getX())
          .setFXAmount(submittedDeal.getFXAmount())
          .setFXCurrencyID(submittedDeal.getFXCurrencyID())
          .setFXDirection(submittedDeal.getFXDirection())
          .setFee(submittedDeal.getFee())
          .setId(submittedDeal.getId())
          .setInternalNotes(submittedDeal.getInternalNotes())
          .setNotesToPayee(submittedDeal.getNotesToPayee())
          .setPaymentMethod(submittedDeal.getPaymentMethod())
          .setQuoteId(submittedDeal.getQuoteId())
          .setRate(submittedDeal.getRate())
          .setSettlementAmount(submittedDeal.getSettlementAmount())
          .setSettlementCurrencyID(submittedDeal.getSettlementCurrencyID())
          .setTotalSettlementAmount(submittedDeal.getTotalSettlementAmount())
          .setPayee(submittedDeal.getPayee())
          .build());

    }
    return submittedDeal;
  }

  public FXHoldingAccountBalance getFXAccountBalance(String fxAccountId) {
    return this.fxServiceProvider.getFXAccountBalance(fxAccountId);
  }

  public FXDeal confirmFXDeal(ConfirmFXDeal request) {
    return this.fxServiceProvider.confirmFXDeal(request);
  }

  public FXDeal checkIncomingFundsStatus(GetIncomingFundStatus request) {
    return this.fxServiceProvider.checkIncomingFundsStatus(request);
  }

  public FXPayee addFXPayee(FXPayee request) {
    return this.fxServiceProvider.addFXPayee(request);
  }

  public FXPayee updateFXPayee(FXPayee request) {
    return this.fxServiceProvider.updateFXPayee(request);
  }

  public FXPayee deleteFXPayee(FXPayee request) {
    return this.fxServiceProvider.deleteFXPayee(request);
  }

  public FXPayee getPayeeInfo(FXPayee request) {
    return this.fxServiceProvider.getPayeeInfo(request);
  }

  public void start() {
    fxQuoteDAO_ = (DAO) getX().get("fxQuoteDAO");
    fxDealDAO_ = (DAO) getX().get("fxDealDAO");
  }

}
