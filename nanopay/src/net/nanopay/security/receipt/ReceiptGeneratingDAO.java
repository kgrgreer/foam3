package net.nanopay.security.receipt;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;

public class ReceiptGeneratingDAO
  extends ProxyDAO
{
  protected final ReceiptGenerator generator_;

  public ReceiptGeneratingDAO(X x, ReceiptGenerator generator, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    generator_ = generator;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    generator_.add(obj);
    Receipt receipt = generator_.generate(obj);
    System.out.println(new Outputter(OutputterMode.STORAGE).stringify(receipt));
    return super.put_(x, obj);
  }
}
