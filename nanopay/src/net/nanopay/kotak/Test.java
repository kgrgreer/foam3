package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.kotak.model.paymentRequest.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;


public class Test implements ContextAgent {
  @Override
  public void execute(X x) {
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");

    try {
      RequestHeaderType requestHeader = new RequestHeaderType();
      requestHeader.setMessageId("171004081257000_3107");
      requestHeader.setMsgSource("MUTUALIND");
      requestHeader.setClientCode("TEMPTEST1");
      requestHeader.setBatchRefNmbr("171004081257000_3106");

      InstrumentListType instrumentList = new InstrumentListType();
      InstrumentType instrument1 = new InstrumentType();
      instrument1.setInstRefNo("171004081257000_3106");
      instrument1.setMyProdCode("NETPAY");
      instrument1.setTxnAmnt(99.5);
      instrument1.setAccountNo("09582650000173");
      instrument1.setPaymentDt(format.parse("2017-10-04"));
      instrument1.setRecBrCd("BOFA0BG3978");
      instrument1.setBeneAcctNo("1234569874");
      instrument1.setBeneName("INDIA TEST TEST");
      instrument1.setBeneAddr1("IND");
      instrument1.setCity("IND");
      instrument1.setZip("0");
      instrument1.setCountry("INDIA");
      instrument1.setInstDt(format.parse("2017-10-04"));
      instrument1.setPaymentDtl1("LONDON");
      instrument1.setPaymentDtl2("UNITED KINGDOM");

      EnrichmentSetType enrichmentSet = new EnrichmentSetType();
      enrichmentSet.setEnrichment(new String[]{"TEST CLIENT~SAVING~TEST~09582650000173~FAMILY_MAINTENANCE~1234569874", "aabbcc"});
      //enrichmentSet.setEnrichment();

      instrument1.setEnrichmentSet(enrichmentSet);

      instrumentList.setInstrument(new InstrumentType[]{instrument1});

      InitiateRequest request = new InitiateRequest();
      request.setRequestHeader(requestHeader);
      request.setInstrumentList(instrumentList);

      KotakService kotakService = new KotakService(x);
      kotakService.initiatePayment(request);

    } catch (ParseException e) {
      e.printStackTrace();
    }


  }
}
