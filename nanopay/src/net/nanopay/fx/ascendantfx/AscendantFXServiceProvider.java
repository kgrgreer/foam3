package net.nanopay.fx.ascendantfx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import java.util.ArrayList;
import java.util.List;
import net.nanopay.bank.BankAccount;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteResult;
import net.nanopay.fx.ascendantfx.model.Deal;
import net.nanopay.fx.ascendantfx.model.DealDetail;
import net.nanopay.fx.ascendantfx.model.Direction;
import net.nanopay.fx.ascendantfx.model.GetQuoteRequest;
import net.nanopay.fx.ascendantfx.model.GetQuoteResult;
import net.nanopay.fx.ascendantfx.model.Payee;
import net.nanopay.fx.ascendantfx.model.PayeeDetail;
import net.nanopay.fx.ascendantfx.model.PayeeOperationRequest;
import net.nanopay.fx.ascendantfx.model.PayeeOperationResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealRequest;
import net.nanopay.fx.ExchangeRateFields;
import net.nanopay.fx.ExchangeRateQuote;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FXDeal;
import net.nanopay.fx.FXDirection;
import net.nanopay.fx.FXPayee;
import net.nanopay.fx.FXServiceProvider;
import net.nanopay.fx.FeesFields;
import net.nanopay.fx.SubmitFXDeal;
import net.nanopay.payment.Institution;
import net.nanopay.payment.PaymentService;

public class AscendantFXServiceProvider implements FXServiceProvider, PaymentService {

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

  public Boolean acceptFXRate(String quoteId) throws RuntimeException {
    Boolean result = false;
    //Build Ascendant Request
    AcceptQuoteRequest request = new AcceptQuoteRequest();
    request.setMethodID("AFXEWSAQ");
    request.setOrgID(AFX_ORG_ID);
    request.setQuoteID(Long.parseLong(quoteId));

    AcceptQuoteResult acceptQuoteResult = this.ascendantFX.acceptQuote(request);
    if ( null != acceptQuoteResult && acceptQuoteResult.getErrorCode() == 0 ) {
      result = true;
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

  public void addPayee(long userId) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find_(x, userId);
    BankAccount bankAccount = BankAccount.findDefault(x, user, null);

    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID(AFX_ORG_ID);
    ascendantRequest.setOrgID(AFX_ORG_ID);

    PayeeDetail ascendantPayee = getPayeeDetail(user, bankAccount);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.addPayee(ascendantRequest);
    if ( null != ascendantResult && ascendantResult.getErrorCode() == 0 ) {

      DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
      AscendantFXUser ascendantFXUser = new AscendantFXUser.Builder(x).build();
      ascendantFXUser.setUser(userId);
      ascendantFXUser.setAscendantPayeeId(ascendantResult.getPayeeId());
      ascendantFXUserDAO.put_(x, ascendantFXUser);
    }

  }

  public void submitPayment(long user) {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
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

  private PayeeDetail getPayeeDetail(User user, BankAccount bankAccount) {
    PayeeDetail payee = new PayeeDetail();
    if ( null != user && null != bankAccount ) {
      DAO institutionDAO = (DAO) x.get("institutionDAO");
      Institution institution = (Institution) institutionDAO.find_(x, bankAccount.getInstitution());

      if ( null != institution ) {
        payee.setOriginatorID(AFX_ORG_ID);
        payee.setPayeeAddress1(user.getAddress().getAddress1());
        payee.setPayeeAddress1(user.getAddress().getAddress1());
        payee.setPayeeName(user.getBusinessName());
        payee.setPayeeEmail(user.getEmail());
        payee.setPayeeReference(String.valueOf(user.getId()));
        payee.setPayeeBankName(institution.getName());
        payee.setPayeeBankCountryID(institution.getCountryId());
        payee.setPayeeBankSwiftCode(institution.getSwiftCode());
        payee.setPayeeBankRoutingCode(null); //TODO:
        payee.setPayeeBankRoutingType(null); //TODO
      }


    }
    return payee;
  }

  private String getUserAscendantFXOrgId(long userId){
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    final AscendantFXUser ascendantFXUser = new AscendantFXUser.Builder(x).build();
    ascendantFXUserDAO.where(
              MLang.AND(
                  MLang.EQ(AscendantFXUser.USER, userId)
              )
          ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              ascendantFXUser.setAscendantOrgId(((AscendantFXUser) obj).getAscendantOrgId());
            }
          });
    return ascendantFXUser.getAscendantOrgId();
  }

}
