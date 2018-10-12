/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.model.Transaction;

public class DigitalTransactionPlanDAO extends ProxyDAO {

  public DigitalTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    foam.mlang.predicate.Predicate[] predicates = { foam.mlang.MLang.NOT(foam.mlang.MLang.INSTANCE_OF(net.nanopay.model.Business.class)), foam.mlang.MLang.NOT(foam.mlang.MLang.INSTANCE_OF(net.nanopay.contacts.Contact.class)) };
    new foam.dao.PMDAO(x, new foam.dao.FilteredDAO(x, new foam.mlang.predicate.And(predicates), new foam.nanos.auth.PreventDuplicateEmailDAO(x, new net.nanopay.admin.AccountStatusUserDAO(x, new foam.nanos.geocode.GoogleMapsGeocodingDAO(x, "AIzaSyDIf0KB9lok7rg0HU9Q92uK2JuOXpXNnr0", foam.nanos.auth.User.ADDRESS, new net.nanopay.auth.email.EmailVerificationDAO(x, new net.nanopay.onboarding.email.RegistrationSubmissionEmailDAO(x,new net.nanopay.onboarding.email.RegistrationDisabledEmailDAO(x,new net.nanopay.onboarding.email.RegistrationApprovedEmailDAO(x, new foam.dao.OnDeleteRemoveChildrenDAO(x, new net.nanopay.account.CreateDefaultDigitalAccountOnUserCreateDAO(x, /*new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x).setDelegate(*/(DAO)x.get("bareUserDAO")/*).build()*/), foam.nanos.auth.User.ID, net.nanopay.account.Account.OWNER, "localAccountDAO")))))))))

    if ( ! ( obj instanceof TransactionQuote ) ) {
      return getDelegate().put_(x, obj);
    }
    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = quote.getRequestTransaction();
    if ( txn.findSourceAccount(x) instanceof DigitalAccount && txn.findDestinationAccount(x) instanceof DigitalAccount ) {
      if ( txn.getSourceCurrency() == txn.getDestinationCurrency() ) {
        TransactionPlan plan = new TransactionPlan.Builder(x).build();
        DigitalTransaction dt = new DigitalTransaction.Builder(x).build();
        long fee = 50;
        Transfer [] transfers = new Transfer[] {
          new Transfer.Builder(getX())
            .setDescription("Digital transaction fee to nanopay account")
            .setAccount(2)
            .setAmount(fee)
            .build(),
          new Transfer.Builder(getX())
            .setDescription("Digital transaction fee. (fake)")
            .setAccount(txn.getSourceAccount())
            .setAmount(-fee)
            .setVisible(true)
            .build()
        };
        txn.add(transfers);
        dt.copyFrom(txn);
        dt.setIsQuoted(true);
        plan.setTransaction(dt);
        quote.setPlan(plan);
      }
    }
    return super.put_(x, quote);
  }
}
