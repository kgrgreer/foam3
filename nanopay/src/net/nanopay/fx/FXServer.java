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
    if ( null == user ) throw new RuntimeException("Unable to find User: " + userId);
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

  public boolean acceptFXRate(String quoteId, long userId) throws RuntimeException {
    boolean accepted = false;
    User user = findUser(userId);
    if ( null == user ) throw new RuntimeException("Unable to find User: " + userId);

    FXQuote existingFXQuote = (FXQuote) this.fxQuoteDAO_.find(quoteId);
    if ( null == existingFXQuote ) throw new RuntimeException("FXQuote not found with quotye ID: " + quoteId);

    FXService fxService = CurrencyFXService.getFXService(getX(), existingFXQuote.getSourceCurrency(), existingFXQuote.getTargetCurrency(), user.getSpid());
    accepted = fxService.acceptFXRate(String.valueOf(existingFXQuote.getId()), userId);

    return accepted;
  }

  public User findUser(long userId) {
    DAO bareUserDAO = (DAO) getX().get("bareUserDAO");
    DAO contactDAO = (DAO) getX().get("contactDAO");
    DAO businessDAO = (DAO) getX().get("businessDAO");
    User user = null;
    Contact contact = null;
    try{
      contact = (Contact) contactDAO.find(userId);
      if ( contact != null && contact.getBusinessId() == 0) {
        user = (User) bareUserDAO.find(AND(
          EQ(User.EMAIL, contact.getEmail()),
          NOT(INSTANCE_OF(Contact.class))));
      } else if ( contact != null && contact.getBusinessId() > 0 ){
        user = (User) businessDAO.find(contact.getBusinessId());
      } else {
        user = (User) bareUserDAO.find(userId);
      }
    } catch(Exception e) {
      e.printStackTrace();
    }
    return user;
  }


}
