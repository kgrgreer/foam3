package net.nanopay.fx.lianlianpay;

import foam.core.ContextAwareSupport;
import net.nanopay.fx.lianlianpay.model.InstructionCombined;
import net.nanopay.fx.lianlianpay.model.PreProcessResult;
import net.nanopay.fx.lianlianpay.model.Reconciliation;
import net.nanopay.fx.lianlianpay.model.Statement;

public class LianLianPayService
    extends ContextAwareSupport
    implements LianLianPay
{
  @Override
  public void uploadInstructionCombined(InstructionCombined request) {

  }

  @Override
  public PreProcessResult downloadPreProcessResult() {
    return null;
  }

  @Override
  public Reconciliation downloadReconciliation() {
    return null;
  }

  @Override
  public Statement downloadStatement() {
    return null;
  }
}