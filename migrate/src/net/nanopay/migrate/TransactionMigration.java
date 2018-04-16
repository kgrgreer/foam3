package net.nanopay.migrate;

import com.mongodb.MongoClient;
import net.nanopay.tx.model.Transaction;
import org.bson.types.ObjectId;

import java.util.Map;

public class TransactionMigration
  extends AbstractMigration<Transaction>
{
  public TransactionMigration(MongoClient client) {
    super(client);
  }

  @Override
  public Map<ObjectId, Transaction> migrate(String... args) {
    return null;
  }
}
