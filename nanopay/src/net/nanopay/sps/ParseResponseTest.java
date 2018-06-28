package net.nanopay.sps;

import foam.core.FObject;
import net.nanopay.sps.model.GeneralRequestResponse;

public class ParseResponseTest {

  public FObject parseTest() {
    String test = "\u000220\u001C2011\u001C10\u001CA10\u001COKAY N162       \u001C1\u001C138309825\u001C007098990\u001C122000247\u001C9988998899\u001C9999\u001C550.00\u001C\u001C\u001C20180619115959\u001C1\u0003\n";

    GeneralRequestResponse generalRequestResponse = new GeneralRequestResponse();



    try {
      generalRequestResponse.parseSPSResponse(test);
    } catch (IllegalAccessException | InstantiationException e) {
      e.printStackTrace();
    }

    return generalRequestResponse;
  }

}
