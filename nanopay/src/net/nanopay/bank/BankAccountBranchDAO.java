/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;

import static foam.mlang.MLang.EQ;

import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;

import java.util.List;

/**
 * Create an Institution if match does not exist.
 * This DAO simplifies mobile bank account additions. The mobile
 * UX provides for bank institution number but not institution
 * lookup.  When an institution is created a NOC Notification
 * is created requesting it be verified.
 */
public class BankAccountBranchDAO
  extends ProxyDAO
{
  public BankAccountBranchDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // no branch for digital account.
    if ( ! ( obj instanceof BankAccount ) ) {
      return super.put_(x, obj);
    }

    BankAccount bankAccount = (BankAccount) obj;

    Institution institution = null;
    Branch branch = bankAccount.findBranch(x);
    if ( branch != null ) {
      institution = branch.findInstitution(x);
    } else {
      institution = bankAccount.findInstitution(x);
    }

    if ( institution == null ) {
      bankAccount = (BankAccount) super.put_(x, obj);
      String message = "Insititution not set for BankAccount with Id: " + bankAccount.getId();
      // flaging the account that doesn't have an institution!
      ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), message);
      return bankAccount;
    }

    if ( branch == null && ! foam.util.SafetyUtil.isEmpty(bankAccount.getBranchId()) ) {
      // add branch.
      addBranch(x, institution, bankAccount);
    }
    bankAccount = (BankAccount) super.put_(x, bankAccount);

    if ( bankAccount.findBranch(x) == null ) {
      String message = "No BranchId was provided for the BankAccount with Id: " + bankAccount.getId();
      // flaging the account that doesn't have an institution!
      ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), message);
    }
    return bankAccount;
  }

  private void addBranch(X x, Institution institution, BankAccount bankAccount) {
    ArraySink branchSink = (ArraySink) institution.getBranches(x)
        .where(EQ(
              Branch.BRANCH_ID, bankAccount.getBranchId()
        )).limit(1).select(new ArraySink());

    List branches = branchSink.getArray();

    Branch branch;

    if ( branches.size() == 0 ) {
      // create branch
      branch = createBranch(x, institution, bankAccount.getBranchId());
    } else {
      branch = (Branch) branches.get(0);
    }
    bankAccount.setBranch(branch.getId());
  }

  private Branch createBranch(X x, Institution institution, String branchId) {
    Branch newBranch = new Branch.Builder(x)
        .setBranchId(branchId)
        .setInstitution(institution.getId())
        .build();
    DAO branchDAO = (DAO) x.get("branchDAO");
    newBranch = (Branch) branchDAO.put(newBranch);

    // send notification of branch creation.
    String message = "Branch verification required for branch with id: " + newBranch.getId() +
        " and BranchId: " + newBranch.getBranchId() + " for institution with Id: " + institution.getId();

    Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
    ((DAO) x.get("localNotificationDAO")).put(notification);
    ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
    return newBranch;
  }
}
