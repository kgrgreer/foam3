package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.kotak.model.paymentRequest.InitiateRequest;


public class Test implements ContextAgent {
  @Override
  public void execute(X x) {

//    RequestHeaderType requestHeaderType = new RequestHeaderType();
//    requestHeaderType.setMessageId("171004081257000_3107");
//    requestHeaderType.setMsgSource("MUTUALIND");
//    requestHeaderType.setClientCode("TEMPTEST1");
//    requestHeaderType.setBatchRefNmbr("171004081257000_3106");

    InitiateRequest ir = new InitiateRequest();
    KotakService ks = new KotakService(x);
    ks.initiatePayment();
  }
}
