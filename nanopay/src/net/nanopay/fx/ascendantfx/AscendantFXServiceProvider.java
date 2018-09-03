package net.nanopay.fx.ascendantfx;

import foam.core.X;
import foam.dao.DAO;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteResult;
import net.nanopay.fx.ascendantfx.model.AccountDetails;
import net.nanopay.fx.ascendantfx.model.Deal;
import net.nanopay.fx.ascendantfx.model.DealDetail;
import net.nanopay.fx.ascendantfx.model.Direction;
import net.nanopay.fx.ascendantfx.model.GetAccountBalanceRequest;
import net.nanopay.fx.ascendantfx.model.GetAccountBalanceResult;
import net.nanopay.fx.ascendantfx.model.GetPayeeInfoRequest;
import net.nanopay.fx.ascendantfx.model.GetPayeeInfoResult;
import net.nanopay.fx.ascendantfx.model.GetQuoteRequest;
import net.nanopay.fx.ascendantfx.model.GetQuoteResult;
import net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckRequest;
import net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckResult;
import net.nanopay.fx.ascendantfx.model.Payee;
import net.nanopay.fx.ascendantfx.model.PayeeDetail;
import net.nanopay.fx.ascendantfx.model.PayeeOperationRequest;
import net.nanopay.fx.ascendantfx.model.PayeeOperationResult;
import net.nanopay.fx.ascendantfx.model.PostDealConfirmationRequest;
import net.nanopay.fx.ascendantfx.model.PostDealConfirmationResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealRequest;
import net.nanopay.fx.ConfirmFXDeal;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.ExchangeRateFields;
import net.nanopay.fx.ExchangeRateQuote;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FXAccepted;
import net.nanopay.fx.FXDeal;
import net.nanopay.fx.FXHoldingAccount;
import net.nanopay.fx.FXHoldingAccountBalance;
import net.nanopay.fx.FXDirection;
import net.nanopay.fx.FXPayee;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXServiceProvider;
import net.nanopay.fx.FeesFields;
import net.nanopay.fx.GetIncomingFundStatus;
import net.nanopay.fx.SubmitFXDeal;

public class AscendantFXServiceProvider implements FXServiceProvider {

  public static final String AFX_ORG_ID = "5904960";
  public static final String AFX_METHOD_ID = "";
  public static final Long AFX_SUCCESS_CODE = 200l;
  private final AscendantFX ascendantFX;
  private final X x;

  public AscendantFXServiceProvider(X x, final AscendantFX ascendantFX) {
    this.ascendantFX = ascendantFX;
    this.x = x;
  }

