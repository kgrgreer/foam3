package net.nanopay.plaid;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.mlang.MLang;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import net.nanopay.plaid.model.PlaidItem;
import net.nanopay.plaid.model.PlaidWebhook;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.stream.Collectors;

public class PlaidWebAgent implements WebAgent {
  @Override
  public void execute(X x) {
    HttpServletRequest request = x.get(HttpServletRequest.class);
    JSONParser jsonParser = new JSONParser();

    try {
      String       webhookBody = request.getReader().lines().collect(Collectors.joining());
      PlaidWebhook webhook     = (PlaidWebhook) jsonParser.parseString(webhookBody, PlaidWebhook.class);

      if ( webhook.getWebhook_type().equals("ITEM") ) {
        handleItemWebhook(x, webhook);
      }

    } catch (IOException e) {
      Logger logger = (Logger) x.get("logger");
      logger.log(e);
    }
  }

  private void handleItemWebhook(X x, PlaidWebhook webhook) {
    if ( webhook.getWebhook_code().equals("ERROR") ) {
      new PlaidErrorHandler(x, webhook.getItem_id()).handleError(webhook.getError());
    }
  }
}
