package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.NanoService;
import net.nanopay.contacts.Contact;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.NOT;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.nanos.logger.Logger;

public class FXServer extends ContextAwareSupport implements FXService, NanoService {

  private DAO fxQuoteDAO_;


  @Override
  public void start() {
    this.fxQuoteDAO_ = (DAO) getX().get("fxQuoteDAO");
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount, long destinationAmount,
      String fxDirection, String valueDate, long userId, String fxProvider) throws RuntimeException {

    FXQuote fxQuote = null;

    User user = findUser(userId);
    if ( null == user ) {
      ((Logger) getX().get("logger")).error("Unable to find user: " + userId);
      throw new RuntimeException("Unable to find User: " + userId);
    }
    FXService fxService = CurrencyFXService.getFXService(getX(), sourceCurrency, targetCurrency, user.getSpid());

    try {
      fxQuote = fxService.getFXRate(sourceCurrency, targetCurrency, sourceAmount, destinationAmount,
          fxDirection, valueDate, userId, fxProvider);
    }catch(Throwable t){
      Logger logger = (Logger) getX().get("logger");
      logger.error("Unable to find fx rates", t);
      throw new RuntimeException(t);
    }

    return fxQuote;

  }

  public double getFXSpotRate(String sourceCurrency, String targetCurrency, long userId) throws RuntimeException {
    throw new RuntimeException("Missing implementation");
  }

  public boolean acceptFXRate(String quoteId, long userId) throws RuntimeException {
    boolean accepted = false;
    User user = findUser(userId);
    Logger logger = (Logger) getX().get("logger");

    if ( null == user ) {
      logger.error("Unable to find user: " + userId);
      throw new RuntimeException("Unable to find User: " + userId);
    }

    FXQuote existingFXQuote = (FXQuote) this.fxQuoteDAO_.find(quoteId);
    if ( null == existingFXQuote ) {
      logger.error("FXQuote not found with quote ID: " + quoteId);
      throw new RuntimeException("FXQuote not found with quotye ID: " + quoteId);
    }

    FXService fxService = CurrencyFXService.getFXService(getX(), existingFXQuote.getSourceCurrency(), existingFXQuote.getTargetCurrency(), user.getSpid());
    accepted = fxService.acceptFXRate(String.valueOf(existingFXQuote.getId()), userId);

    return accepted;
  }

  public User findUser(long userId) {
    DAO bareUserDAO = (DAO) getX().get("bareUserDAO");
    DAO contactDAO = (DAO) getX().get("contactDAO");
    DAO localBusinessDAO = (DAO) getX().get("localBusinessDAO");
    User user = null;
    Contact contact = null;
    try{
      contact = (Contact) contactDAO.find(userId);
      if ( contact != null && contact.getBusinessId() == 0) {
        user = (User) bareUserDAO.find(AND(
          EQ(User.EMAIL, contact.getEmail()),
          NOT(INSTANCE_OF(Contact.class))));
      } else if ( contact != null && contact.getBusinessId() > 0 ){
        user = (User) localBusinessDAO.find(contact.getBusinessId());
      } else {
        user = (User) bareUserDAO.find(userId);
      }
    } catch(Exception e) {
      Logger logger = (Logger) getX().get("logger");
      logger.log(e);
    }
    return user;
  }


}
