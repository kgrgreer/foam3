package net.nanopay.plaid;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import net.nanopay.plaid.model.PlaidError;
import net.nanopay.plaid.model.PlaidItem;

public class PlaidErrorHandler {

  private X x;
  private String itemId;
  private Logger logger;

  public PlaidErrorHandler(X x, String itemId) {
    this.x = x;
    this.itemId = itemId;
    this.logger = (Logger) x.get("logger");
  }

  public void handleError(PlaidError error) {

    switch ( error.getError_type() ) {
      case "ITEM_ERROR":
        handleItemError(error);
        break;

      case "RATE_LIMIT_EXCEEDED":
        handleRateLimitExceededError(error);
        break;

      default:
        logger.error("Plaid Error: " + error.toJSON());
        throw new RuntimeException("Plaid Error: " + error.toJSON());
    }

  }

  private void handleItemError(PlaidError error) {

    if ( error.getError_code().equals("ITEM_LOGIN_REQUIRED") ) {
      DAO plaidItemDAO = (DAO) x.get("plaidItemDAO");

      PlaidItem item =
        (PlaidItem) plaidItemDAO.inX(x).find(MLang.EQ(PlaidItem.ITEM_ID, this.itemId));

      if ( item != null ) {
        item = (PlaidItem) item.fclone();
        item.setLoginRequired(true);
        plaidItemDAO.put(item);
      }

      return;
    }
  }

  private void handleRateLimitExceededError(PlaidError error) {
    logger.warning("Plaid has exceeded established rate limits");

    String messageBody = "";
    messageBody += "The request has exceeded established rate limits. \n";
    messageBody += error.getError_code()      + "\n";
    messageBody += error.getError_message()   + "\n";
    messageBody += error.getDisplay_message() + "\n";

    EmailMessage message = new EmailMessage();
    message.setSubject("Plaid rate limit exceeded errors");
    message.setBody(messageBody);
    message.setTo(new String[] {"ops@nanopay.net"});

    EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
  }

}
