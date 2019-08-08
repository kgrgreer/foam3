package net.nanopay.fx.lianlianpay.test;

import com.jcraft.jsch.ChannelSftp;
import foam.core.ProxyX;
import foam.core.X;
import foam.lib.json.Outputter;
import net.nanopay.fx.lianlianpay.LianLianPayService;
import net.nanopay.fx.lianlianpay.model.*;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.WritableByteChannel;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class Test {

  public static void main(String[] args) {
    try {
      String cwd = System.getProperty("user.dir");
      String pubKeyFilename =
          cwd + "/nanopay/src/net/nanopay/fx/lianlianpay/test/TestKey/Test_Public_Key.pem";
      String privKeyFilename =
          cwd + "/nanopay/src/net/nanopay/fx/lianlianpay/test/TestKey/Test_Private_Key.pem";

      X x = new ProxyX();
      LianLianPayService service = new LianLianPayService.Builder(x)
          .setHost("192.168.22.84")
          .setPort(22)
          .setDirectory("LLP")
          .setUsername("kirk")
          .setPrivateKeyFilename(privKeyFilename)
          .setPublicKeyFilename(pubKeyFilename)
          .build();

      InstructionCombined ic = new InstructionCombined();
      InstructionCombinedSummary summary = new InstructionCombinedSummary();
      summary.setBatchId("000001");
      summary.setSourceCurrency("USD");
      summary.setTargetCurrency("CNY");
      summary.setTotalTargetAmount(100.00f);
      summary.setTotalCount(1);
      summary.setDistributeMode(DistributionMode.FIXED_TARGET_AMOUNT);
      summary.setInstructionType(InstructionType.B2B);
      ic.setSummary(summary);

      InstructionCombinedRequest instruction = new InstructionCombinedRequest();
      instruction.setOrderId("LLPAY0000000001");
      instruction.setFundsType(InstructionType.B2B);
      instruction.setSourceCurrency("USD");
      instruction.setTargetCurrency("CNY");
      instruction.setTargetAmount(100.00f);
      instruction.setPayeeCompanyName("CompanyA");
      instruction.setPayeeContactNumber("81234561");
      instruction.setPayeeOrganizationCode("00000001-X");
      instruction.setPayeeEmailAddress("CompanyA@email.com");
      instruction.setPayeeBankName(3);
      instruction.setPayeeBankAccount("VSY8jzS6P1d2RSJ/ONPobQ==");
      instruction.setPayerId("100001");
      instruction.setPayerName("PayerA");
      instruction.setTradeCode("121010");
      instruction.setMemo("Memo Content");

      ic.setRequests(new InstructionCombinedRequest[]{ instruction });
      service.uploadInstructionCombined("123456789", "000000001", ic);

      Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
      calendar.set(Calendar.YEAR, 2017);
      calendar.set(2017, 0, 3, 0, 0, 0);
      Date date = calendar.getTime();

      Outputter outputter = new Outputter(x);
      System.out.println(outputter.stringify(service.downloadPreProcessResult(date, "123456789", "000000001")));
      System.out.println(outputter.stringify(service.downloadReconciliation(date, "123456789")));
      System.out.println(outputter.stringify(service.downloadStatement(date, "123456789")));
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}
