package net.nanopay.fx.lianlianpay;

import com.amazonaws.services.dynamodbv2.xspec.B;
import com.jcraft.jsch.*;
import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.crypto.sign.SigningInputStream;
import foam.crypto.sign.SigningOutputStream;
import foam.util.SafetyUtil;
import net.nanopay.fx.lianlianpay.model.*;
import org.apache.commons.io.IOUtils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.encoders.Base64;

import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import static net.nanopay.fx.lianlianpay.model.DistributionMode.FIXED_SOURCE_AMOUNT;
import static net.nanopay.fx.lianlianpay.model.DistributionMode.FIXED_TARGET_AMOUNT;

public class LianLianPayService
    extends ContextAwareSupport
    implements LianLianPay
{
  protected static final int AES_KEY_SIZE = 256;
  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  // decimal formatter for scale of 2
  protected static ThreadLocal<DecimalFormat> df2 = new ThreadLocal<DecimalFormat>() {
    @Override
    protected DecimalFormat initialValue() {
      return new DecimalFormat("#.00");
    }
  };

  // decimal formatter for scale of 8
  protected static ThreadLocal<DecimalFormat> df8 = new ThreadLocal<DecimalFormat>() {
    @Override
    protected DecimalFormat initialValue() {
      return new DecimalFormat("#.00000000");
    }
  };

  // date formatter for YYYYMMDD
  protected static ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  private static SecureRandom random_;
  private static SecureRandom getSecureRandom() throws NoSuchAlgorithmException {
    if ( random_ == null ) {
      random_ = SecureRandom.getInstance("SHA1PRNG");
    }
    return random_;
  }

  private Properties config = new Properties();
  {
    config.setProperty("StrictHostKeyChecking", "no");
  }

  protected String host_;
  protected int port_;
  protected String directory_;
  protected String username_;
  protected String password_;
  protected PublicKey publicKey_;
  protected PrivateKey privateKey_;

  public static class Builder
      extends ContextAwareSupport
  {
    private String host = null;
    private int port = 22;
    private String directory = null;
    private String username = null;
    private String password = null;
    private String publicKeyFilename = null;
    private String privateKeyFilename = null;

    public Builder(X x) {
      setX(x);
    }

    public Builder setHost(String host) {
      this.host = host;
      return this;
    }

    public Builder setPort(int port) {
      this.port = port;
      return this;
    }

    public Builder setDirectory(String directory) {
      this.directory = directory;
      return this;
    }

    public Builder setUsername(String username) {
      this.username = username;
      return this;
    }

    public Builder setPassword(String password) {
      this.password = password;
      return this;
    }

    public Builder setPublicKeyFilename(String publicKeyFilename) {
      this.publicKeyFilename = publicKeyFilename;
      return this;
    }

    public Builder setPrivateKeyFilename(String privateKeyFilename) {
      this.privateKeyFilename = privateKeyFilename;
      return this;
    }

    public LianLianPayService build() {
      return new LianLianPayService(getX(), this);
    }
  }

  private LianLianPayService(X x, Builder builder) {
    setX(x);
    host_ = builder.host;
    port_ = builder.port;
    directory_ = builder.directory;
    username_ = builder.username;
    password_ = builder.password;
    publicKey_ = (PublicKey) readKey(builder.publicKeyFilename, true);
    privateKey_ = (PrivateKey) readKey(builder.privateKeyFilename, false);
  }

  /**
   * Reads a Public/Private key from file
   *
   * @param filename file to read
   * @param isPublicKey flag to determine if public key or private key
   * @return a private key or public key
   * @throws IOException
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeySpecException
   */
  protected Key readKey(String filename, boolean isPublicKey) {
    try {
      byte[] keyBytes = Base64.decode(Files.readAllBytes(Paths.get(filename)));
      KeySpec spec = (isPublicKey) ? new X509EncodedKeySpec(keyBytes) : new PKCS8EncodedKeySpec(keyBytes);
      KeyFactory kf = KeyFactory.getInstance("RSA");
      return (isPublicKey) ? kf.generatePublic(spec) : kf.generatePrivate(spec);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public void uploadInstructionCombined(String merchantId, String batchId, InstructionCombined request) {
    Session session = null;
    ChannelSftp channel = null;
    SigningInputStream sis = null;

    try {
      StringBuilder builder = sb.get();
      Date date = Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime();
      String filename = builder.append(sdf.get().format(date))
          .append("_").append(merchantId).append("_")
          .append(batchId).append(".REQ").toString();
      String sigfilename = builder.append("SIG").toString();

      // generate random AES256 key
      KeyGenerator keygen = KeyGenerator.getInstance("AES");
      keygen.init(AES_KEY_SIZE, getSecureRandom());
      SecretKey key = keygen.generateKey();

      // generate cipher in encrypt mode using the public key
      Cipher cipher = Cipher.getInstance("RSA");
      cipher.init(Cipher.ENCRYPT_MODE, publicKey_);

      // encrypt aes256 key using public key
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      CipherOutputStream cos = new CipherOutputStream(baos, cipher);
      cos.write(key.getEncoded());
      cos.close();

      // append Base64 encoded random AES256 key encrypted by LianLian Pay RSA Public Key
      builder.append(Base64.toBase64String(baos.toByteArray())).append("\n");

      // append summary information separated by |
      InstructionCombinedSummary summary = request.getSummary();
      builder.append(summary.getBatchId()).append("|")
          .append(summary.getSourceCurrency()).append("|")
          .append(FIXED_SOURCE_AMOUNT.equals(summary.getDistributeMode()) ?
              df2.get().format(summary.getTotalSourceAmount()) : "|")
          .append(summary.getTargetCurrency()).append("|")
          .append(FIXED_TARGET_AMOUNT.equals(summary.getDistributeMode()) ?
              df2.get().format(summary.getTotalTargetAmount()) : "|")
          .append(summary.getTotalCount()).append("|")
          .append(((DistributionMode) summary.getDistributeMode()).getOrdinal()).append("|")
          .append(((InstructionType) summary.getInstructionType()).getOrdinal()).append("\n");

      // append instruction requests
      boolean headersOutput = false;
      InstructionCombinedRequest[] instructions = request.getRequests();
      for ( InstructionCombinedRequest instruction : instructions ) {
        List props = instruction.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        // output headers before outputting first instruction
        if ( ! headersOutput ) {
          Iterator i = props.iterator();
          while ( i.hasNext() ) {
            PropertyInfo prop = (PropertyInfo) i.next();
            builder.append(prop.getName())
                .append(i.hasNext() ? "|" : "\n");
          }
          headersOutput = true;
        }

        builder.append(instruction.getOrderId()).append("|")
            .append(((InstructionType) instruction.getFundsType()).getOrdinal()).append("|")
            .append(instruction.getSourceCurrency()).append("|")
            .append(FIXED_SOURCE_AMOUNT.equals(summary.getDistributeMode()) ? instruction.getSourceAmount() : "").append("|")
            .append(instruction.getTargetCurrency()).append("|")
            .append(FIXED_TARGET_AMOUNT.equals(summary.getDistributeMode()) ? instruction.getTargetAmount() : "").append("|")
            .append(instruction.getPayeeCompanyName()).append("|")
            .append(instruction.getPayeeContactNumber()).append("|")
            .append(SafetyUtil.isEmpty(instruction.getPayeeSocialCreditCode()) ? instruction.getPayeeOrganizationCode() : "").append("|")
            .append(SafetyUtil.isEmpty(instruction.getPayeeOrganizationCode()) ? instruction.getPayeeSocialCreditCode() : "").append("|")
            .append(! SafetyUtil.isEmpty(instruction.getPayeeEmailAddress()) ? instruction.getPayeeEmailAddress() : "").append("|")
            .append(SafetyUtil.isEmpty(instruction.getPayeeBankBranchName()) ? instruction.getPayeeBankName() : "").append("|")
            .append(instruction.getPayeeBankName() == 0 ? instruction.getPayeeBankBranchName() : "").append("|");

        // encrypt payee bank account information using aes key
        String payeeBankAccount = instruction.getPayeeBankAccount();
        byte[] ciphertext = cipher.doFinal(payeeBankAccount.getBytes(StandardCharsets.UTF_8));

        builder.append(Base64.toBase64String(ciphertext)).append("|")
            .append(instruction.getPayerId()).append("|")
            .append(instruction.getPayerName()).append("|")
            .append(instruction.getTradeCode()).append("|")
            .append(! SafetyUtil.isEmpty(instruction.getMemo()) ? instruction.getMemo() : "").append("\n");
      }

      // create signing input stream with private key using SHA1 as the algorithm
      sis = new SigningInputStream("SHA1withRSA", privateKey_,
          new ByteArrayInputStream(builder.toString().getBytes(StandardCharsets.UTF_8)));

      // establish new sftp session
      JSch jsch = new JSch();
      session = jsch.getSession(username_, host_, port_);
      if ( ! SafetyUtil.isEmpty(password_) ) {
        session.setPassword(password_);
      }
      session.setConfig(config);
      session.connect(5 * 1000);

      // create new connection
      channel = (ChannelSftp) session.openChannel("sftp");
      channel.connect(5 * 1000);
      channel.cd(directory_ + "/InstructionCombined");

      // upload file and upload signature file
      channel.put(sis, filename);
      channel.put(new ByteArrayInputStream(Base64.encode(sis.sign())), sigfilename);
      channel.exit();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  @Override
  public PreProcessResult downloadPreProcessResult(Date date, String merchantId, String batchId) {
    Session session = null;
    ChannelSftp channel = null;
    SigningOutputStream sos = null;

    BufferedReader br = null;
    LineNumberReader lnr = null;
    SigningInputStream sis = null;
    ByteArrayOutputStream baos = null;

    try {
      StringBuilder builder = sb.get();
      String filename = builder.append(sdf.get().format(date))
          .append("_").append(merchantId).append("_")
          .append(batchId).append(".RESP").toString();
      String sigfilename = filename + "SIG";

      // establish new sftp session
      JSch jsch = new JSch();
      session = jsch.getSession(username_, host_, port_);
      if ( ! SafetyUtil.isEmpty(password_) ) {
        session.setPassword(password_);
      }
      session.setConfig(config);
      session.connect(5 * 1000);

      // create a new connection
      channel = (ChannelSftp) session.openChannel("sftp");
      channel.connect(5 * 1000);
      channel.cd(directory_ + "/PreProcessResult");

      // download file and create buffered reader
      baos = new ByteArrayOutputStream();
      sos = new SigningOutputStream("SHA1withRSA", publicKey_, baos);
      channel.get(filename, sos);
      br = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(baos.toByteArray())));

      // read signature file and verify signature
      baos = new ByteArrayOutputStream();
      channel.get(sigfilename, baos);
      lnr = new LineNumberReader(new InputStreamReader(new ByteArrayInputStream(baos.toByteArray())));
      byte[] signature = Base64.decode(lnr.readLine());
      if ( ! sos.verify(signature) ) {
        throw new SignatureException("Signature verification failed");
      }

      // initialize data structire and get property info
      PreProcessResult result = new PreProcessResult();
      PreProcessResultSummary summary = new PreProcessResultSummary();
      List summaryProps = summary.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      List<PreProcessResultResponse> responses = new ArrayList<PreProcessResultResponse>();
      List responseProps = PreProcessResultResponse.getOwnClassInfo().getAxiomsByClass(PropertyInfo.class);

      String line;
      int count = 0;
      while ( (line = br.readLine()) != null ) {
        if ( count == 0 ) {
          // read summary
          String[] strings = line.split("\\|", summaryProps.size());

          for ( int i = 0; i < summaryProps.size(); i++ ) {
            if ( SafetyUtil.isEmpty(strings[i]) ) continue;
            PropertyInfo prop = (PropertyInfo) summaryProps.get(i);
            prop.setFromString(summary, strings[i]);
          }
        } else if ( count > 1 ) {
          // read response information
          PreProcessResultResponse response = new PreProcessResultResponse();
          String[] strings = line.split("\\|", responseProps.size());

          for ( int i = 0; i < responseProps.size(); i++ ) {
            if ( SafetyUtil.isEmpty(strings[i]) ) continue;
            PropertyInfo prop = (PropertyInfo) responseProps.get(i);
            prop.setFromString(response, strings[i]);
          }
          responses.add(response);
        }
        count++;
      }

      result.setSummary(summary);
      result.setResponses(responses.toArray(
          new PreProcessResultResponse[responses.size()]));
      return result;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  @Override
  public Reconciliation downloadReconciliation(Date date, String merchantId) {
    // TODO: download from SFTP

    String cwd = System.getProperty("user.dir");
    File file = new File(cwd +
        "/nanopay/src/net/nanopay/fx/lianlianpay/test/B2BSend_CombinedMode/2017.01.04/Reconciliation/20170103_201701010000000001.RESP");
    File sigFile = new File(cwd +
        "/nanopay/src/net/nanopay/fx/lianlianpay/test/B2BSend_CombinedMode/2017.01.04/Statement/20170103_201701010000000001.RESPSIG");

    BufferedReader br = null;
    LineNumberReader lnr = null;
    SigningInputStream sis = null;

    Reconciliation result = new Reconciliation();

    List<ReconciliationRecord> records = new ArrayList<ReconciliationRecord>();
    List recordProps = ReconciliationRecord.getOwnClassInfo().getAxiomsByClass(PropertyInfo.class);

    try {
      sis = new SigningInputStream("SHA1withRSA", publicKey_, new FileInputStream(file));
      br = new BufferedReader(new InputStreamReader(sis));
      lnr = new LineNumberReader(new FileReader(sigFile));

      String line;
      int count = 0;
      while ( (line = br.readLine()) != null ) {
        if ( count == 0 ) {
          // read accounting date
          result.setAccountingDate(sdf.get().parse(line));
        } else if ( count > 1 ) {
          // read reconciliation record
          ReconciliationRecord record = new ReconciliationRecord();
          String[] strings = line.split("\\|", recordProps.size());

          for ( int i = 0; i < recordProps.size(); i++ ) {
            if ( SafetyUtil.isEmpty(strings[i]) ) continue;
            PropertyInfo prop = (PropertyInfo) recordProps.get(i);
            prop.setFromString(record, strings[i]);
          }
          records.add(record);
        }
        count++;
      }

      // verify signature using signing input stream
      sis.verify(Base64.decode(lnr.readLine()));

      result.setReconciliationRecords(records.toArray(
          new ReconciliationRecord[records.size()]));
      return result;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
    }
  }

  @Override
  public Statement downloadStatement(Date date, String merchantId) {
    // TODO: download from SFTP

    String cwd = System.getProperty("user.dir");
    File file = new File(cwd +
        "/nanopay/src/net/nanopay/fx/lianlianpay/test/B2BSend_CombinedMode/2017.01.04/Statement/20170103_201701010000000001.RESP");
    File sigFile = new File(cwd +
        "/nanopay/src/net/nanopay/fx/lianlianpay/test/B2BSend_CombinedMode/2017.01.04/Statement/20170103_201701010000000001.RESPSIG");

    BufferedReader br = null;
    LineNumberReader lnr = null;
    SigningInputStream sis = null;

    Statement result = new Statement();

    List<CurrencyBalanceRecord> balanceRecords = new ArrayList<CurrencyBalanceRecord>();
    List balanceProps = CurrencyBalanceRecord.getOwnClassInfo().getAxiomsByClass(PropertyInfo.class);

    List<StatementRecord> statementRecords = new ArrayList<StatementRecord>();
    List statementProps = StatementRecord.getOwnClassInfo().getAxiomsByClass(PropertyInfo.class);

    try {
      sis = new SigningInputStream("SHA1withRSA", publicKey_, new FileInputStream(file));
      br = new BufferedReader(new InputStreamReader(sis));
      lnr = new LineNumberReader(new FileReader(sigFile));

      String line;
      boolean parsingBalance = true;
      while ( (line = br.readLine()) != null ) {
        if ( "asOfDate|currency|balance".equals(line) ) {
          // parsing currency balance records
          parsingBalance = true;
          continue;
        }

        if ( "serialNumber|billTime|type|currency|amount|memo".equals(line) ) {
          // parsing statement records
          parsingBalance = false;
          continue;
        }

        int size = ( parsingBalance ) ? balanceProps.size() : statementProps.size();
        FObject record = ( parsingBalance ) ? new CurrencyBalanceRecord() : new StatementRecord();
        String[] strings = line.split("\\|", size);

        for ( int i = 0; i < size; i++ ) {
          if (SafetyUtil.isEmpty(strings[i])) continue;
          PropertyInfo prop = (PropertyInfo) ((parsingBalance) ?
              balanceProps.get(i) : statementProps.get(i));
          prop.setFromString(record, strings[i]);
        }

        if ( parsingBalance ) {
          balanceRecords.add((CurrencyBalanceRecord) record);
        } else {
          statementRecords.add((StatementRecord) record);
        }
      }

      // verify signature using signing input stream
      sis.verify(Base64.decode(lnr.readLine()));

      result.setCurrencyBalanceRecords(balanceRecords.toArray(
          new CurrencyBalanceRecord[balanceRecords.size()]));
      result.setStatementRecords(statementRecords.toArray(
          new StatementRecord[statementRecords.size()]));
      return result;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
    }
  }
}