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
      GeneralRequestResponse generalRequestResponse = spsProcessor.GeneralReqService(generateTestGeneralRequest());
      System.out.println("generalRequestResponse: " + generalRequestResponse);
    } catch (ClientErrorException e) {
      System.out.println("Error: " + e.getError());
    } catch (HostErrorException e) {
      System.out.println("Error: " + e.getError());
    }

    try {
      System.out.println("Batch Request: " + generateTestBatchDetailRequest());
      BatchDetailGeneralResponse batchDetailGeneralResponse = spsProcessor.BatchDetailReqService(generateTestBatchDetailRequest());
      System.out.println("batchDetailGeneralResponse: " + batchDetailGeneralResponse);
    } catch (ClientErrorException e) {
      System.out.println("Error: " + e.getError());
    } catch (HostErrorException e) {
      System.out.println("Error: " + e.getError());
    }

    try {
      System.out.println("Batch Detail Request: " + generateTestDetailResponseRequest());
      DetailResponse detailResponse = spsProcessor.DetailInfoService(generateTestDetailResponseRequest());
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
    UserInfo userInfo = new UserInfo();

    generalRequestPacket.setMsgType(20);
    generalRequestPacket.setPacketType(2010);
    generalRequestPacket.setMsgModifierCode(10);
    generalRequestPacket.setLocalTransactionTime("20180820115959");
    generalRequestPacket.setTID("ZYX80");

    // user info
    userInfo.setName("John Jones");
    userInfo.setAcct("C");
    userInfo.setOther("1234567890-0001");
    userInfo.setLocation("NANOPAY");
    userInfo.setType("P");
    userInfo.setSecc("WEB");
    userInfo.setPtc("S");
    generalRequestPacket.setUserInfo(userInfo);

    generalRequestPacket.setMICR("");
    generalRequestPacket.setRouteCode("122000247");
    generalRequestPacket.setAccount("9988998899");
    generalRequestPacket.setCheckNum("9999");
    generalRequestPacket.setAmount("550.00");
    generalRequestPacket.setInvoice("");
    generalRequestPacket.setClerkID("");
    generalRequestPacket.setSocialSecurityNum("");
    generalRequestPacket.setItemID("123456789012");
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
    batchDetailRequestPacket.setLocalTransactionTime("20180813115959");
    batchDetailRequestPacket.setTID("ZYX80");

    batchDetailRequestPacket.setOptionallyEnteredDate("");
    batchDetailRequestPacket.setCheckApprovalCount("");
    batchDetailRequestPacket.setCheckApprovalAmount("");
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
    batchDetailRequestPacket.setLocalTransactionTime("20180813115959");
    batchDetailRequestPacket.setTID("ZYX80");

    batchDetailRequestPacket.setOptionallyEnteredDate("");
    batchDetailRequestPacket.setCheckApprovalCount("");
    batchDetailRequestPacket.setCheckApprovalAmount("");
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