  public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency, double sourceAmount, String fxDirection, String valueDate) throws RuntimeException {
    ExchangeRateQuote quote = new ExchangeRateQuote();

    //Convert to AscendantFx Request
    GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
    getQuoteRequest.setMethodID("AFXEWSGQ");
    getQuoteRequest.setOrgID(AFX_ORG_ID);
    getQuoteRequest.setTotalNumberOfPayment(1);

    Deal deal = new Deal();
    Direction direction = Direction.valueOf(fxDirection);
    deal.setDirection(direction);
    deal.setFxAmount(sourceAmount);
    deal.setFxCurrencyID(sourceCurrency);
    deal.setSettlementCurrencyID(targetCurrency);
    deal.setPaymentMethod("Wire");
    deal.setPaymentSequenceNo(1);

    List<Deal> deals = new ArrayList<Deal>();
    deals.add(deal);
    Deal[] dealArr = new Deal[deals.size()];
    getQuoteRequest.setPayment(deals.toArray(dealArr));

    GetQuoteResult getQuoteResult = this.ascendantFX.getQuote(getQuoteRequest);
    if ( null == getQuoteResult ) {
      return quote;
    }

    //Convert to nanopay interface
    quote.setId(String.valueOf(getQuoteResult.getQuote().getID()));

    ExchangeRateFields reqExRate = new ExchangeRateFields();
    reqExRate.setSourceCurrency(sourceCurrency);
    reqExRate.setTargetCurrency(targetCurrency);
    reqExRate.setFxStatus(ExchangeRateStatus.QUOTED.getName());


    Deal[] dealResult = getQuoteResult.getPayment();
    if ( dealResult.length > 0 ) {
      Deal aDeal = dealResult[0];

      reqExRate.setRate(aDeal.getRate());
      reqExRate.setExpirationTime(getQuoteResult.getQuote().getExpiryTime());
      reqExRate.setTargetAmount((aDeal.getFxAmount() - aDeal.getFee()) * reqExRate.getRate());
      reqExRate.setSourceAmount(aDeal.getFxAmount());

      FeesFields reqFee = new FeesFields();
      reqFee.setTotalFees(aDeal.getFee());
      quote.setFee(reqFee);

    }

    quote.setExchangeRate(reqExRate);

    return quote;

  }

  public FXAccepted acceptFXRate(FXQuote quote) throws RuntimeException {
    FXAccepted result = new FXAccepted();
    //Build Ascendant Request
    AcceptQuoteRequest request = new AcceptQuoteRequest();
    request.setMethodID("AFXEWSAQ");
    request.setOrgID(AFX_ORG_ID);
    request.setQuoteID(quote.getId());

    AcceptQuoteResult acceptQuoteResult = this.ascendantFX.acceptQuote(request);
    if ( null != acceptQuoteResult ) {
      result.setId(String.valueOf(acceptQuoteResult.getQuoteID()));
      result.setCode("200");
    }

    return result;
  }

  public FXDeal submitFXDeal(SubmitFXDeal request) {
    FXDeal result = null;
    //Build Ascendant Request
    SubmitDealRequest ascendantRequest = new SubmitDealRequest();
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);
    ascendantRequest.setQuoteID(Long.parseLong(request.getQuoteId()));
    ascendantRequest.setTotalNumberOfPayment(request.getTotalNumberOfPayment());

    DealDetail[] dealArr = new DealDetail[1];
    FXDeal fxDeal = (FXDeal) request.getFxDeal();
    if ( null != fxDeal ) {
      DealDetail dealDetail = new DealDetail();
      dealDetail.setDirection(Direction.valueOf(fxDeal.getFXDirection().getName()));
      dealDetail.setFee(fxDeal.getFee());
      dealDetail.setFxAmount(fxDeal.getFXAmount());
      dealDetail.setFxCurrencyID(fxDeal.getFXCurrencyID());
      dealDetail.setInternalNotes(fxDeal.getInternalNotes());
      dealDetail.setNotesToPayee(fxDeal.getNotesToPayee());
      dealDetail.setPaymentMethod(fxDeal.getPaymentMethod());
      dealDetail.setPaymentSequenceNo(fxDeal.getPaymentSequenceNo());
      dealDetail.setRate(fxDeal.getRate());
      dealDetail.setSettlementAmount(fxDeal.getSettlementAmount());
      dealDetail.setSettlementCurrencyID(fxDeal.getSettlementCurrencyID());
      dealDetail.setTotalSettlementAmount(fxDeal.getTotalSettlementAmount());
      dealDetail.setPayee(converFXPayeeToPayee(fxDeal.getPayee()));

      dealArr[0] = dealDetail;
      ascendantRequest.setPaymentDetail(dealArr);
    }

    SubmitDealResult submittedDeal = this.ascendantFX.submitDeal(ascendantRequest);
    if ( null != submittedDeal ) {
      DealDetail[] submittedDealDetails = submittedDeal.getPaymentDetail();
      if ( submittedDealDetails.length > 0 ) {
        result = new FXDeal();
        DealDetail detail = submittedDealDetails[0];
        result.setFXDirection(FXDirection.valueOf(detail.getDirection().getName()));
        result.setFee(detail.getFee());
        result.setFXAmount(detail.getFxAmount());
        result.setFXCurrencyID(detail.getFxCurrencyID());
        result.setInternalNotes(detail.getInternalNotes());
        result.setNotesToPayee(detail.getNotesToPayee());
        result.setPaymentMethod(detail.getPaymentMethod());
        result.setPaymentSequenceNo(detail.getPaymentSequenceNo());
        result.setRate(detail.getRate());
        result.setSettlementAmount(detail.getSettlementAmount());
        result.setSettlementCurrencyID(detail.getSettlementCurrencyID());
        result.setTotalSettlementAmount(detail.getTotalSettlementAmount());
        result.setPayee(converPayeeToFXPayee(detail.getPayee()));
      }
    }

    return result;

  }

  public FXHoldingAccountBalance getFXAccountBalance(String fxAccountId) {
    FXHoldingAccountBalance holdingAccountBalance = null;
    GetAccountBalanceRequest request = new GetAccountBalanceRequest();
    request.setMethodID(AFX_ORG_ID);
    request.setOrgID(AFX_ORG_ID);

    GetAccountBalanceResult accountBalance = this.ascendantFX.getAccountBalance(request);
    if ( null != accountBalance ) {
      holdingAccountBalance = new FXHoldingAccountBalance();
      List<FXHoldingAccount> accounts = new ArrayList<FXHoldingAccount>();
      for ( AccountDetails accountDetail : accountBalance.getAccount() ) {
        FXHoldingAccount account = new FXHoldingAccount();
        account.setAccountCurrencyID(accountDetail.getAccountCurrencyID());
        account.setAccountNumber(accountDetail.getAccountNumber());
        account.setBalanceAmount(accountDetail.getBalanceAmount());

        accounts.add(account);
      }
      FXHoldingAccount[] accountArr = new FXHoldingAccount[accounts.size()];
      holdingAccountBalance.setFxHoldingAccounts(accounts.toArray(accountArr));
    }
    return holdingAccountBalance;
  }

  public FXDeal confirmFXDeal(ConfirmFXDeal request) {
    FXDeal result = null;
    PostDealConfirmationRequest ascendantRequest = new PostDealConfirmationRequest();
    ascendantRequest.setAFXDealID(request.getId());
    ascendantRequest.setAFXPaymentID(request.getFxPaymentId());
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    PostDealConfirmationResult ascendantResult = this.ascendantFX.postDealConfirmation(ascendantRequest);
    if ( ascendantResult != null ) {
      result = new FXDeal();
      result.setId(ascendantResult.getAFXDealID());
      result.setFXDealStatus(ascendantResult.getDealPostConfirm().getOrdinal());
    }

    return result;
  }

  public FXDeal checkIncomingFundsStatus(GetIncomingFundStatus request) {
    FXDeal result = null;
    IncomingFundStatusCheckRequest ascendantRequest = new IncomingFundStatusCheckRequest();
    ascendantRequest.setDealID(request.getDealId());
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    IncomingFundStatusCheckResult ascendantResult = this.ascendantFX.checkIncomingFundsStatus(ascendantRequest);
    if ( null != ascendantResult ) {
      result = new FXDeal();
      result.setId(ascendantResult.getDealID());
      result.setFXDealStatus(ascendantResult.getStatus());
    }

    return result;
  }

  public FXPayee addFXPayee(FXPayee request) {
    FXPayee newPayee = null;
    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    PayeeDetail ascendantPayee = payeeDetiailFromFXPayee(request);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.addPayee(ascendantRequest);
    if ( null != ascendantResult && ascendantResult.getErrorCode() == 0 ) {
      newPayee = new FXPayee();
      newPayee.copyFrom(request);
      newPayee.setPayeeName(ascendantResult.getPayeeName());
      newPayee.setPayeeReference(ascendantResult.getPayeeInternalReference());
      newPayee.setPayeeId(Integer.parseInt(ascendantResult.getPayeeId()));
      
      DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
      AscendantFXUser ascendantFXUser = new AscendantFXUser.Builder(x).build();
      ascendantFXUser.setUser(request.getUser());
      ascendantFXUser.setAscendantPayeeId(ascendantResult.getPayeeId());
      ascendantFXUserDAO.put_(x, request);
    }

    return newPayee;
  }

  public FXPayee updateFXPayee(FXPayee request) {
    FXPayee newPayee = null;
    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    PayeeDetail ascendantPayee = payeeDetiailFromFXPayee(request);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.updatePayee(ascendantRequest);
    if ( null != ascendantResult ) {
      newPayee = new FXPayee();
      newPayee.copyFrom(request);
      newPayee.setPayeeName(ascendantResult.getPayeeName());
      newPayee.setPayeeReference(ascendantResult.getPayeeInternalReference());
      newPayee.setPayeeId(Integer.parseInt(ascendantResult.getPayeeId()));
    }

    return newPayee;
  }

  public FXPayee deleteFXPayee(FXPayee request) {
    FXPayee newPayee = null;
    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    PayeeDetail ascendantPayee = payeeDetiailFromFXPayee(request);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.deletePayee(ascendantRequest);
    if ( null != ascendantResult ) {
      newPayee = new FXPayee();
      newPayee.copyFrom(request);
      newPayee.setPayeeName(ascendantResult.getPayeeName());
      newPayee.setPayeeReference(ascendantResult.getPayeeInternalReference());
      newPayee.setPayeeId(Integer.parseInt(ascendantResult.getPayeeId()));
    }

    return newPayee;
  }

  public FXPayee getPayeeInfo(FXPayee request) {
    FXPayee newPayee = null;
    GetPayeeInfoRequest ascendantRequest = new GetPayeeInfoRequest();
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    PayeeDetail ascendantPayee = payeeDetiailFromFXPayee(request);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    GetPayeeInfoResult ascendantResult = this.ascendantFX.getPayeeInfo(ascendantRequest);
    if ( null != ascendantResult ) {
      PayeeDetail[] payeeDetails = ascendantResult.getPayeeDetail();
      if (payeeDetails.length > 0) {
        PayeeDetail payeeDetail = payeeDetails[0];
        newPayee = convertPayeeDetailToFXPayee(payeeDetail);
      }

    }

    return newPayee;
  }

  private Payee converFXPayeeToPayee(FXPayee fxPayee) {
    Payee payee = new Payee();
    if ( null != fxPayee ) {
      payee.setOriginatorID(fxPayee.getOriginatorID());
      payee.setPayeeAccountIBANNumber(fxPayee.getPayeeAccountIBANNumber());
      payee.setPayeeAddress1(fxPayee.getPayeeAddress1());
      payee.setPayeeAddress2(fxPayee.getPayeeAddress2());
      payee.setPayeeBankBankCode(fxPayee.getPayeeBankBankCode());
      payee.setPayeeBankCity(fxPayee.getPayeeBankCity());
      payee.setPayeeBankCountryID(fxPayee.getPayeeBankCountryID());
      payee.setPayeeBankName(fxPayee.getPayeeBankName());
      payee.setPayeeBankPostalCode(fxPayee.getPayeeBankPostalCode());
      payee.setPayeeBankProvince(fxPayee.getPayeeBankProvince());
      payee.setPayeeBankRoutingCode(fxPayee.getPayeeBankRoutingCode());
      payee.setPayeeBankRoutingType(fxPayee.getPayeeBankRoutingType());
      payee.setPayeeBankSwiftCode(fxPayee.getPayeeBankSwiftCode());
      payee.setPayeeCity(fxPayee.getPayeeCity());
      payee.setPayeeCountryID(fxPayee.getPayeeCountryID());
      payee.setPayeeEmail(fxPayee.getPayeeEmail());
      payee.setPayeeID(fxPayee.getPayeeId());
      payee.setPayeeInterBankAddress1(fxPayee.getPayeeInterBankAddress1());
      payee.setPayeeInterBankAddress2(fxPayee.getPayeeInterBankAddress2());
      payee.setPayeeInterBankBankCode(fxPayee.getPayeeInterBankBankCode());
      payee.setPayeeInterBankCity(fxPayee.getPayeeInterBankCity());
      payee.setPayeeInterBankCountryID(fxPayee.getPayeeInterBankCountryID());
      payee.setPayeeInterBankName(fxPayee.getPayeeInterBankName());
      payee.setPayeeInterBankPostalCode(fxPayee.getPayeeInterBankPostalCode());
      payee.setPayeeInterBankProvince(fxPayee.getPayeeInterBankProvince());
      payee.setPayeeInterBankRoutingCode(fxPayee.getPayeeInterBankRoutingCode());
      payee.setPayeeInterBankRoutingCodeType(fxPayee.getPayeeInterBankRoutingCodeType());
      payee.setPayeeName(fxPayee.getPayeeName());
      payee.setPayeePostalCode(fxPayee.getPayeePostalCode());
      payee.setPayeeReference(fxPayee.getPayeeReference());
      payee.setPayeeSendingBankInstructions(fxPayee.getPayeeSendingBankInstructions());
    }
    return payee;
  }

  private FXPayee converPayeeToFXPayee(Payee payee) {
    FXPayee fxPayee = new FXPayee();
    if ( null != payee ) {
      fxPayee.setOriginatorID(payee.getOriginatorID());
      fxPayee.setPayeeAccountIBANNumber(payee.getPayeeAccountIBANNumber());
      fxPayee.setPayeeAddress1(payee.getPayeeAddress1());
      fxPayee.setPayeeAddress2(payee.getPayeeAddress2());
      fxPayee.setPayeeBankBankCode(payee.getPayeeBankBankCode());
      fxPayee.setPayeeBankCity(payee.getPayeeBankCity());
      fxPayee.setPayeeBankCountryID(payee.getPayeeBankCountryID());
      fxPayee.setPayeeBankName(payee.getPayeeBankName());
      fxPayee.setPayeeBankPostalCode(payee.getPayeeBankPostalCode());
      fxPayee.setPayeeBankProvince(payee.getPayeeBankProvince());
      fxPayee.setPayeeBankRoutingCode(payee.getPayeeBankRoutingCode());
      fxPayee.setPayeeBankRoutingType(payee.getPayeeBankRoutingType());
      fxPayee.setPayeeBankSwiftCode(payee.getPayeeBankSwiftCode());
      fxPayee.setPayeeCity(payee.getPayeeCity());
      fxPayee.setPayeeCountryID(payee.getPayeeCountryID());
      fxPayee.setPayeeEmail(payee.getPayeeEmail());
      fxPayee.setPayeeId(payee.getPayeeID());
      fxPayee.setPayeeInterBankAddress1(payee.getPayeeInterBankAddress1());
      fxPayee.setPayeeInterBankAddress2(payee.getPayeeInterBankAddress2());
      fxPayee.setPayeeInterBankBankCode(payee.getPayeeInterBankBankCode());
      fxPayee.setPayeeInterBankCity(payee.getPayeeInterBankCity());
      fxPayee.setPayeeInterBankCountryID(payee.getPayeeInterBankCountryID());
      fxPayee.setPayeeInterBankName(payee.getPayeeInterBankName());
      fxPayee.setPayeeInterBankPostalCode(payee.getPayeeInterBankPostalCode());
      fxPayee.setPayeeInterBankProvince(payee.getPayeeInterBankProvince());
      fxPayee.setPayeeInterBankRoutingCode(payee.getPayeeInterBankRoutingCode());
      fxPayee.setPayeeInterBankRoutingCodeType(payee.getPayeeInterBankRoutingCodeType());
      fxPayee.setPayeeName(payee.getPayeeName());
      fxPayee.setPayeePostalCode(payee.getPayeePostalCode());
      fxPayee.setPayeeReference(payee.getPayeeReference());
      fxPayee.setPayeeSendingBankInstructions(payee.getPayeeSendingBankInstructions());
    }
    return fxPayee;
  }

  private PayeeDetail payeeDetiailFromFXPayee(FXPayee fxPayee) {
    PayeeDetail payee = new PayeeDetail();
    if ( null != fxPayee ) {
      payee.setOriginatorID(fxPayee.getOriginatorID());
      payee.setPayeeAccountIBANNumber(fxPayee.getPayeeAccountIBANNumber());
      payee.setPayeeAddress1(fxPayee.getPayeeAddress1());
      payee.setPayeeAddress2(fxPayee.getPayeeAddress2());
      payee.setPayeeBankBankCode(fxPayee.getPayeeBankBankCode());
      payee.setPayeeBankCity(fxPayee.getPayeeBankCity());
      payee.setPayeeBankCountryID(fxPayee.getPayeeBankCountryID());
      payee.setPayeeBankName(fxPayee.getPayeeBankName());
      payee.setPayeeBankPostalCode(fxPayee.getPayeeBankPostalCode());
      payee.setPayeeBankProvince(fxPayee.getPayeeBankProvince());
      payee.setPayeeBankRoutingCode(fxPayee.getPayeeBankRoutingCode());
      payee.setPayeeBankRoutingType(fxPayee.getPayeeBankRoutingType());
      payee.setPayeeBankSwiftCode(fxPayee.getPayeeBankSwiftCode());
      payee.setPayeeCity(fxPayee.getPayeeCity());
      payee.setPayeeCountryID(fxPayee.getPayeeCountryID());
      payee.setPayeeEmail(fxPayee.getPayeeEmail());
      payee.setPayeeID(fxPayee.getPayeeId());
      payee.setPayeeInterBankAddress1(fxPayee.getPayeeInterBankAddress1());
      payee.setPayeeInterBankAddress2(fxPayee.getPayeeInterBankAddress2());
      payee.setPayeeInterBankBankCode(fxPayee.getPayeeInterBankBankCode());
      payee.setPayeeInterBankCity(fxPayee.getPayeeInterBankCity());
      payee.setPayeeInterBankCountryID(fxPayee.getPayeeInterBankCountryID());
      payee.setPayeeInterBankName(fxPayee.getPayeeInterBankName());
      payee.setPayeeInterBankPostalCode(fxPayee.getPayeeInterBankPostalCode());
      payee.setPayeeInterBankProvince(fxPayee.getPayeeInterBankProvince());
      payee.setPayeeInterBankRoutingCode(fxPayee.getPayeeInterBankRoutingCode());
      payee.setPayeeInterBankRoutingCodeType(fxPayee.getPayeeInterBankRoutingCodeType());
      payee.setPayeeName(fxPayee.getPayeeName());
      payee.setPayeePostalCode(fxPayee.getPayeePostalCode());
      payee.setPayeeReference(fxPayee.getPayeeReference());
      payee.setPayeeSendingBankInstructions(fxPayee.getPayeeSendingBankInstructions());
    }
    return payee;
  }

  private FXPayee convertPayeeDetailToFXPayee(PayeeDetail payee) {
    FXPayee fxPayee = new FXPayee();
    if ( null != payee ) {
      fxPayee.setOriginatorID(payee.getOriginatorID());
      fxPayee.setPayeeAccountIBANNumber(payee.getPayeeAccountIBANNumber());
      fxPayee.setPayeeAddress1(payee.getPayeeAddress1());
      fxPayee.setPayeeAddress2(payee.getPayeeAddress2());
      fxPayee.setPayeeBankBankCode(payee.getPayeeBankBankCode());
      fxPayee.setPayeeBankCity(payee.getPayeeBankCity());
      fxPayee.setPayeeBankCountryID(payee.getPayeeBankCountryID());
      fxPayee.setPayeeBankName(payee.getPayeeBankName());
      fxPayee.setPayeeBankPostalCode(payee.getPayeeBankPostalCode());
      fxPayee.setPayeeBankProvince(payee.getPayeeBankProvince());
      fxPayee.setPayeeBankRoutingCode(payee.getPayeeBankRoutingCode());
      fxPayee.setPayeeBankRoutingType(payee.getPayeeBankRoutingType());
      fxPayee.setPayeeBankSwiftCode(payee.getPayeeBankSwiftCode());
      fxPayee.setPayeeCity(payee.getPayeeCity());
      fxPayee.setPayeeCountryID(payee.getPayeeCountryID());
      fxPayee.setPayeeEmail(payee.getPayeeEmail());
      fxPayee.setPayeeId(payee.getPayeeID());
      fxPayee.setPayeeInterBankAddress1(payee.getPayeeInterBankAddress1());
      fxPayee.setPayeeInterBankAddress2(payee.getPayeeInterBankAddress2());
      fxPayee.setPayeeInterBankBankCode(payee.getPayeeInterBankBankCode());
      fxPayee.setPayeeInterBankCity(payee.getPayeeInterBankCity());
      fxPayee.setPayeeInterBankCountryID(payee.getPayeeInterBankCountryID());
      fxPayee.setPayeeInterBankName(payee.getPayeeInterBankName());
      fxPayee.setPayeeInterBankPostalCode(payee.getPayeeInterBankPostalCode());
      fxPayee.setPayeeInterBankProvince(payee.getPayeeInterBankProvince());
      fxPayee.setPayeeInterBankRoutingCode(payee.getPayeeInterBankRoutingCode());
      fxPayee.setPayeeInterBankRoutingCodeType(payee.getPayeeInterBankRoutingCodeType());
      fxPayee.setPayeeName(payee.getPayeeName());
      fxPayee.setPayeePostalCode(payee.getPayeePostalCode());
      fxPayee.setPayeeReference(payee.getPayeeReference());
      fxPayee.setPayeeSendingBankInstructions(payee.getPayeeSendingBankInstructions());
    }
    return fxPayee;
  }

}
