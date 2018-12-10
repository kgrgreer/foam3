package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.kotak.model.paymentRequest.*;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.reversal.DetailsType;
import net.nanopay.kotak.model.reversal.HeaderType;
import net.nanopay.kotak.model.reversal.Reversal;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;

public class Test implements ContextAgent {
  @Override
  public void execute(X x) {
    KotakService kotakService = new KotakService(x, "https://apigw.kotak.com:8443/cms_generic_service");

    paymentTest(kotakService);
    reversalTest(kotakService);
  }

  private void paymentTest(KotakService kotakService) {
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

      instrument1.setEnrichmentSet(enrichmentSet);

      instrumentList.setInstrument(new InstrumentType[]{instrument1});

      InitiateRequest request = new InitiateRequest();
      request.setRequestHeader(requestHeader);
      request.setInstrumentList(instrumentList);

      AcknowledgementType paymentResult = kotakService.submitPayment(request);
      System.out.println("result: " + paymentResult);
    } catch (ParseException e) {
      e.printStackTrace();
    }
  }


  private void reversalTest(KotakService kotakService) {
    HeaderType header = new HeaderType();
    header.setReq_Id("171004081257000");
    header.setMsg_Src("MUTUALIND");
    header.setClient_Code("TEMPTEST1");
    header.setDate_Post("2017-11-18");
    DetailsType details = new DetailsType();
    details.setMsg_Id(new String[]{"171004081257000_3107"});

    Reversal reversal = new Reversal();
    reversal.setHeader(header);
    reversal.setDetails(details);

    Reversal reversalResult = kotakService.submitReversal(reversal);
    System.out.println("response: " + reversalResult);
    HeaderType responseHeader = reversalResult.getHeader();
    System.out.println("responseHeader: " + responseHeader);
    DetailsType responseDetails = reversalResult.getDetails();
    System.out.println("responseDetails: " + responseDetails);

    System.out.println(Arrays.toString(reversalResult.getDetails().getRev_Detail()));
    System.out.println("length: " + reversalResult.getDetails().getRev_Detail().length);
    System.out.println((reversalResult.getDetails().getRev_Detail())[0].getMsg_Id());
    System.out.println((reversalResult.getDetails().getRev_Detail())[0].getStatus_Code());
    System.out.println((reversalResult.getDetails().getRev_Detail())[0].getStatus_Desc());
    System.out.println((reversalResult.getDetails().getRev_Detail())[0].getUTR());
  }
}
