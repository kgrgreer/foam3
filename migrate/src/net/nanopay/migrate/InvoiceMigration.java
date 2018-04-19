package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.blob.IdentifiedBlob;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.util.SafetyUtil;
import net.nanopay.invoice.model.Invoice;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.exists;
import static com.mongodb.client.model.Sorts.ascending;
import static com.mongodb.client.model.Sorts.orderBy;

public class InvoiceMigration
  extends AbstractMigration<ObjectId, List<Invoice>>
{
  public static final BigInteger ONE_HUNDRED = BigInteger.valueOf(100);

  protected final DAO fileDAO_;
  protected final DAO invoiceDAO_;
  protected final Map<ObjectId, User> users_;

  public InvoiceMigration(X x, MongoClient client, Map<ObjectId, User> users) {
    super(x, client);
    users_ = users;
    fileDAO_ = (DAO) x.get("fileDAO");
    invoiceDAO_ = (DAO) x.get("invoiceDAO");
  }

  @Override
  public Map<ObjectId, List<Invoice>> migrate() {
    MongoDatabase main = getClient().getDatabase(maindb);
    MongoCollection<Document> userCollection = main.getCollection("user");
    MongoCollection<Document> invoiceCollection = main.getCollection("invoice");
    MongoCollection<Document> paymentCollection = main.getCollection("payment");

    Map<ObjectId, User> businesses = new HashMap<>();

    return userCollection.find(exists("businessId"))
        .into(new ArrayList<>()).stream().collect(Collectors.toMap(new Function<Document, ObjectId>() {
          @Override
          public ObjectId apply(Document document) {
            ObjectId userId = document.getObjectId("_id");
            ObjectId businessId = document.getObjectId("businessId");
            businesses.put(businessId, users_.get(userId));
            return userId;
          }
        }, new Function<Document, List<Invoice>>() {

          @Override
          public List<Invoice> apply(Document document) {
            ObjectId businessId = document.getObjectId("businessId");

            return invoiceCollection.find(new Document("payerBusinessId", businessId))
                .sort(orderBy(ascending("issueDate")))
                .into(new ArrayList<>()).stream().map(new Function<Document, Invoice>() {
                  @Override
                  public Invoice apply(Document document) {
                    User payer = businesses.get(document.getObjectId("payerBusinessId"));
                    User payee = businesses.get(document.getObjectId("payeeBusinessId"));

                    BigInteger amount = BigInteger.valueOf(
                        document.getInteger("amount", 0)).divide(ONE_HUNDRED);

                    Invoice invoice = new Invoice.Builder(EmptyX.instance())
                        .setAmount(amount.longValue())
                        .setPayerId(payer.getId())
                        .setPayeeId(payee.getId())
                        .setInvoiceNumber(document.getString("invoiceNumber"))
                        .setPurchaseOrder(document.getString("purchaseOrder"))
                        .setIssueDate(document.getDate("issueDate"))
                        .setPaymentDate(document.getDate("paymentDate"))
                        .build();

                    // set invoice image file information
                    String invoiceFileUrl = document.getString("invoiceFileUrl");
                    if ( ! SafetyUtil.isEmpty(invoiceFileUrl) ) {
                      invoice.setInvoiceFileUrl(invoiceFileUrl);

                      HttpURLConnection conn = null;

                      try {
                        // get filesize
                        URL url = new URL(invoiceFileUrl);
                        conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("HEAD");
                        conn.getInputStream();
                        long filesize = conn.getContentLengthLong();

                        String filename = invoiceFileUrl.substring(invoiceFileUrl.lastIndexOf('/') + 1);
                        String blobId = prefix + "/" + filename;

                        File file = new File.Builder(EmptyX.instance())
                            .setId(UUID.randomUUID().toString())
                            .setFilename(filename)
                            .setFilesize(filesize)
                            .setMimeType("application/pdf")
                            .setData(new IdentifiedBlob.Builder(EmptyX.instance()).setId(blobId).build())
                            .setOwner(payer.getId())
                            .build();

                        invoice.setInvoiceFile(new File[]{file});
                        fileDAO_.put(file);
                      } catch (Throwable ignored) {

                      } finally {
                        if ( conn != null ) conn.disconnect();
                      }
                    }

                    // set invoice image url
                    String invoiceImageUrl = document.getString("invoiceImageUrl");
                    if ( ! SafetyUtil.isEmpty(invoiceImageUrl) ) {
                      invoice.setInvoiceImageUrl(invoiceImageUrl);
                    }

                    // set payment information
                    String invoiceId = document.getObjectId("_id").toHexString();
                    Document paymentDocument = paymentCollection.find(new Document("invoiceId", invoiceId)).first();
                    if ( paymentDocument != null ) {
                      invoice.setPaymentDate(paymentDocument.getDate("paymentDate"));
                      invoice.setDueDate(paymentDocument.getDate("scheduleDate"));
                    }

                    invoiceDAO_.put(invoice);
                    return invoice;
                  }
                })
                .collect(Collectors.toList());
          }
        }));
  }
}
