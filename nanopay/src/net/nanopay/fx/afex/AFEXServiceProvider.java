package net.nanopay.fx.afex;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.bank.BankAccount;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;
import java.util.Date;

public class AFEXServiceProvider extends ContextAwareSupport implements FXService, PaymentService {

  private  AFEX afexClient;
  protected DAO fxQuoteDAO_;
  private  X x;

  public AFEXServiceProvider(X x, final AFEX afexClient) {
    this.afexClient = afexClient;
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    this.x = x;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
    String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();
    GetQuoteRequest quoteRequest = new GetQuoteRequest();
    Long amount = sourceAmount > 0 ? sourceAmount : destinationAmount;
    quoteRequest.setAmount(String.valueOf(amount));
    quoteRequest.setCurrencyPair(targetCurrency + sourceCurrency);
    quoteRequest.setValueDate(getValueDate(targetCurrency, sourceCurrency));
    try {
      Quote quote = this.afexClient.getQuote(quoteRequest);
      if ( null != quote ) {
        fxQuote.setRate(quote.getRate());
        fxQuote = (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
      }

    } catch(Exception e) {
      // Log here
    }

    return fxQuote;
  }

  private String getValueDate(String targetCurrency, String sourceCurrency ) {
    String valueDate = null;
    try {
      valueDate = this.afexClient.getValueDate(targetCurrency + sourceCurrency, "CASH");
    } catch(Exception e) {
      // Log here
    }
    return valueDate;
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    // TODO: Decide whether to create Trade here?
    return true;
  }

  public void addPayee(long userId, long bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    Address userAddress = user.getAddress(); 
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );
    
    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getBankAddress(); 
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    // Check payee does not already exists on AFEX
    GetPayeeInfoResponse payeeInfoResponse = this.afexClient.getPayeeInfo(String.valueOf(userId));
    if ( null == payeeInfoResponse ) {
      AddPayeeRequest addPayeeRequest = new AddPayeeRequest();
      addPayeeRequest.setBankAccountNumber(bankAccount.getAccountNumber());
      addPayeeRequest.setBankCountryCode(bankAddress.getCountryId());
      //addPayeeRequest.setBankName(bankAccount.get);
      addPayeeRequest.setBankRoutingCode(bankAccount.getRoutingCode(this.x));
      addPayeeRequest.setBeneficiaryAddressLine1(bankAddress.getAddress());
      addPayeeRequest.setBeneficiaryCity(userAddress.getCity());
      addPayeeRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
      addPayeeRequest.setBeneficiaryName(user.getLegalName());
      addPayeeRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
      addPayeeRequest.setBeneficiaryRegion(userAddress.getRegionId());
      addPayeeRequest.setCurrency(bankAccount.getDenomination());
      addPayeeRequest.setVendorId(String.valueOf(userId));

      try {
        AddPayeeResponse addPayeeResponse = this.afexClient.addPayee(addPayeeRequest);
        if ( null == addPayeeResponse ) throw new RuntimeException("Null response got for remote system." );
        if ( addPayeeResponse.getCode() != 200 ) throw new RuntimeException("Unable to create Beneficiary at this time. " +  addPayeeResponse.getInformationMessage());
      } catch(Throwable t) {
        ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
      }
    }
  }

  public void updatePayee(long userId, long bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    Address userAddress = user.getAddress(); 
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );
    
    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getBankAddress(); 
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    UpdatePayeeRequest updatePayeeRequest = new UpdatePayeeRequest();
    updatePayeeRequest.setBankAccountNumber(bankAccount.getAccountNumber());
    updatePayeeRequest.setBankCountryCode(bankAddress.getCountryId());
    //updatePayeeRequest.setBankName(bankAccount.get);
    updatePayeeRequest.setBankRoutingCode(bankAccount.getRoutingCode(this.x));
    updatePayeeRequest.setBeneficiaryAddressLine1(bankAddress.getAddress());
    updatePayeeRequest.setBeneficiaryCity(userAddress.getCity());
    updatePayeeRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
    updatePayeeRequest.setBeneficiaryName(user.getLegalName());
    updatePayeeRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
    updatePayeeRequest.setBeneficiaryRegion(userAddress.getRegionId());
    updatePayeeRequest.setCurrency(bankAccount.getDenomination());
    updatePayeeRequest.setVendorId(String.valueOf(userId));

    try {
      UpdatePayeeResponse updatePayeeResponse = this.afexClient.updatePayee(updatePayeeRequest);
      if ( null == updatePayeeResponse ) throw new RuntimeException("Null response got for remote system." );
      if ( updatePayeeResponse.getCode() != 0 ) throw new RuntimeException("Unable to update Beneficiary at this time. " +  updatePayeeResponse.getInformationMessage());
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }    

  }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {}

  public GetPayeeInfoResponse getPayeeInfo(String payeeUserId) throws RuntimeException {
    GetPayeeInfoResponse payeeInfo = null;
    try {
      payeeInfo = this.afexClient.getPayeeInfo(payeeUserId);
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }
    return payeeInfo;
  }

  public Transaction submitPayment(Transaction transaction) throws RuntimeException{
    // TODO
    return null;
  }

}