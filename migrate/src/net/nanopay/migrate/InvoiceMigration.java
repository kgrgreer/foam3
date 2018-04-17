package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.exists;
import static com.mongodb.client.model.Sorts.ascending;
import static com.mongodb.client.model.Sorts.orderBy;

public class InvoiceMigration
  extends AbstractMigration<List<Invoice>>
{
  public static final BigInteger ONE_HUNDRED = BigInteger.valueOf(100);

  protected final DAO invoiceDAO_;
  protected final Map<ObjectId, User> users_;

  public InvoiceMigration(X x, MongoClient client, Map<ObjectId, User> users) {
    super(x, client);
    users_ = users;
    invoiceDAO_ = (DAO) x.get("invoiceDAO");
  }

  @Override
  public Map<ObjectId, List<Invoice>> migrate() {
    MongoDatabase main = getClient().getDatabase(DEBUG ? "development" : "prod");
    MongoCollection<Document> userCollection = main.getCollection("user");
    MongoCollection<Document> invoiceCollection = main.getCollection("invoice");

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

          AtomicInteger i = new AtomicInteger(10000);

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
                        .setId(i.getAndIncrement())
                        .setAmount(amount.longValue())
                        .setPayerId(payer.getId())
                        .setPayeeId(payee.getId())
                        .setInvoiceNumber(document.getString("invoiceNumber"))
                        .setPurchaseOrder(document.getString("purchaseOrder"))
                        .setIssueDate(document.getDate("issueDate"))
                        .setPaymentDate(document.getDate("paymentDate"))
                        .build();

                    invoiceDAO_.put(invoice);
                    return invoice;
                  }
                })
                .collect(Collectors.toList());
          }
        }));
  }
}
