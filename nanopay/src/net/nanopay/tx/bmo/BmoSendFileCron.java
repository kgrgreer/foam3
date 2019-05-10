package net.nanopay.tx.bmo;

import foam.core.ContextAgent;
import foam.core.X;

public class BmoSendFileCron implements ContextAgent {

  @Override
  public void execute(X x) {
    new BmoEftFileGenerator().mockFile();
  }

}
