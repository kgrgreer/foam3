package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.math.BigInteger;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.or;
import static com.mongodb.client.model.Sorts.ascending;
import static com.mongodb.client.model.Sorts.orderBy;

public class TransactionMigration
  extends AbstractMigration<List<Transaction>>
{
  public static final ThreadLocal<NumberFormat> nf = new ThreadLocal<NumberFormat>() {
    @Override
    protected NumberFormat initialValue() {
      NumberFormat f = DecimalFormat.getIntegerInstance();
      f.setMaximumFractionDigits(0);
      f.setGroupingUsed(false);
      return f;
    }
  };

  public static final BigInteger ONE_HUNDRED = BigInteger.valueOf(100);

  protected final DAO transactionDAO_;
  protected final Map<ObjectId, User> users_;

  public TransactionMigration(X x, MongoClient client, Map<ObjectId, User> users) {
    super(x, client);
    users_= users;
    transactionDAO_ = (DAO) x.get("transactionDAO");
  }

  @Override
  public Map<ObjectId, List<Transaction>> migrate() {
    MongoDatabase main = getClient().getDatabase(maindb);
    MongoDatabase broker = getClient().getDatabase(brokerdb);

    MongoCollection<Document> mintchipCollection = main.getCollection("mintchipConsumer");
    MongoCollection<Document> transactionCollection = broker.getCollection("transactionLog");

    Map<String, User> payables = new HashMap<>();

    return mintchipCollection.find()
        .into(new ArrayList<>()).stream().collect(Collectors.toMap(new Function<Document, ObjectId>() {
          @Override
          public ObjectId apply(Document document) {
            ObjectId userId = document.getObjectId("userId");
            String sas = nf.get().format(document.get("secureAssetStore"));
            payables.put(sas, users_.get(userId));
            return userId;
          }
        }, new Function<Document, List<Transaction>>() {

          @Override
          public List<Transaction> apply(Document document) {
            String sas = nf.get().format(document.getDouble("secureAssetStore"));

            return transactionCollection.find(and(new Document("vtmCreated", true), or(new Document("payerId", sas), new Document("payeeId", sas))))
                .sort(orderBy(ascending("issueDate")))
                .into(new ArrayList<>()).stream().map(new Function<Document, Transaction>() {
                  @Override
                  public Transaction apply(Document document) {
                    String payerId = document.getString("payerId");
                    String payeeId = document.getString("payeeId");
                    long payerUserId = payables.get(payerId) != null ?
                        payables.get(payerId).getId() : 0;
                    long payeeUserId = payables.get(payeeId) != null ?
                        payables.get(payeeId).getId() : 0;

                    TransactionType type = isBroker(payerId) ? TransactionType.CASHIN :
                        isBroker(payeeId) ? TransactionType.CASHOUT :
                            TransactionType.NONE;

                    TransactionStatus status = ( document.getBoolean("redeemed", false)) ?
                        TransactionStatus.COMPLETED : TransactionStatus.PENDING;

                    BigInteger amount = isV2(sas) ?
                        BigInteger.valueOf(document.getInteger("amount_cents", 0)).divide(ONE_HUNDRED) :
                        BigInteger.valueOf(document.getInteger("amount_cents", 0));

                    // get tip information
                    BigInteger tip = null;
                    BigInteger total = null;
                    Document tipDocument = document.get("tip", Document.class);
                    if ( tipDocument != null ) {
                      tip = isV2(sas) ?
                          BigInteger.valueOf(tipDocument.getInteger("amountCents", 0)).divide(ONE_HUNDRED) :
                          BigInteger.valueOf(tipDocument.getInteger("amountCents", 0));

                      total = isV2(sas) ?
                          BigInteger.valueOf(tipDocument.getInteger("grandTotalCents", 0)).divide(ONE_HUNDRED) :
                          BigInteger.valueOf(tipDocument.getInteger("grandTotalCents", 0));
                    }

                    // build transaction
                    Transaction transaction = new Transaction.Builder(EmptyX.instance())
                        .setAmount(amount.longValue())
                        .setDate(document.getDate("issueDate"))
                        .setNotes(document.getString("personalMessage"))
                        .setStatus(status)
                        .setType(type)
                        .build();

                    // set the payer and payee ids depending on the types
                    switch ( type ) {
                      case CASHIN:
                        transaction.setPayeeId(payeeUserId);
                        break;

                      case CASHOUT:
                        transaction.setPayerId(payerUserId);
                        break;

                      default:
                        transaction.setPayerId(payerUserId);
                        transaction.setPayeeId(payeeUserId);
                        break;
                    }

                    // set tip information
                    if ( tip != null ) {
                      transaction.setTip(tip.longValue());
                    }

                    // set total information
                    if ( total != null ) {
                      transaction.setTotal(total.longValue());
                    }

                    transactionDAO_.put(transaction);
                    return transaction;
                  }
                }).collect(Collectors.toList());
          }
        }));
  }

  private boolean isBroker(String sas) {
    return ( ! SafetyUtil.isEmpty(sas) && sas.charAt(1) == '1' );
  }

  private boolean isV2(String sas) {
    boolean debug = ( MODE != MigrationMode.PRODUCTION );
    return ( ! SafetyUtil.isEmpty(sas) && sas.charAt(0) == (debug ? '5' : '2' ) );
  }
}
