package net.nanopay.plaid;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import net.nanopay.plaid.model.PlaidError;
import net.nanopay.plaid.model.PlaidItem;

public class PlaidErrorHandler {

  private X x;
  private String itemId;

  public PlaidErrorHandler(X x, String itemId) {
    this.x = x;
    this.itemId = itemId;
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
        break;
    }

  }

  private void handleItemError(PlaidError error) {

    if ( error.getError_code().equals("ITEM_LOGIN_REQUIRED") ) {
      DAO plaidItemDAO = (DAO) x.get("plaidItemDAO");

      ArraySink select = (ArraySink) plaidItemDAO.where(
        MLang.EQ(PlaidItem.ITEM_ID, this.itemId))
        .select(new ArraySink());

      PlaidItem item = (PlaidItem) select.getArray().get(0);
      item = (PlaidItem) item.fclone();
      item.setLoginRequired(true);

      plaidItemDAO.put(item);

      return;
    }
  }

  private void handleRateLimitExceededError(PlaidError error) {

  }

}
