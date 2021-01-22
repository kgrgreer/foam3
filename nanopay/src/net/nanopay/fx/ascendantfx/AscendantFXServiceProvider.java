package net.nanopay.fx.ascendantfx;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.NanoService;
import foam.nanos.auth.Address;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FXDirection;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.ascendantfx.model.AcceptAndSubmitDealTBAResult;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest;
import net.nanopay.fx.ascendantfx.model.AcceptQuoteResult;
import net.nanopay.fx.ascendantfx.model.Deal;
import net.nanopay.fx.ascendantfx.model.DealDetail;
import net.nanopay.fx.ascendantfx.model.Direction;
import net.nanopay.fx.ascendantfx.model.GetQuoteRequest;
import net.nanopay.fx.ascendantfx.model.GetQuoteResult;
import net.nanopay.fx.ascendantfx.model.GetQuoteTBARequest;
import net.nanopay.fx.ascendantfx.model.GetQuoteTBAResult;
import net.nanopay.fx.ascendantfx.model.Payee;
import net.nanopay.fx.ascendantfx.model.PayeeDetail;
import net.nanopay.fx.ascendantfx.model.PayeeOperationRequest;
import net.nanopay.fx.ascendantfx.model.PayeeOperationResult;
import net.nanopay.fx.ascendantfx.model.SubmitDealRequest;
import net.nanopay.fx.ascendantfx.model.SubmitDealResult;
import net.nanopay.meter.clearing.ClearingTimeService;
import net.nanopay.model.Business;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class AscendantFXServiceProvider extends ContextAwareSupport implements FXService, PaymentService, NanoService {

  public static final Long AFX_SUCCESS_CODE = 200l;
  public static final String DEFAULT_AFX_PAYMENT_METHOD = "ACH"; // REVEIW: This should be dynamic based on request eventtually. But this works for lunch pending when there is more clarity
  private  AscendantFX ascendantFX;
  protected DAO fxQuoteDAO_;
  private  X x;

  public AscendantFXServiceProvider(){

  }

  @Override
  public void start() {
    this.x = getX();
    this.ascendantFX  = (AscendantFX) x.get("ascendantFX");
    this.fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");

  }

  public AscendantFXServiceProvider(X x, final AscendantFX ascendantFX) {
    this.ascendantFX = ascendantFX;
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    this.x = x;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
      String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {

    return getFXRateWithPaymentMethod(sourceCurrency, targetCurrency, sourceAmount, destinationAmount,
      fxDirection, valueDate, user, fxProvider, DEFAULT_AFX_PAYMENT_METHOD);

  }

  public FXQuote getFXRateWithPaymentMethod(String sourceCurrency, String targetCurrency, Long sourceAmount,  Long destinationAmount,
      String fxDirection, String valueDate, long user, String fxProvider, String paymentMethod) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();

    try {
      // Get orgId
      String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, user);

      //Convert to AscendantFx Request
      GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
      getQuoteRequest.setMethodID("AFXEWSGQ");
      getQuoteRequest.setOrgID(orgId);
      getQuoteRequest.setTotalNumberOfPayment(1);

      Deal deal = new Deal();
      Direction direction = Direction.valueOf(fxDirection);
      deal.setDirection(direction);
      deal.setFxAmount(toDecimal(destinationAmount));
      deal.setSettlementAmount(toDecimal(sourceAmount));
      deal.setFxCurrencyID(targetCurrency);
      deal.setSettlementCurrencyID(sourceCurrency);
      deal.setPaymentMethod(DEFAULT_AFX_PAYMENT_METHOD);
      deal.setPaymentSequenceNo(1);

      List<Deal> deals = new ArrayList<Deal>();
      deals.add(deal);
      Deal[] dealArr = new Deal[deals.size()];
      getQuoteRequest.setPayment(deals.toArray(dealArr));

      GetQuoteResult getQuoteResult = this.ascendantFX.getQuote(getQuoteRequest);
      if ( null == getQuoteResult ) throw new RuntimeException("No response from AscendantFX");

      if ( getQuoteResult.getErrorCode() != 0 ) throw new RuntimeException("Unable to get FX Quote from AscendantFX " + getQuoteResult.getErrorMessage());

      //Convert to FXQUote
      fxQuote.setExternalId(String.valueOf(getQuoteResult.getQuote().getID()));
      fxQuote.setSourceCurrency(sourceCurrency);
      fxQuote.setTargetCurrency(targetCurrency);
      fxQuote.setStatus(ExchangeRateStatus.QUOTED.getName());

      Deal[] dealResult = getQuoteResult.getPayment();
      if ( dealResult.length > 0 ) {
        Deal aDeal = dealResult[0];

        fxQuote.setRate(aDeal.getRate());
        fxQuote.setExpiryTime(getQuoteResult.getQuote().getExpiryTime());
        fxQuote.setTargetAmount(fromDecimal(aDeal.getFxAmount()));
        fxQuote.setSourceAmount(fromDecimal(aDeal.getSettlementAmount()));
        fxQuote.setFee(fromDecimal(aDeal.getFee()));
        fxQuote.setFeeCurrency(aDeal.getSettlementCurrencyID());
        fxQuote.setPaymentMethod(DEFAULT_AFX_PAYMENT_METHOD);
      }

      fxQuote = (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
    } catch (Exception e) {
      ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", e);
      throw new RuntimeException(e);
    }

    return fxQuote;

  }

  public double getFXSpotRate(String sourceCurrency, String targetCurrency, long userId) throws RuntimeException {
    throw new RuntimeException("Missing implementation");
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    boolean result = false;
    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quoteId));
    if  ( null == quote ) throw new RuntimeException("FXQuote not found with Quote ID:  " + quoteId);
    quote = (FXQuote) quote.fclone();

    // Check FXDeal has not expired
    validateDealExpiryDate(quote.getExpiryTime());

    // Get orgId
    String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, user);

    //Build Ascendant Request
    AcceptQuoteRequest request = new AcceptQuoteRequest();
    request.setMethodID("AFXEWSAQ");
    request.setOrgID(orgId);
    request.setQuoteID(Long.parseLong(quote.getExternalId()));

    AcceptQuoteResult acceptQuoteResult = this.ascendantFX.acceptQuote(request);
    if ( null != acceptQuoteResult && acceptQuoteResult.getErrorCode() == 0 ) {
      quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
      fxQuoteDAO_.put_(x, quote);
      result = true;
    }

    return result;
  }

  public void addPayee(long userId, String bankAccount, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) {
      throw new RuntimeException("Unable to find User " + userId);
    }

    // Get orgId
    String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, sourceUser);

    PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
    ascendantRequest.setMethodID("AFXEWSPOA");
    ascendantRequest.setOrgID(orgId);

    PayeeDetail ascendantPayee = getPayeeDetail(user, bankAccount, orgId);
    PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
    ascendantPayeeArr[0] = ascendantPayee;
    ascendantRequest.setPayeeDetail(ascendantPayeeArr);

    PayeeOperationResult ascendantResult = this.ascendantFX.addPayee(ascendantRequest);
    if ( null == ascendantResult ) throw new RuntimeException("No response from AscendantFX");
    if ( ascendantResult.getErrorCode() == 0 ) {
      DAO ascendantUserPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
      AscendantUserPayeeJunction userPayeeJunction = new AscendantUserPayeeJunction.Builder(x).build();
      userPayeeJunction.setUser(userId);
      userPayeeJunction.setAscendantPayeeId(ascendantResult.getPayeeId());
      userPayeeJunction.setOrgId(orgId);
      ascendantUserPayeeJunctionDAO.put(userPayeeJunction);
    } else{
      throw new RuntimeException("Unable to Add Payee to AscendantFX Organization: " + ascendantResult.getErrorMessage() );
    }

  }

  public void updatePayee(long userId, String bankAccount, long sourceUser) throws RuntimeException {
      User user = User.findUser(x, userId);
      if ( null == user ) {
        throw new RuntimeException("Unable to find User " + userId);
      }

      // Get orgId
      String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, sourceUser);

      AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(orgId, userId);
      if ( ! SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
        PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
        ascendantRequest.setMethodID("AFXEWSPOE");
        ascendantRequest.setOrgID(orgId);

        PayeeDetail ascendantPayee = getPayeeDetail(user, bankAccount, orgId);
        ascendantPayee.setPayeeID(Integer.parseInt(userPayeeJunction.getAscendantPayeeId()));
        PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
        ascendantPayeeArr[0] = ascendantPayee;
        ascendantRequest.setPayeeDetail(ascendantPayeeArr);

        PayeeOperationResult ascendantResult = this.ascendantFX.updatePayee(ascendantRequest);
        if ( null == ascendantResult ) throw new RuntimeException("No response from AscendantFX");
        if ( ascendantResult.getErrorCode() == 0 ) {
          DAO ascendantUserPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
          userPayeeJunction = (AscendantUserPayeeJunction) userPayeeJunction.fclone();
          userPayeeJunction.setUser(userId);
          userPayeeJunction.setAscendantPayeeId(ascendantResult.getPayeeId());
          userPayeeJunction.setOrgId(orgId);
          ascendantUserPayeeJunctionDAO.put(userPayeeJunction);
        }
      }

    }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {
    // Get orgId
    String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, payerUserId);

    User user = User.findUser(x, payeeUserId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + payeeUserId);

    AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(orgId, payeeUserId);
    if ( userPayeeJunction != null && ! SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
      PayeeOperationRequest ascendantRequest = new PayeeOperationRequest();
      ascendantRequest.setMethodID("AFXEWSPOD");
      ascendantRequest.setOrgID(orgId);

      PayeeDetail ascendantPayee = new PayeeDetail();
      ascendantPayee.setPaymentMethod(DEFAULT_AFX_PAYMENT_METHOD);
      ascendantPayee.setOriginatorID(orgId);
      ascendantPayee.setPayeeID(Integer.parseInt(userPayeeJunction.getAscendantPayeeId()));
      ascendantPayee.setPayeeInternalReference(String.valueOf(payeeUserId));
      PayeeDetail[] ascendantPayeeArr = new PayeeDetail[1];
      ascendantPayeeArr[0] = ascendantPayee;
      ascendantRequest.setPayeeDetail(ascendantPayeeArr);

      PayeeOperationResult ascendantResult = this.ascendantFX.deletePayee(ascendantRequest);

      if ( null == ascendantResult ) throw new RuntimeException("No response from AscendantFX");
      if ( ascendantResult.getErrorCode() != 0 )
        throw new RuntimeException("Unable to Delete Payee from AscendantFX Organization: " + ascendantResult.getErrorMessage());

      DAO ascendantUserPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
      ascendantUserPayeeJunctionDAO.remove_(x, userPayeeJunction);

    }

  }

  public Transaction submitPayment(Transaction transaction) throws RuntimeException {
    if ( (transaction instanceof AscendantFXTransaction) ) {
      AscendantFXTransaction ascendantTransaction = (AscendantFXTransaction) transaction.fclone();
      ascendantTransaction.setStatus(TransactionStatus.SENT);
      ((Agency) x.get("threadPool")).submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          submitAFXPayment(x, ascendantTransaction);
        }
      }, "");
      return ascendantTransaction;
    }
    return transaction;
  }

  protected void submitAFXPayment(X x, AscendantFXTransaction transaction) {
    Logger logger = (Logger) this.x.get("logger");
    try {
      if ( (transaction instanceof AscendantFXTransaction) ) {
        AscendantFXTransaction ascendantTransaction = (AscendantFXTransaction) transaction.fclone();
        User payee = User.findUser(x, ascendantTransaction.getPayeeId());
        if ( null == payee ) throw new RuntimeException("Unable to find User for Payee " + ascendantTransaction.getPayeeId());

        User payer = User.findUser(x, ascendantTransaction.getPayerId());
        if ( null == payer ) throw new RuntimeException("Unable to find User for Payer " + ascendantTransaction.getPayerId());

        FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(ascendantTransaction.getFxQuoteId()));
        if  ( null == quote ) throw new RuntimeException("FXQuote not found with Quote ID:  " + ascendantTransaction.getFxQuoteId());

        // Get orgId
        String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, ascendantTransaction.getPayerId());

        AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(orgId, payee.getId());

        // Check FXDeal has not expired
        validateDealExpiryDate(ascendantTransaction.getFxExpiry());

        boolean payerHasHoldingAccount = getUserAscendantFXUserHoldingAccount(payer.getId(),ascendantTransaction.getDestinationCurrency()).isPresent();

        //Build Ascendant Request
        SubmitDealRequest ascendantRequest = new SubmitDealRequest();
        ascendantRequest.setMethodID("AFXEWSSD");
        ascendantRequest.setOrgID(orgId);
        ascendantRequest.setQuoteID(Long.parseLong(quote.getExternalId()));
        ascendantRequest.setTotalNumberOfPayment(1);

        String fxDirection = payerHasHoldingAccount ? FXDirection.SELL.getName() :  FXDirection.BUY.getName();

        DealDetail[] dealArr = new DealDetail[1];
        DealDetail dealDetail = new DealDetail();
        dealDetail.setDirection(Direction.valueOf(fxDirection));

        dealDetail.setFee(0);
        dealDetail.setFxAmount(toDecimal(ascendantTransaction.getDestinationAmount()));
        dealDetail.setFxCurrencyID(ascendantTransaction.getDestinationCurrency());
        dealDetail.setPaymentMethod(DEFAULT_AFX_PAYMENT_METHOD);
        dealDetail.setPaymentSequenceNo(1);
        dealDetail.setRate(ascendantTransaction.getFxRate());
        dealDetail.setSettlementAmount(toDecimal(ascendantTransaction.getAmount()));
        dealDetail.setSettlementCurrencyID(ascendantTransaction.getSourceCurrency());
        dealDetail.setInternalNotes("");

        // We won't send Payee if Payer has holding account
        if ( ! payerHasHoldingAccount ) {
          // If Payee is not already linked to Payer, then Add Payee
          if ( null == userPayeeJunction || SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
            addPayee(payee.getId(), ascendantTransaction.getDestinationAccount(), payer.getId());
            userPayeeJunction = getAscendantUserPayeeJunction(orgId, payee.getId()); // REVEIW: Don't like to look-up twice
          } else if ( accountDataIsStale(ascendantTransaction.getDestinationAccount(), userPayeeJunction) ) {
            updatePayee(payee.getId(), ascendantTransaction.getDestinationAccount(), payer.getId());
          }

          Payee ppayee = new Payee();
          ppayee.setPayeeID(Integer.parseInt(userPayeeJunction.getAscendantPayeeId()));
          dealDetail.setPayee(ppayee);

        }

        dealArr[0] = dealDetail;
        ascendantRequest.setPaymentDetail(dealArr);

        SubmitDealResult submittedDealResult = this.ascendantFX.submitDeal(ascendantRequest);
        if ( null == submittedDealResult ) {
          logger.error("No response from AscendantFX");
          return;
        }

        if ( submittedDealResult.getErrorCode() != 0 ) {
          if ( null != submittedDealResult.getErrorMessage() &&
              submittedDealResult.getErrorMessage().contains("Deal already submitted")) {
                logger.info(submittedDealResult.getErrorMessage());
          } else {
            throw new RuntimeException(submittedDealResult.getErrorMessage());
          }
        }

        AscendantFXTransaction txn = (AscendantFXTransaction) ascendantTransaction.fclone();
        txn.setExternalInvoiceId(submittedDealResult.getDealID());
        txn.setStatus(TransactionStatus.SENT);
        ClearingTimeService clearingTimeService = (ClearingTimeService) x.get("clearingTimeService");
        txn.setCompletionDate(clearingTimeService.estimateCompletionDateSimple(x, txn));
        ((DAO) x.get("localTransactionDAO")).put_(x, txn);

      }
    } catch (Exception e) {
      logger.error("Error submitting payment to AscendantFX.", e);
      transaction = (AscendantFXTransaction) transaction.fclone();
      transaction.setStatus(TransactionStatus.DECLINED);
      ((DAO) x.get("localTransactionDAO")).put_(x, transaction);
    }
  }

  public Transaction updatePaymentStatus(Transaction transaction) throws RuntimeException{
    return transaction;
  }

  public FXQuote getQuoteTBA(Transaction transaction) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();
    try {
      if ( (transaction instanceof AscendantFXTransaction) ) {
        AscendantFXTransaction ascendantTransaction = (AscendantFXTransaction) transaction;
        FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(ascendantTransaction.getFxQuoteId()));
        if (null == quote) throw new RuntimeException("FXQuote not found with Quote ID:  " + ascendantTransaction.getFxQuoteId());

        Optional<AscendantFXHoldingAccount> holdingAccount = getUserAscendantFXUserHoldingAccount(ascendantTransaction.getPayerId(),ascendantTransaction.getDestinationCurrency());
        if ( ! holdingAccount.isPresent() ) throw new RuntimeException("Ascendant Holding Account not found for Payer:  " + ascendantTransaction.getPayerId() + " with currency: " + ascendantTransaction.getDestinationCurrency());

        AscendantUserPayeeJunction userPayeeJunction = getAscendantUserPayeeJunction(holdingAccount.get().getOrgId(), ascendantTransaction.getPayeeId());
        // If Payee is not already linked to Payer, then Add Payee
        if ( null == userPayeeJunction || SafetyUtil.isEmpty(userPayeeJunction.getAscendantPayeeId()) ) {
          User payee = User.findUser(x, ascendantTransaction.getPayeeId());
          if ( null == payee ) throw new RuntimeException("Unable to find User for Payee " + ascendantTransaction.getPayeeId());

          BankAccount bankAccount = BankAccount.findDefault(x, payee, ascendantTransaction.getDestinationCurrency());
          if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + payee.getId() );

          addPayee(payee.getId(), bankAccount.getId(), ascendantTransaction.getPayerId());
          userPayeeJunction = getAscendantUserPayeeJunction(holdingAccount.get().getOrgId(), ascendantTransaction.getPayeeId()); // REVEIW: Don't like to look-up twice
        }

        GetQuoteTBARequest ascendantRequest = new GetQuoteTBARequest();
        ascendantRequest.setFromAccountNumber(holdingAccount.get().getAccountNumber());
        ascendantRequest.setFxAmount(toDecimal(quote.getSourceAmount()));
        ascendantRequest.setMethodID("AFXWSVIFSQ");
        ascendantRequest.setOrgID(holdingAccount.get().getOrgId());
        ascendantRequest.setToAccountNumber(userPayeeJunction.getAscendantPayeeId());
        ascendantRequest.setSettlementAmount(toDecimal(quote.getTargetAmount()));

        GetQuoteTBAResult result = this.ascendantFX.getQuoteTBA(ascendantRequest);
        if ( null == result ) throw new RuntimeException("No response from AscendantFX");
        if ( result.getErrorCode() != 0 ) throw new RuntimeException(result.getErrorMessage());

        fxQuote.setExternalId(String.valueOf(result.getQuote().getID()));
        fxQuote.setSourceAmount(fromDecimal(result.getFxAmount()));
        fxQuote.setTargetAmount(fromDecimal(result.getSettlementAmount()));
        fxQuote.setFee(fromDecimal(result.getFee()));
        fxQuote.setSourceCurrency(result.getFxCurrencyID());
        fxQuote.setTargetCurrency(result.getSettlementCurrencyID());
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    return fxQuote;
  }


   public String submitQuoteTBA(Long payerId, Long quoteId ) throws RuntimeException {
    try {
      // Get orgId
      String orgId = AscendantFXUser.getUserAscendantFXOrgId(this.x, payerId);

        AcceptQuoteRequest ascendantRequest = new AcceptQuoteRequest();
        ascendantRequest.setMethodID("AFXWSVIFSAS");
        ascendantRequest.setOrgID(orgId);
        ascendantRequest.setQuoteID(quoteId);

        AcceptAndSubmitDealTBAResult result = this.ascendantFX.acceptAndSubmitDealTBA(ascendantRequest);
        if ( null == result ) throw new RuntimeException("No response from AscendantFX");
        if ( result.getErrorCode() != 0 ) throw new RuntimeException(result.getErrorMessage());

        return result.getDealNumber();

    } catch (Exception e) {
      throw new RuntimeException(e);
    }

  }

  private AscendantUserPayeeJunction getAscendantUserPayeeJunction(String orgId, long userId) {
    DAO userPayeeJunctionDAO = (DAO) x.get("ascendantUserPayeeJunctionDAO");
    final AscendantUserPayeeJunction userPayeeJunction = (AscendantUserPayeeJunction) userPayeeJunctionDAO.find(
        MLang.AND(
            MLang.EQ(AscendantUserPayeeJunction.ORG_ID, orgId),
            MLang.EQ(AscendantUserPayeeJunction.USER, userId)
        )
    );
    return userPayeeJunction;
  }

  private PayeeDetail getPayeeDetail(User user, String bankAccountId, String orgId) {
    PayeeDetail payee = new PayeeDetail();
    payee.setPayeeID(0);
    payee.setPaymentMethod(DEFAULT_AFX_PAYMENT_METHOD);

    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    if ( null != user ) {
      payee.setPayeeReference(String.valueOf(user.getId()));
      payee.setCurrencyID(bankAccount.getDenomination());
      payee.setPayeeInternalReference(String.valueOf(user.getId()));
      payee.setOriginatorID(orgId);
      if ( user instanceof Business ) {
        payee.setPayeeName(user.getBusinessName());
      } else if ( user instanceof Contact && ! SafetyUtil.isEmpty(user.getOrganization()) ) {
        payee.setPayeeName(user.getOrganization());
      } else {
        payee.setPayeeName(user.getFirstName() + " " + user.getLastName());
      }
      payee.setPayeeEmail(user.getEmail());
      payee.setPayeeReference(String.valueOf(user.getId()));
      payee.setPayeeBankName(bankAccount.getName());

      if ( null != user.getAddress() ) {
        payee.setPayeeAddress1(user.getAddress().getAddress());
        payee.setPayeeCity(user.getAddress().getCity());
        Region region = user.getAddress().findRegionId(x);
        if ( region != null ) payee.setPayeeProvince(region.getCode());
        Country country = user.getAddress().findCountryId(x);
        if ( country != null ) payee.setPayeeCountryID(country.getCode());
        payee.setPayeePostalCode(user.getAddress().getPostalCode());
      }

      if ( null != bankAccount.getBankAddress() ) {
        Address bankAddress = SafetyUtil.isEmpty(bankAccount.getBankAddress().getAddress()) ? bankAccount.getAddress() : bankAccount.getBankAddress();
        payee.setPayeeBankAddress1(bankAddress.getAddress());
        payee.setPayeeBankCity(bankAddress.getCity());
        Region bankRegion = bankAddress.findRegionId(x);
        if ( bankRegion != null ) payee.setPayeeBankProvince(bankRegion.getCode());
        Country bankCountry = bankAddress.findCountryId(x);
        if ( bankCountry != null ) payee.setPayeeBankCountryID(bankCountry.getCode());
        payee.setPayeeBankPostalCode(bankAddress.getPostalCode());
      }

      //payee.setPayeeBankSwiftCode(institution.getSwiftCode());
      payee.setPayeeAccountIBANNumber(bankAccount.getIban());
      payee.setPayeeBankRoutingCode(bankAccount.getRoutingCode(x));
      payee.setPayeeBankBankCode(bankAccount.getInstitutionNumber());
      payee.setPayeeBankRoutingType(DEFAULT_AFX_PAYMENT_METHOD); //TODO
      payee.setPayeeInterBankRoutingCodeType(""); // TODO

    }

    return payee;
  }

  private Optional<AscendantFXHoldingAccount> getUserAscendantFXUserHoldingAccount(long userId, String currency){
    if ( null == currency ) return Optional.empty();
    final AscendantFXUser ascendantFXUser = new AscendantFXUser.Builder(x).build();
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    ascendantFXUserDAO.where(
                  MLang.EQ(AscendantFXUser.USER, userId)
          ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              ascendantFXUser.setOrgId(((AscendantFXUser) obj).getOrgId());
            }
          });

    for ( AscendantFXHoldingAccount holdingAccount : ascendantFXUser.getHoldingAccounts() ) {
      if ( currency.equalsIgnoreCase(holdingAccount.getCurrency()) ) return Optional.ofNullable(holdingAccount);
    }

    return Optional.empty();
  }

  private void validateDealExpiryDate(Date expiryDate) throws RuntimeException{
    boolean dealHasExpired = false;
    int bufferMinutes = 5;
    Calendar now = Calendar.getInstance();
    now.add(Calendar.MINUTE, bufferMinutes);
    Calendar expiry = Calendar.getInstance();
    expiry.setTime(expiryDate);
    dealHasExpired = (now.after(expiry));
    if ( dealHasExpired )
      throw new RuntimeException("The quoted exchange rate expired. Please submit again.");
  }

  private boolean accountDataIsStale(String  bankAccountId, AscendantUserPayeeJunction payeeJunction) throws RuntimeException{
    if ( null == payeeJunction ) return false;
    if ( null == payeeJunction.getLastModified() ) return true; // We want to update existing payee before this update
    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );
    Calendar accountLastModifiedDate = Calendar.getInstance();
    accountLastModifiedDate.setTime(bankAccount.getLastModified());
    Calendar afxPayeeLastModifiedDate = Calendar.getInstance();
    afxPayeeLastModifiedDate.setTime(payeeJunction.getLastModified());
    return (accountLastModifiedDate.after(afxPayeeLastModifiedDate));
  }

  private Double toDecimal(Long amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.divide(x100).setScale(2,BigDecimal.ROUND_HALF_DOWN).doubleValue();
  }

  private Long fromDecimal(Double amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.multiply(x100).longValueExact();
  }

}
