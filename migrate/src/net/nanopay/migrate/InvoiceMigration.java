package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.exists;
import static com.mongodb.client.model.Sorts.ascending;
import static com.mongodb.client.model.Sorts.orderBy;

public class InvoiceMigration
  extends AbstractMigration<List<Invoice>>
{
  public static final BigInteger ONE_HUNDRED = BigInteger.valueOf(100);

  protected final Map<ObjectId, User> users_;

  public InvoiceMigration(MongoClient client, Map<ObjectId, User> users) {
    super(client);
    users_ = users;
  }

  @Override
  public Map<ObjectId, List<Invoice>> migrate() {
    MongoDatabase main = getClient().getDatabase(DEBUG ? "development" : "prod");
    MongoCollection<Document> userCollection = main.getCollection("user");
    MongoCollection<Document> invoiceCollection = main.getCollection("invoice");

    return userCollection.find(exists("businessId"))
        .into(new ArrayList<>()).stream().collect(Collectors.toMap(new Function<Document, ObjectId>() {
          @Override
          public ObjectId apply(Document document) {
            return document.getObjectId("_id");
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
                    BigInteger amount = BigInteger.valueOf(
                        document.getInteger("amount", 0)).divide(ONE_HUNDRED);

                    return new Invoice.Builder(EmptyX.instance())
                        .setAmount(amount.longValue())
                        .setInvoiceNumber(document.getString("invoiceNumber"))
                        .setPurchaseOrder(document.getString("purchaseOrder"))
                        .setIssueDate(document.getDate("issueDate"))
                        .setPaymentDate(document.getDate("paymentDate"))
                        .build();
                  }
                })
                .collect(Collectors.toList());
          }
        }));
  }
}
