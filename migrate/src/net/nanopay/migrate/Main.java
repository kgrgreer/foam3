package net.nanopay.migrate;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import foam.core.*;
import foam.dao.JDAO;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
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

  public static final boolean DEBUG = true;

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
      String filename = DEBUG ?
          "conf/credentials.debug.properties" :
          "conf/credentials.prod.properties";
      InputStream input = new FileInputStream(filename);
      properties.load(input);

      // load values from properties
      String host = properties.getProperty("mongodb.host", "");
      String user = ! DEBUG ? properties.getProperty("mongodb.user", "") : "";
      String pass = ! DEBUG ? new String(Base64.decode(properties.getProperty("mongodb.pass", ""))) : "";
      boolean authenticate = ! DEBUG && ! SafetyUtil.isEmpty(user) && ! SafetyUtil.isEmpty(pass);

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
      Outputter outputter = new Outputter(OutputterMode.STORAGE);

      // create multi map to contain all data under same user id
      Multimap<ObjectId, FObject> data = HashMultimap.create();

      // migrate users
      Map<ObjectId, User> users
          = new UserMigration(getX(), client).migrate();

      // migrate devices
      Map<ObjectId, Device> devices
          = new DeviceMigration(getX(), client, users).migrate();

      // migrate transaction
      Map<ObjectId, List<Transaction>> transactions
          = new TransactionMigration(getX(), client, users).migrate();

      // migrate invoices
      Map<ObjectId, List<Invoice>> invoices
          = new InvoiceMigration(getX(), client, users).migrate();
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}