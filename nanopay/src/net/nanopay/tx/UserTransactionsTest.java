package net.nanopay.tx;

import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.MapDAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.boot.Boot;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class UserTransactionsTest {

  private static final int     USER_COUNT          = 5;
  private static final int     ACCOUNT_COUNT       = 1;
  private static final int     THREAD_COUNT        = 8;
  private static final int     TRANSACTION_COUNT   = 1000;
  private static final int     STARTING_BALANCE    = 100;
  private static final boolean PRINT_USER_BALANCES = true;

  public static void main(String[] args) {
    System.out.println("Transaction Test");

    Boot boot = new Boot();

    MapDAO userDao = new MapDAO();
    userDao.setOf(User.getOwnClassInfo());
    userDao.setX(boot.getX());
    boot.getX().put("userTestDAO", userDao);

    MapDAO accountDao = new MapDAO();
    accountDao.setOf(Account.getOwnClassInfo());
    accountDao.setX(boot.getX());
    boot.getX().put("accountTestDAO", accountDao);

    System.out.println("Creating users");

    // Generate USER_COUNT users
    for ( int i = 0 ; i < USER_COUNT ; i++ ) {
      User user = new User();
      user.setId(i);
      Account[] accounts = new Account[ACCOUNT_COUNT];
      for ( int j = 0; j < ACCOUNT_COUNT; j++ ) {
        accounts[j] = new Account();

        accounts[j].setBalance(STARTING_BALANCE);
        accounts[j].setId(i);
        accountDao.put(accounts[j]);
      }
      user.setAccounts(accounts);
      //user.setAddress(new Address[0]);
      //user.setPhones(new Phone[0]);
      //userDao.cmd(new ActionCommand(user, "put"));
      userDao.put(user);
    }

    System.out.println("Creating transactions");

    MapDAO transactionMapDao = new MapDAO( boot.getX(), Transaction.getOwnClassInfo());

    boot.getX().put("transactionTestDAO", transactionMapDao);

    final TransactionDAO transactionDAO = new TransactionDAO(transactionMapDao);

    // Random number generator to generate a random UserID for payer and payee
    Random rand = new Random();

    final ArrayList<Transaction> transactionList = new ArrayList<>();

    // Generate TRANSACTION_COUNT transactions
    for ( int i = 0; i < TRANSACTION_COUNT; i++ ) {
      Transaction transaction = new Transaction();
      int payeeId, payerId;
      payeeId = rand.nextInt(USER_COUNT);
      do {
        payerId = rand.nextInt(USER_COUNT);
      } while ( payerId == payeeId );

      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(rand.nextInt(10)+1);

      transactionList.add(transaction);
    }

    Thread[] threads = new Thread[THREAD_COUNT];
    for(int i = 0; i < THREAD_COUNT; i++) {
      final int finalI = i;
      threads[i] = new Thread(new Runnable() {
        @Override
        public void run() {
          int counter = finalI;
          while(counter < TRANSACTION_COUNT) {
            transactionDAO.put(transactionList.get(counter));
            counter += THREAD_COUNT;
          }
        }
      });
    }

    System.out.println("Beginning test");

    long startTime = System.nanoTime();

    for(Thread thread : threads) {
      thread.start();
    }

    for(Thread thread : threads) {
      try {
        thread.join();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }

    long endTime = System.nanoTime() - startTime;

    System.out.println("[Multi-Thread] Completed " + TRANSACTION_COUNT + " transactions with user pool size of "
        + USER_COUNT + " in " + endTime / Math.pow(10.0, 9.0) + "s");

    final AtomicLong ai = new AtomicLong(0);
    userDao.select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        User user = (User) obj;
        Account acc = ((Account)user.getAccounts()[0]);
        if (PRINT_USER_BALANCES) {
          System.out.println(user.getId() + " : " + acc.getBalance());
        }
        ai.addAndGet(acc.getBalance());
      }
    });

    if ( ai.get() != STARTING_BALANCE * USER_COUNT ) {
      System.err.println("Balance lost: " + ai.get() + "/" + STARTING_BALANCE * USER_COUNT);
    }

    ArraySink userSink = (ArraySink) userDao.select(new ArraySink());
    List userList = userSink.getArray();
    long[] userBalances = new long[USER_COUNT];

    for(int i = 0; i < userList.size(); i++) {
      Account acc = (Account)((User)userList.get(i)).getAccounts()[0];
      userBalances[i] = acc.getBalance();
      acc.setBalance(STARTING_BALANCE);
    }

    startTime = System.nanoTime();

    for ( Transaction transaction : transactionList ) {
      transactionDAO.put(transaction);
    }

    endTime = System.nanoTime() - startTime;

    System.out.println("[Single-Threaded] Completed " + TRANSACTION_COUNT + " transactions with user pool size of "
        + USER_COUNT + " in " + endTime / Math.pow(10.0, 9.0) + "s");

    userSink = (ArraySink) userDao.select(new ArraySink());
    userList = userSink.getArray();
    long[] userBalances2 = new long[USER_COUNT];

    for(int i = 0; i < userList.size(); i++) {
      Account acc = (Account)((User)userList.get(i)).getAccounts()[0];
      userBalances2[i] = acc.getBalance();
    }

    ai.set(0);
    userDao.select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        User user = (User) obj;
        Account acc = (Account)user.getAccounts()[0];
        if (PRINT_USER_BALANCES) {
          System.out.println(user.getId() + " : " + acc.getBalance());
        }
        ai.addAndGet(acc.getBalance());
      }
    });

    if ( ai.get() != STARTING_BALANCE * USER_COUNT ) {
      System.err.println("Balance lost: " + ai.get() + "/" + STARTING_BALANCE * USER_COUNT);
    }

    System.out.println("Checking user balances for corruption");
    for(int i = 0; i < userBalances.length; i++) {
      if(userBalances[i] != userBalances2[i]) {
        System.err.println("Balances corrupted (Could be caused by transaction order and insufficient funds)");
      }
    }

  }

}
