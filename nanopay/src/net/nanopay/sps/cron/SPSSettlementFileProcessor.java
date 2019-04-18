package net.nanopay.sps.cron;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVSupport;
import foam.nanos.logger.Logger;
import net.nanopay.sps.SPSConfig;
import net.nanopay.sps.SPSSettlementFileRecord;
import net.nanopay.sps.SPSTransaction;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class SPSSettlementFileProcessor implements ContextAgent {
  @Override
  public void execute(X x) {
    SPSConfig spsConfig = (SPSConfig) x.get("SPSConfig");
    Logger logger = (Logger) x.get("logger");
    CSVSupport csvSupport = new CSVSupport();
    csvSupport.setX(x);

    List<String> fileNames = new ArrayList<>();
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;

    try {
      // create session with username and password
      JSch jsch = new JSch();
      session = jsch.getSession(spsConfig.getUser(), spsConfig.getHost(), spsConfig.getPort());
      session.setPassword(spsConfig.getPassword());
      String sftpPathSegment = spsConfig.getSftpPathSegment();

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.setTimeout(60000);
      session.connect(60000);

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;

      Vector fileList = channelSftp.ls(sftpPathSegment + "/settlement/");
      Pattern pattern = Pattern.compile("settlement[0-9]{6}.csv");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( String fileName : fileNames ) {
        InputStream fileInputStream = channelSftp.get(sftpPathSegment + "/settlement/" + fileName);
        String input = editFirstRow(x, fileInputStream);
        InputStream is = new ByteArrayInputStream(input.getBytes());

        ArraySink arraySink = new ArraySink();
        csvSupport.inputCSV(is, arraySink, SPSSettlementFileRecord.getOwnClassInfo());

        List list = arraySink.getArray();
        for ( Object record : list ) {
          SPSSettlementFileRecord settlementFileRecord = (SPSSettlementFileRecord) record;

          processTransaction(x, settlementFileRecord);
        }
      }

      Vector folderList = channelSftp.ls(sftpPathSegment);
      boolean exist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( "Archive_SettlementFile".equals(e.getFilename()) ) {
          exist = true;
          break;
        }
      }

      if ( ! exist ) {
        channelSftp.mkdir(sftpPathSegment + "/Archive_SettlementFile");
        channelSftp.chmod(Integer.parseInt("777", 8), sftpPathSegment + "/Archive_SettlementFile");
      }

      String srcFileDirectory = sftpPathSegment + "/settlement/";
      String dstFileDirectory = sftpPathSegment + "/Archive_SettlementFile/";

      // move processed files
      for ( String fileName : fileNames ) {
        channelSftp.rename(srcFileDirectory + fileName, dstFileDirectory + fileName);
      }

      logger.debug("SPS Settlement file processing finished");

    } catch (JSchException | SftpException e) {
      logger.error(e);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public static void processTransaction(X x, SPSSettlementFileRecord spsSettlementFileRecord) {
    DAO transactionDao = (DAO)x.get("localTransactionDAO");
    SPSTransaction tran = (SPSTransaction) transactionDao.find(AND(
      EQ(SPSTransaction.BATCH_ID, spsSettlementFileRecord.getBatch_ID()),
      EQ(SPSTransaction.ITEM_ID, spsSettlementFileRecord.getItem_ID())
    ));

    if ( tran != null ) {
      tran = (SPSTransaction) tran.fclone();

      tran.setSettlementResponse(spsSettlementFileRecord.getResponse());
      tran.setSettleDate(spsSettlementFileRecord.getSettle_Date());
      tran.setAchRequest(spsSettlementFileRecord.getAch_Request());
      tran.setAchRequestDate(spsSettlementFileRecord.getAch_Request_Date());

      transactionDao.put(tran);
    }
  }

  private String editFirstRow(X x, InputStream is) {
    String line;
    StringBuilder sb = new StringBuilder();
    BufferedReader br = null;
    Logger logger = (Logger) x.get("logger");

    try {
      br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));

      if ( (line = br.readLine()) != null ) {
        line = line.replaceAll(" ", "_")
          .replaceAll("/", "_")
          .replaceAll("\\+", "_")
          .replaceAll("#", "Num")
          .replaceAll("\\(", "")
          .replaceAll("\\)", "");
        sb.append(line).append("\n");
      }

      while ( (line = br.readLine()) != null ) {
        sb.append(line).append("\n");
      }

    } catch (IOException e) {
      logger.error(e);
    } finally {
      if ( br != null ) {
        try {
          br.close();
        } catch (IOException e) {
          logger.error(e);
        }
      }
    }

    return sb.toString();
  }
}
