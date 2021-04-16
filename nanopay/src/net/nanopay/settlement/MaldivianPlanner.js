// TODO: Going to be reworked

/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.settlement',
  name: 'MaldivianPlanner',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DigitalTransactionPlanner that also adds transfers to the settlementAccounts of the users.`,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.settlement.SettlementAccount',
    'net.nanopay.settlement.BiLateralAccount',
    'net.nanopay.settlement.SettlementTransaction',
    'net.nanopay.tx.Transfer',
    'foam.nanos.app.Mode',
    'foam.nanos.app.AppConfig',
    'foam.util.SafetyUtil',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'java.util.ArrayList',
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  
  methods: [
    /* TODO: Going to be reworked
    {
      name: 'put_',
      javaCode: `

    TransactionQuote quote = (TransactionQuote) obj;

//      if ( ((AppConfig) x.get("appConfig")).getMode() == Mode.PRODUCTION  || getEnabled() == false )
//        return getDelegate().put_(x, quote);

    Transaction request = (Transaction) quote.getRequestTransaction().fclone();

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    if ( sourceAccount instanceof DigitalAccount &&
      destinationAccount instanceof DigitalAccount && SafetyUtil.equals(request.getSourceCurrency(),request.getDestinationCurrency() ) && getEnabled() && request instanceof SettlementTransaction) {

      Transaction t = new SettlementTransaction.Builder(x).build();
      t.copyFrom(request);
      t.setIsQuoted(true);
      //-----
     List all = new ArrayList();

      DAO accountDAO = ((DAO) x.get("localAccountDAO")).where(INSTANCE_OF(SettlementAccount.class));

      long sourceSettle = ((SettlementAccount) accountDAO.find(EQ(SettlementAccount.OWNER,sourceAccount.getOwner()))).getId();
      long destinationSettle = ((SettlementAccount) accountDAO.find(EQ(SettlementAccount.OWNER,destinationAccount.getOwner()))).getId();


      // also add Bilatteral Account stuffs

      DAO accountDAO2 = ((DAO) x.get("localAccountDAO")).where(INSTANCE_OF(BiLateralAccount.class));
      long sourceBiLateral = ((BiLateralAccount) accountDAO2.find(AND(
        EQ(BiLateralAccount.OWNER,sourceAccount.getOwner()),
        EQ(BiLateralAccount.SEND_TO_ACCOUNT,TrustAccount.find(x,destinationAccount).getId())))
      ).getId();

      long destinationBiLateral = ((BiLateralAccount) accountDAO2.find(AND
        (EQ(BiLateralAccount.OWNER,destinationAccount.getOwner()),
        EQ(BiLateralAccount.SEND_TO_ACCOUNT,TrustAccount.find(x,sourceAccount).getId())))
      ).getId();
      if (sourceSettle != destinationSettle){
        all.add(new Transfer.Builder(x).setAccount(sourceBiLateral).setAmount(-request.getAmount()).build());
        all.add(new Transfer.Builder(x).setAccount(destinationBiLateral).setAmount(request.getAmount()).build());
        all.add(new Transfer.Builder(x).setAccount(sourceSettle).setAmount(-t.getAmount()).build());
        all.add(new Transfer.Builder(x).setAccount(destinationSettle).setAmount(t.getAmount()).build());
      }

      t.setTransfers((Transfer[]) all.toArray(new Transfer[0]));
      //-----
      quote.addPlan(t);
      quote.setPlan(t);
      return quote;
    }
    return getDelegate().put_(x, quote);
    `
    }
    */
  ]
});
