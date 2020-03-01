package net.nanopay.sps;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.sps.exceptions.ClientErrorException;
import net.nanopay.sps.exceptions.HostErrorException;

public class SPSTest implements ContextAgent {

  @Override
  public void execute(X x) {
    SPSProcessor spsProcessor = x.create(SPSProcessor.class);

    try {
      System.out.println("General Request: " + generateTestGeneralRequest());
      GeneralRequestResponse generalRequestResponse = spsProcessor.GeneralReqService(x, generateTestGeneralRequest());
      System.out.println("generalRequestResponse: " + generalRequestResponse);
    } catch (ClientErrorException e) {
      System.out.println("Error: " + e.getError());
    } catch (HostErrorException e) {
      System.out.println("Error: " + e.getError());
    }

    try {
      System.out.println("Batch Request: " + generateTestBatchDetailRequest());
      BatchDetailGeneralResponse batchDetailGeneralResponse = spsProcessor.BatchDetailReqService(x, generateTestBatchDetailRequest());
      System.out.println("batchDetailGeneralResponse: " + batchDetailGeneralResponse);
    } catch (ClientErrorException e) {
      System.out.println("Error: " + e.getError());
    } catch (HostErrorException e) {
      System.out.println("Error: " + e.getError());
    }

    try {
      System.out.println("Batch Detail Request: " + generateTestDetailResponseRequest());
      DetailResponse detailResponse = spsProcessor.DetailInfoService(x, generateTestDetailResponseRequest());
      System.out.println("detailResponse: " + detailResponse);
      DetailResponseItemContent[] items = detailResponse.getItemContent();
      for (DetailResponseItemContent item : items) {
        System.out.println(item);
      }
    } catch (ClientErrorException e) {
      System.out.println("Error: " + e.getError());
    } catch (HostErrorException e) {
      System.out.println("Error: " + e.getError());
    }
  }

  private GeneralRequestPacket generateTestGeneralRequest() {
    GeneralRequestPacket generalRequestPacket = new GeneralRequestPacket();

    generalRequestPacket.setMsgType(20);
    generalRequestPacket.setPacketType(2010);
    generalRequestPacket.setMsgModifierCode(10);
    generalRequestPacket.setLocalTxnTime("20180925115959");
    generalRequestPacket.setTID("ZYX80");

    // txnDetail
    TxnDetail txnDetail = new TxnDetail();
    txnDetail.setName("John Jones");
    txnDetail.setAcct("C");
    txnDetail.setOther("1234567890-0001");
    txnDetail.setLocation("NANOPAY");
    txnDetail.setType("P");
    txnDetail.setSecc("WEB");
    txnDetail.setPtc("S");

    PayerInfo payerInfo = new PayerInfo();
    payerInfo.setFirstName("RICK");
    payerInfo.setLastName("CONE");
    payerInfo.setMiddleInitial("A");
    payerInfo.setPrimaryAddress("801 8TH. ST.");
    payerInfo.setSecondaryAddress("SUITE 150-D");
    payerInfo.setCity("GREELEY");
    payerInfo.setStateAbbreviation("CO");
    payerInfo.setZipCode("80631");
    payerInfo.setCellPhone("9703529434");
    payerInfo.setEmailAddress("RCONE@SECUREPAYMENTSYSTEMS.COM");
    txnDetail.setPayer(payerInfo);

    generalRequestPacket.setTxnDetail(txnDetail);

    generalRequestPacket.setMICR("");
    generalRequestPacket.setRouteCode("122000247");
    generalRequestPacket.setAccount("9988998899");
    generalRequestPacket.setCheckNum("9999");
    generalRequestPacket.setAmount("550.00");
    generalRequestPacket.setInvoice("");
    generalRequestPacket.setClerkId("");
    generalRequestPacket.setSocialSecurityNum("");
    generalRequestPacket.setItemId("123456789012");
    generalRequestPacket.setOptionsSelected("EV");
    generalRequestPacket.setDriversLicense("");
    generalRequestPacket.setDLStateCode("");
    generalRequestPacket.setDateOfBirth("");
    generalRequestPacket.setPhoneNumber("");

    return generalRequestPacket;
  }

  private BatchDetailRequestPacket generateTestBatchDetailRequest() {
    BatchDetailRequestPacket batchDetailRequestPacket = new BatchDetailRequestPacket();

    batchDetailRequestPacket.setMsgType(20);
    batchDetailRequestPacket.setPacketType(2030);
    batchDetailRequestPacket.setMsgModifierCode(40);
    batchDetailRequestPacket.setLocalTxnTime("20180925115959");
    batchDetailRequestPacket.setTID("ZYX80");

    batchDetailRequestPacket.setDateOrBatchId("");
    batchDetailRequestPacket.setApprovalCount("");
    batchDetailRequestPacket.setApprovalAmount("");
    batchDetailRequestPacket.setDeclineCount("");
    batchDetailRequestPacket.setDeclineAmount("");
    batchDetailRequestPacket.setVoidCount("");
    batchDetailRequestPacket.setVoidAmount("");
    batchDetailRequestPacket.setMaxDetailItemsPerTransmission("5");
    batchDetailRequestPacket.setSyncCounter("0");
    batchDetailRequestPacket.setCreditCount("");
    batchDetailRequestPacket.setCreditAmount("");

    return batchDetailRequestPacket;
  }

  private BatchDetailRequestPacket generateTestDetailResponseRequest() {
    BatchDetailRequestPacket batchDetailRequestPacket = new BatchDetailRequestPacket();

    batchDetailRequestPacket.setMsgType(20);
    batchDetailRequestPacket.setPacketType(2030);
    batchDetailRequestPacket.setMsgModifierCode(50);
    batchDetailRequestPacket.setLocalTxnTime("20180925115959");
    batchDetailRequestPacket.setTID("ZYX80");

    batchDetailRequestPacket.setDateOrBatchId("");
    batchDetailRequestPacket.setApprovalCount("");
    batchDetailRequestPacket.setApprovalAmount("");
    batchDetailRequestPacket.setDeclineCount("");
    batchDetailRequestPacket.setDeclineAmount("");
    batchDetailRequestPacket.setVoidCount("");
    batchDetailRequestPacket.setVoidAmount("");
    batchDetailRequestPacket.setMaxDetailItemsPerTransmission("5");
    batchDetailRequestPacket.setSyncCounter("0");
    batchDetailRequestPacket.setCreditCount("");
    batchDetailRequestPacket.setCreditAmount("");

    return batchDetailRequestPacket;
  }
}
