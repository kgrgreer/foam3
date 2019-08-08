package net.nanopay.kotak;

import net.nanopay.kotak.model.paymentRequest.*;
import net.nanopay.kotak.model.paymentResponse.Acknowledgement;
import net.nanopay.kotak.model.paymentResponse.AcknowledgementType;
import net.nanopay.kotak.model.reversal.DetailsType;
import net.nanopay.kotak.model.reversal.HeaderType;
import net.nanopay.kotak.model.reversal.Reversal;

public class Test {

  public String paymentMessageId;
  public String paymentResponseStatusCode;
  public String paymentResponseStatusRem;
  public String transactionStatusCode;
  public String transactionStatusDesc;

  public void paymentTest(KotakService kotakService,
                          String msgSource,
                          String clientCode,
                          String myProdCode,
                          String payMode,
                          String senderAccountNo,
                          int txnAmnt,
                          String beneAcctNo,
                          String beneName,
                          String IFSCCode,
                          String remitterName,
                          String beneACType,
                          String remitterAddress,
                          String remitterAcNo,
                          String remitPurpose) {
    RequestHeaderType requestHeader = new RequestHeaderType();
    paymentMessageId = KotakUtils.getUniqueId();

    requestHeader.setMessageId(paymentMessageId);
    requestHeader.setMsgSource(msgSource);
    requestHeader.setClientCode(clientCode);
    requestHeader.setBatchRefNmbr(paymentMessageId);

    InstrumentListType instrumentList = new InstrumentListType();
    InstrumentType instrument1 = new InstrumentType();
    instrument1.setInstRefNo(paymentMessageId);
    instrument1.setMyProdCode(myProdCode);
    instrument1.setPayMode(payMode);
    instrument1.setTxnAmnt(txnAmnt);
    instrument1.setAccountNo(senderAccountNo);
    instrument1.setPaymentDt(KotakUtils.getCurrentIndianDate());
    instrument1.setRecBrCd(IFSCCode);
    instrument1.setBeneAcctNo(beneAcctNo);
    instrument1.setBeneName(beneName);

    EnrichmentSetType enrichmentSet = new EnrichmentSetType();
    enrichmentSet.setEnrichment(new String[]{remitterName + "~" + beneACType + "~" + remitterAddress + "~" + remitterAcNo + "~" + remitPurpose + "~~~"});

    instrument1.setEnrichmentSet(enrichmentSet);
    instrumentList.setInstrument(new InstrumentType[]{instrument1});

    Payment request = new Payment();
    request.setRequestHeader(requestHeader);
    request.setInstrumentList(instrumentList);

    AcknowledgementType paymentResponse = kotakService.submitPayment(request);
    Acknowledgement ackHeader = paymentResponse.getAckHeader();

    paymentResponseStatusCode = ackHeader.getStatusCd();
    paymentResponseStatusRem = ackHeader.getStatusRem();
  }


  public void reversalTest(KotakService kotakService,
                           String paymentMessageId,
                           String msgSrc,
                           String clientCode) {
    HeaderType header = new HeaderType();
    header.setReq_Id(KotakUtils.getUniqueId());
    header.setMsg_Src(msgSrc);
    header.setClient_Code(clientCode);
    header.setDate_Post(KotakUtils.getCurrentIndianDate());

    DetailsType details = new DetailsType();
    details.setMsg_Id(new String[]{paymentMessageId});

    Reversal reversal = new Reversal();
    reversal.setHeader(header);
    reversal.setDetails(details);

    Reversal reversalResponse = kotakService.submitReversal(reversal);

    transactionStatusCode = reversalResponse.getDetails().getRev_Detail()[0].getStatus_Code();
    transactionStatusDesc = reversalResponse.getDetails().getRev_Detail()[0].getStatus_Desc();
  }
}
