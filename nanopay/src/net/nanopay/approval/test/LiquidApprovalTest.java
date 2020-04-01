package net.nanopay.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;


public class LiquidApprovalTest extends ApprovalTestExecutor {
  public LiquidApprovalTests() {
    super("all_successful", new ApprovalTestExecutorState[] { 
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // create
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // update
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.DELETED), // remove
    });
  }
}

/*
// Reject create
public class LiquidApprovalTest01 extends ApprovalTestExecutor {
  public LiquidApprovalTests() {
    super("all_successful", new ApprovalTestExecutorState[] { 
      new ApprovalTestExecutorState(ApprovalStatus.REJECTED, LifecycleState.REJECTED) // create
    });
  }
}

// Reject update
public class LiquidApprovalTest02 extends ApprovalTestExecutor {
  public LiquidApprovalTests() {
    super("all_successful", new ApprovalTestExecutorState[] { 
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // create
      new ApprovalTestExecutorState(ApprovalStatus.REJECTED, LifecycleState.ACTIVE), // update
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.DELETED), // remove
    });
  }
}

// Reject delete
public class LiquidApprovalTest03 extends ApprovalTestExecutor {
  public LiquidApprovalTests() {
    super("all_successful", new ApprovalTestExecutorState[] { 
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // create
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // update
      new ApprovalTestExecutorState(ApprovalStatus.REJECTED, LifecycleState.ACTIVE), // remove
    });
  }
}
}*/
