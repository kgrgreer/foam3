package net.nanopay.fx.ascendantfx;

import foam.core.*;
import net.nanopay.fx.ascendantfx.model.*;

import java.util.*;

public class AscendantFXServiceMock
    extends ContextAwareSupport
    implements AscendantFX
{


  @Override
  public GetQuoteResult getQuote(GetQuoteRequest request) {
    GetQuoteResult result = new GetQuoteResult();
    result.setErrorCode(0);
    result.setErrorMessage("Success");
    Quote quote = new Quote();
    quote.setID(9000);
    Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    calendar.add(Calendar.DATE, 1);
    quote.setExpiryTime(calendar.getTime());
    quote.setQuoteDateTime(new Date());
    result.setQuote(quote);
    Deal[] deals = new Deal[1];
    Deal deal = new Deal();
    deal.setDirection(request.getPayment()[0].getDirection());
    deal.setFee(10);
    deal.setRate(1.33);
    deal.setFxAmount(request.getPayment()[0].getSettlementAmount() * deal.getRate());
    deal.setFxCurrencyID(request.getPayment()[0].getFxCurrencyID());
    deal.setSettlementAmount(request.getPayment()[0].getSettlementAmount());
    deal.setSettlementCurrencyID(request.getPayment()[0].getSettlementCurrencyID());
    deals[0] = deal;

    result.setPayment(deals);
    return result;
  }

  @Override
  public AcceptQuoteResult acceptQuote(AcceptQuoteRequest request) {
    AcceptQuoteResult result = new AcceptQuoteResult();
    result.setErrorCode(0);
    result.setErrorMessage("Success");
    result.setQuoteID(request.getQuoteID());
    return result;
  }

  @Override
  public SubmitDealResult submitDeal(SubmitDealRequest request) {
    SubmitDealResult result = new SubmitDealResult();
    result.setErrorCode(0);
    result.setErrorMessage("Success");
    DealDetail[] deals = new DealDetail[1];
    DealDetail deal = new DealDetail();
    deal.setDirection(request.getPaymentDetail()[0].getDirection());
    deal.setFee(100);
    deal.setFxAmount(request.getPaymentDetail()[0].getFxAmount());
    deal.setFxCurrencyID(request.getPaymentDetail()[0].getFxCurrencyID());
    deal.setRate(0.75);
    deal.setSettlementAmount(request.getPaymentDetail()[0].getFxAmount() * deal.getRate());
    deal.setSettlementCurrencyID(request.getPaymentDetail()[0].getSettlementCurrencyID());
    deals[0] = deal;
    result.setPaymentDetail(deals);
    result.setDealID("111");
    return result;
  }

  @Override
  public PayeeOperationResult addPayee(PayeeOperationRequest request) {
    PayeeOperationResult result = new PayeeOperationResult();
    result.setErrorCode(0);
    result.setErrorMessage("Success");
    result.setPayeeId("9836");
    result.setPayeeName(request.getPayeeDetail()[0].getPayeeName());
    result.setPayeeInternalReference(request.getPayeeDetail()[0].getPayeeInternalReference());
    return result;
  }

  @Override
  public PayeeOperationResult updatePayee(PayeeOperationRequest request) {
    PayeeOperationResult result = new PayeeOperationResult();
    result.setErrorCode(0);
    result.setErrorMessage("Success");
    result.setPayeeId("9800");
    result.setPayeeName("New Name");
    result.setPayeeInternalReference(request.getPayeeDetail()[0].getPayeeInternalReference());
    return result;
  }

  @Override
  public PayeeOperationResult deletePayee(PayeeOperationRequest request) {
    PayeeOperationResult result = new PayeeOperationResult();
    result.setErrorCode(0);
    result.setErrorMessage("Success");
    result.setPayeeId("9836");
    result.setPayeeName(request.getPayeeDetail()[0].getPayeeName());
    result.setPayeeInternalReference(request.getPayeeDetail()[0].getPayeeInternalReference());
    return result;
  }

  @Override
  public GetQuoteTBAResult getQuoteTBA(GetQuoteTBARequest request) {
    GetQuoteTBAResult result = new GetQuoteTBAResult();
    return result;
  }

  @Override
  public AcceptAndSubmitDealTBAResult acceptAndSubmitDealTBA(AcceptQuoteRequest request) {
    AcceptAndSubmitDealTBAResult result = new AcceptAndSubmitDealTBAResult();
    return result;
  }

  public SubmitIncomingDealResult submitIncomingDeal(SubmitIncomingDealRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public GetAccountBalanceResult getAccountBalance(GetAccountBalanceRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public ValidateIBANResult validateIBAN(ValidateIBANRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public GetPayeeInfoResult getPayeeInfo(GetPayeeInfoRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public PostDealResult postDeal(PostDealRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public PostDealConfirmationResult postDealConfirmation(PostDealConfirmationRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public PayeeInfoValidationResult validatePayeeInfo(PayeeInfoValidationRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public GetAccountActivityResult getAccountActivity(GetAccountActivityRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public IncomingFundStatusCheckResult checkIncomingFundsStatus(IncomingFundStatusCheckRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public IncomingPaymentInstructionResult getIncomingPaymentInstruction(IncomingPaymentInstructionRequest request) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

}
