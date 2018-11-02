package net.nanopay.security.receipt;

import foam.core.X;
import net.nanopay.security.KeyStoreManager;
import net.nanopay.security.PKCS12KeyStoreManager;

public class Main {

  public static void main(String[] args)
    throws java.lang.Exception
  {
    foam.core.X x = foam.core.EmptyX.instance();
    foam.core.ClassInfo of = foam.nanos.auth.User.getOwnClassInfo();
    foam.dao.DAO delegate = new foam.dao.MDAO(of);

    // set up keystore
    KeyStoreManager manager = new PKCS12KeyStoreManager.Builder(x).build();
    manager.unlock();

    // store in context
    x = x.put("keyStoreManager", manager);

    ReceiptGenerator generator = new TimedBasedReceiptGenerator.Builder(x).build();
    ReceiptGeneratingDAO dao = new ReceiptGeneratingDAO.Builder(x)
      .setGenerator(generator)
      .setDelegate(delegate)
      .build();
    generator.start();

    int count = 99;
    java.util.Random srand = new java.security.SecureRandom();

    /**
     * Create 10 threads all which add to the dao
     */
    final X finalX = x;
    for ( int i = 0 ; i < count; ++i ) {
      new Thread(new Runnable() {
        @Override
        public void run() {
          try {
            while ( true ) {
              foam.core.FObject obj = new foam.nanos.auth.User.Builder(finalX)
                .setId(srand.nextInt())
                .setEmail(java.util.UUID.randomUUID().toString() + "@nanopay.net")
                .build();

              dao.put(obj);
            }
          } catch (Throwable t) {
             t.printStackTrace();
          }
        }
      }).start();
    }
  }
}
