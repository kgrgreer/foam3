package net.nanopay.migrate;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import foam.core.FObject;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
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

  public static void main(String[] args) {
    try {
      Properties properties = new Properties();
      String filename = DEBUG ?
          "conf/credentials.debug.properties" :
          "conf/credentials.prod.properties";
      InputStream input = new FileInputStream(filename);
      properties.load(input);

      String host = properties.getProperty("mongodb.host", "");
      String user = ! DEBUG ? properties.getProperty("mongodb.user", "") : "";
      String pass = ! DEBUG ? new String(Base64.decode(properties.getProperty("mongodb.pass", ""))) : "";
      boolean authenticate = ! DEBUG && ! SafetyUtil.isEmpty(user) && ! SafetyUtil.isEmpty(pass);

      MongoCredential credential = MongoCredential.createCredential(user, "admin", pass.toCharArray());
      List<ServerAddress> addresses = Arrays.stream(host.split(";")).map(s -> {
        String[] split = s.split(":");
        return new ServerAddress(split[0], Integer.parseInt(split[1]));
      }).collect(Collectors.toList());

      MongoClient client = authenticate ?
          new MongoClient(addresses, Collections.singletonList(credential)) :
          new MongoClient(addresses);
      Outputter outputter = new Outputter(OutputterMode.STORAGE);

      // create multi map to contain all data under same user id
      Multimap<ObjectId, FObject> data = HashMultimap.create();

      Map<ObjectId, User> users = new UserMigration(client).migrate();
      for (ObjectId id : users.keySet()) {
        System.out.println(outputter.stringify(users.get(id)));
        data.put(id, users.get(id));
      }

      Map<ObjectId, Device> devices = new DeviceMigration(client).migrate();
      for (ObjectId id : devices.keySet()) {
        data.put(id, devices.get(id));
      }

      Map<ObjectId, List<Transaction>> transactions = new TransactionMigration(client).migrate();
      for ( ObjectId id : transactions.keySet()) {
        System.out.println(id.toHexString());
        List<Transaction> t = transactions.get(id);
        for ( Transaction transaction : t ) {
          System.out.println(outputter.stringify(transaction));
        }
      }

      Map<ObjectId, List<Invoice>> invoices = new InvoiceMigration(client).migrate();
      for ( ObjectId id : invoices.keySet()) {
        System.out.println(id.toHexString());
        List<Invoice> t = invoices.get(id);
        for ( Invoice invoice : t ) {
          System.out.println(outputter.stringify(invoice));
        }
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}