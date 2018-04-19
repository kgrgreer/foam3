package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import foam.core.EmptyX;
import foam.core.X;
import foam.core.XFactory;
import foam.dao.JDAO;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.fs.Storage;
import foam.util.SafetyUtil;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.retail.model.Device;
import net.nanopay.tx.model.Transaction;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.encoders.Base64;
import org.bson.types.ObjectId;

import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Security;
import java.util.*;
import java.util.stream.Collectors;

public class Main
{
  static {
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  public static final MigrationMode MODE = MigrationMode.STAGING;

  protected static X root_ = null;

  protected static X getX() {
    if ( root_ == null ) {
      root_ = EmptyX.instance()
          .putFactory("deviceDAO", new XFactory() {
            @Override
            public Object create(X x) {
              return new JDAO(x, Device.getOwnClassInfo(), "devices");
            }
          })
          .putFactory("fileDAO", new XFactory() {
            @Override
            public Object create(X x) {
              return new JDAO(x, File.getOwnClassInfo(), "files");
            }
          })
          .putFactory("invoiceDAO", new XFactory() {
            @Override
            public Object create(X x) {
              return new JDAO(x, Invoice.getOwnClassInfo(), "invoices");
            }
          })
          .putFactory(Storage.class, new XFactory() {
            @Override
            public Object create(X x) {
              return new Storage(".");
            }
          })
          .putFactory("transactionDAO", new XFactory() {
            @Override
            public Object create(X x) {
              return new JDAO(x, Transaction.getOwnClassInfo(), "transactions");
            }
          })
          .putFactory("user", new XFactory() {
            @Override
            public Object create(X x) {
              // install system user
              return new User.Builder(x)
                  .setId(1)
                  .setFirstName("system")
                  .setGroup("system")
                  .build();
            }
          })
          .putFactory("userDAO", new XFactory() {
            @Override
            public Object create(X x) {
              return new JDAO(x, User.getOwnClassInfo(), "users");
            }
          });
    }

    return root_;
  }

  public static void main(String[] args) {
    try {
      // load properties
      Properties properties = new Properties();
      String filename;
      switch ( MODE ) {
        case STAGING:     filename = "conf/credentials.staging.properties"; break;
        case PRODUCTION:  filename = "conf/credentials.prod.properties";    break;
        default:          filename = "conf/credentials.debug.properties";   break;
      }

      InputStream input = new FileInputStream(filename);
      properties.load(input);

      // load values from properties
      String host = properties.getProperty("mongodb.host", "");
      String user = properties.getProperty("mongodb.user", "");
      String pass = properties.getProperty("mongodb.pass", "");
      pass = ! SafetyUtil.isEmpty(pass) ? new String(Base64.decode(pass), StandardCharsets.UTF_8) : "";
      boolean authenticate = ! SafetyUtil.isEmpty(user) && ! SafetyUtil.isEmpty(pass);

      // set up credentials and server addresses
      MongoCredential credential = MongoCredential.createCredential(user, "admin", pass.toCharArray());
      List<ServerAddress> addresses = Arrays.stream(host.split(";")).map(s -> {
        String[] split = s.split(":");
        return new ServerAddress(split[0], Integer.parseInt(split[1]));
      }).collect(Collectors.toList());

      // create mongo client
      MongoClient client = authenticate ?
          new MongoClient(addresses, Collections.singletonList(credential)) :
          new MongoClient(addresses);

      // migrate users
      Map<ObjectId, User> users
          = new UserMigration(getX(), client).migrate();

      // migrate devices
//      Map<ObjectId, Device> devices
//          = new DeviceMigration(getX(), client, users).migrate();

      // migrate transaction
      Map<ObjectId, List<Transaction>> transactions
          = new TransactionMigration(getX(), client, users).migrate();

      // migrate invoices
//      Map<ObjectId, List<Invoice>> invoices
//          = new InvoiceMigration(getX(), client, users).migrate();
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}