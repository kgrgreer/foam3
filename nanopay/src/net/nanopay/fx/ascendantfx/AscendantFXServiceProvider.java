package net.nanopay.fx.ascendantfx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
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
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FXDeal;
import net.nanopay.fx.FXDirection;
import net.nanopay.fx.FXPayee;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXServiceProvider;
import net.nanopay.fx.FeesFields;
import net.nanopay.fx.SubmitFXDeal;
import net.nanopay.payment.Institution;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;

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

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, double sourceAmount,
      String fxDirection, String valueDate, long user) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();

    try {
      // Get orgId
      String orgId = getUserAscendantFXOrgId(user);
      if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + user);
      //Convert to AscendantFx Request
      GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
      getQuoteRequest.setMethodID("AFXEWSGQ");
      getQuoteRequest.setOrgID(orgId);
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
        throw new RuntimeException("No response from AscendantFX");
      }

      //Convert to nanopay interface
      fxQuote.setExternalId(String.valueOf(getQuoteResult.getQuote().getID()));
      fxQuote.setSourceCurrency(sourceCurrency);
      fxQuote.setTargetCurrency(targetCurrency);
      fxQuote.setStatus(ExchangeRateStatus.QUOTED.getName());

      Deal[] dealResult = getQuoteResult.getPayment();
      if ( dealResult.length > 0 ) {
        Deal aDeal = dealResult[0];

        fxQuote.setRate(aDeal.getRate());
        fxQuote.setExpiryTime(getQuoteResult.getQuote().getExpiryTime());
        fxQuote.setTargetAmount((aDeal.getFxAmount() - aDeal.getFee()) * fxQuote.getRate());
        fxQuote.setSourceAmount(aDeal.getFxAmount());
        fxQuote.setFee(aDeal.getFee());
        fxQuote.setFeeCurrency(aDeal.getFxCurrencyID());

      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    return fxQuote;

  }

  public Boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    Boolean result = false;
    // Get orgId
    String orgId = getUserAscendantFXOrgId(user);
    if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + user);
    //Build Ascendant Request
    AcceptQuoteRequest request = new AcceptQuoteRequest();
    request.setMethodID("AFXEWSAQ");
    request.setOrgID(orgId);
    request.setQuoteID(Long.parseLong(quoteId));

    AcceptQuoteResult acceptQuoteResult = this.ascendantFX.acceptQuote(request);
    if ( null != acceptQuoteResult && acceptQuoteResult.getErrorCode() == 0 ) {
      result = true;
    }

    return result;
  }

  public void addPayee(long userId, long sourceUser) throws RuntimeException{
    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find_(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);
    BankAccount bankAccount = BankAccount.findDefault(x, user, null);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + user.getId() );
    String orgId = getUserAscendantFXOrgId(sourceUser);

    if ( SafetyUtil.isEmpty(orgId) ) throw new RuntimeException("Unable to find Ascendant Organization ID for User: " + sourceUser);

    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID("AFXEWSPOA");
    ascendantRequest.setOrgID(orgId);

    PayeeDetail ascendantPayee = getPayeeDetail(user, bankAccount, orgId);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.addPayee(ascendantRequest);
    if ( null != ascendantResult && ascendantResult.getErrorCode() == 0 ) {

      DAO ascendantUserPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
      AscendantUserPayeeJunction userPayeeJunction = new AscendantUserPayeeJunction.Builder(x).build();
      userPayeeJunction.setUser(userId);
      userPayeeJunction.setAscendantPayeeId(ascendantResult.getPayeeId());
      userPayeeJunction.setOrgId(orgId);
      ascendantUserPayeeJunctionDAO.put_(x, userPayeeJunction);
    }else{
      throw new RuntimeException("Unable to Add Payee to AscendantFX Organization: " + ascendantResult.getErrorMessage() );
    }

  }

  public void submitPayment(Transaction transaction) throws RuntimeException {
    try {
      if ( (transaction instanceof AscendantFXTransaction) ) {
        AscendantFXTransaction ascendantTransaction = (AscendantFXTransaction) transaction;
        String orgId = getUserAscendantFXOrgId(ascendantTransaction.getPayeeId());
        AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(orgId, ascendantTransaction.getPayeeId());

        // Check FXDeal has not expired
        if ( dealHasExpired(ascendantTransaction.getFxExpiry()) )
          throw new RuntimeException("FX Transaction has expired");


        // If Payee is not already linked to Payer, then Add Payee
        if ( SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
          addPayee(ascendantTransaction.getPayeeId(), ascendantTransaction.getPayerId());
          userPayeeJunction = getAscendantUserPayeeJunction(orgId, ascendantTransaction.getPayeeId()); // REVEIW: Don't like to look-up twice
        }

        //Build Ascendant Request
        SubmitDealRequest ascendantRequest = new SubmitDealRequest();
        ascendantRequest.setMethodID("AFXEWSSD");
        ascendantRequest.setOrgID(orgId);
        ascendantRequest.setQuoteID(Long.parseLong(ascendantTransaction.getFxQuoteId()));
        ascendantRequest.setTotalNumberOfPayment(1);

        DealDetail[] dealArr = new DealDetail[1];
        DealDetail dealDetail = new DealDetail();
        dealDetail.setDirection(Direction.valueOf(FXDirection.Buy.getName()));

        FeesFields fees = ascendantTransaction.getFxFees();
        if ( null != fees ) dealDetail.setFee(fees.getTotalFees());

        dealDetail.setFxAmount(ascendantTransaction.getAmount());
        dealDetail.setFxCurrencyID(ascendantTransaction.getSourceCurrency());
        dealDetail.setPaymentMethod("Wire"); // REVEIW: Wire ?
        dealDetail.setPaymentSequenceNo(1);
        dealDetail.setRate(ascendantTransaction.getFxRate());
        dealDetail.setSettlementAmount(ascendantTransaction.getAmount() * ascendantTransaction.getFxRate());
        dealDetail.setSettlementCurrencyID(ascendantTransaction.getDestinationCurrency());

        Payee payee = new Payee();
        payee.setPayeeID(Integer.parseInt(userPayeeJunction.getAscendantPayeeId()));
        dealDetail.setPayee(payee);

        dealArr[0] = dealDetail;
        ascendantRequest.setPaymentDetail(dealArr);

        SubmitDealResult submittedDealResult = this.ascendantFX.submitDeal(ascendantRequest);
        if ( null == submittedDealResult ) throw new RuntimeException("No response from AscendantFX");

        if ( submittedDealResult.getErrorCode() != 0 )
          throw new RuntimeException(submittedDealResult.getErrorMessage());

      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private AscendantUserPayeeJunction getAscendantUserPayeeJunction(String orgId, long userId){
    DAO userPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
          final AscendantUserPayeeJunction userPayeeJunction = new AscendantUserPayeeJunction.Builder(x).build();
      userPayeeJunctionDAO.where(
        MLang.AND(
            MLang.EQ(AscendantUserPayeeJunction.USER, userId),
            MLang.EQ(AscendantUserPayeeJunction.ORG_ID, orgId)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        userPayeeJunction.setAscendantPayeeId(((AscendantUserPayeeJunction) obj).getAscendantPayeeId());
      }
    });

      return userPayeeJunction;
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

  private PayeeDetail getPayeeDetail(User user, BankAccount bankAccount, String orgId) {
    PayeeDetail payee = new PayeeDetail();
    payee.setPayeeID(0);
    payee.setPaymentMethod("Wire");

    if ( null != user && null != bankAccount ) {
      payee.setPayeeReference(String.valueOf(user.getId()));
      payee.setCurrencyID(bankAccount.getDenomination());
      payee.setPayeeCountryID(user.getAddress().getCountryId());
      DAO institutionDAO = (DAO) x.get("institutionDAO");
      Institution institution = (Institution) institutionDAO.find_(x, bankAccount.getInstitution());

      if ( null != institution ) {
        payee.setPayeeInternalReference(String.valueOf(user.getId()));
        payee.setOriginatorID(orgId);
        payee.setPayeeAddress1(user.getAddress().getAddress1());
        payee.setPayeeName(user.getFirstName() + " " + user.getLastName());
        payee.setPayeeEmail(user.getEmail());
        payee.setPayeeReference(String.valueOf(user.getId()));
        payee.setPayeeBankName(institution.getName());
        payee.setPayeeBankCountryID(institution.getCountryId());
        payee.setPayeeBankSwiftCode(institution.getSwiftCode());
        payee.setPayeeAccountIBANNumber(institution.getInstitutionNumber());
        payee.setPayeeBankRoutingCode(institution.getInstitutionNumber()); //TODO:
        payee.setPayeeBankRoutingType("Wire"); //TODO
        payee.setPayeeInterBankRoutingCodeType(""); // TODO
      }

    }
    return payee;
  }

  private String getUserAscendantFXOrgId(long userId){
    String orgId = null;
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    final AscendantFXUser ascendantFXUser = new AscendantFXUser.Builder(x).build();
    ascendantFXUserDAO.where(
                  MLang.EQ(AscendantFXUser.USER, userId)
          ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              ascendantFXUser.setOrgId(((AscendantFXUser) obj).getOrgId());
            }
          });

    if ( ! SafetyUtil.isEmpty(ascendantFXUser.getOrgId()) ) orgId = ascendantFXUser.getOrgId();

    return orgId;
  }

  private boolean dealHasExpired(Date expiryDate) {
    int bufferMinutes = 5;
    Calendar today = Calendar.getInstance();
    today.add(Calendar.MINUTE, bufferMinutes);

    Calendar expiry = Calendar.getInstance();
    expiry.setTime(expiryDate);

    return (today.after(expiry));
  }

}
