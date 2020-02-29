package net.nanopay.sps;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.bank.BankAccount;
import net.nanopay.sps.exceptions.ClientErrorException;
import net.nanopay.sps.exceptions.HostErrorException;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.VerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static foam.mlang.MLang.*;

public class SPSProcessor implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

    transactionDAO
      .where(AND(
        INSTANCE_OF(SPSTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.PENDING),
        OR(
          INSTANCE_OF(CITransaction.class),
          INSTANCE_OF(COTransaction.class),
          INSTANCE_OF(VerificationTransaction.class)
        )
        )
      ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          BankAccount bankAccount;
          Transaction i = (Transaction) ((Transaction) obj).fclone();
          User user = (User) userDAO.find_(x, i.findSourceAccount(x).getOwner());

          // REVIEW: specific to ALterna?
          if ( i instanceof CITransaction ) {
            bankAccount = (BankAccount) i.findSourceAccount(x);
          } else if ( i instanceof COTransaction || i instanceof VerificationTransaction ) {
            bankAccount = (BankAccount) i.findDestinationAccount(x);
          } else {
            return;
          }

          SPSTransaction t = (SPSTransaction) i;
          if ( user == null ) return;
          if ( bankAccount == null ) return;

          GeneralRequestPacket generalRequestPacket = new GeneralRequestPacket();

          SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
          Date curDate = new Date();
          generalRequestPacket.setLocalTxnTime(formatter.format(curDate));

          // merchant ID#, supplied by SPS to nanopay
          generalRequestPacket.setTID("ZYX80");

          TxnDetail txnDetail = new TxnDetail();
          // unique ID for duplicate transaction checking
          txnDetail.setOther(t.getId());
          txnDetail.setName(user.getFirstName() + " " + user.getLastName());
          generalRequestPacket.setTxnDetail(txnDetail);

          generalRequestPacket.setRouteCode(bankAccount.getBranchId());
          generalRequestPacket.setRouteCode(bankAccount.getAccountNumber());
          generalRequestPacket.setAmount(String.format("$%.2f", (t.getAmount() / 100.0)));
          generalRequestPacket.setInvoice(String.valueOf(t.getInvoiceId()));

          // send generalRequestPacket and parse the response
          GeneralRequestResponse generalRequestResponse = GeneralReqService(x, generalRequestPacket);

          t.setBatchId(generalRequestResponse.getBatchId());
          t.setItemId(generalRequestResponse.getItemId());

          String approvalCode = generalRequestResponse.getApprovalCode();
          t.setApprovalCode(approvalCode);
          if ( "A10".equals(generalRequestResponse.getApprovalCode()) ) {
            t.setStatus(TransactionStatus.SENT);
          } else if ("D20".equals(generalRequestResponse.getApprovalCode())) {
            t.setStatus(TransactionStatus.FAILED);
          }

          transactionDAO.put(t);

        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
  }


  public GeneralRequestResponse GeneralReqService(X x, GeneralRequestPacket generalRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (GeneralRequestResponse) parse(request(x, generalRequestPacket));
  }

  public BatchDetailGeneralResponse BatchDetailReqService(X x, BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (BatchDetailGeneralResponse) parse(request(x, batchDetailRequestPacket));
  }

  public DetailResponse DetailInfoService(X x, BatchDetailRequestPacket batchDetailRequestPacket)
    throws ClientErrorException, HostErrorException {
    return (DetailResponse) parse(request(x, batchDetailRequestPacket));
  }

  private String request(X x, RequestPacket requestPacket) {
    Logger logger = (Logger) x.get("logger");
    SPSCredentials spsCredentials = (SPSCredentials) x.get("SPSCredentials");

    String url = spsCredentials.getUrl();
    String requestMsg = requestPacket.toSPSString();
    System.out.println("requestMsg: " + requestMsg);

    CloseableHttpClient httpClient = HttpClients.createDefault();
    HttpPost post = new HttpPost(url);

    List<NameValuePair> urlParameters = new ArrayList<>();
    urlParameters.add(new BasicNameValuePair("packet", requestMsg));
    String response = null;

    try {
      post.setEntity(new UrlEncodedFormEntity(urlParameters));
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        if (httpResponse.getStatusLine().getStatusCode() == 200) {
          BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
          StringBuilder sb = new StringBuilder();
          String line;
          while ( (line = rd.readLine()) != null ) {
            sb.append(line);
          }
          response = sb.toString();
        } else {
          logger.warning("http status code was not 200");
        }
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      logger.error(e);
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        logger.error(e);
      }
    }

    return response;
  }

  private ResponsePacket parse(String response) throws ClientErrorException, HostErrorException {
    String responsePacketType = response.substring(4, 8);
    ResponsePacket responsePacket = null;

    switch ( responsePacketType ) {
      case "2011":
        // GeneralRequestResponse
        GeneralRequestResponse generalRequestResponse = new GeneralRequestResponse();
        generalRequestResponse.parseSPSResponse(response);
        responsePacket = generalRequestResponse;
        break;
      case "2031":
        // BatchDetailGeneralResponse
        BatchDetailGeneralResponse batchDetailGeneralResponse = new BatchDetailGeneralResponse();
        batchDetailGeneralResponse.parseSPSResponse(response);
        responsePacket = batchDetailGeneralResponse;
        break;
      case "2033":
        // DetailResponse
        DetailResponse detailResponse = new DetailResponse();
        detailResponse.parseSPSResponse(response);
        responsePacket = detailResponse;
        break;
      case "2090":
        // RequestMessageAndErrors
        RequestMessageAndErrors requestMessageAndErrors = new RequestMessageAndErrors();
        requestMessageAndErrors.parseSPSResponse(response);
        throw new ClientErrorException(requestMessageAndErrors);
      case "2091":
        // HostError
        HostError hostError = new HostError();
        hostError.parseSPSResponse(response);
        throw new HostErrorException(hostError);
    }

    return responsePacket;
  }
}
