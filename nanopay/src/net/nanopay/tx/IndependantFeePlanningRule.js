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
  package: 'net.nanopay.tx',
  name: 'IndependantFeePlanningRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Create fee transaction for IndependentTransactionFeeLineItem
   CURRENTLY ONLY SUPPORTS DIGITAL ACCOUNTS AS THE FEE ACCOUNT
   `,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'foam.nanos.auth.User'

  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            long feeTotal = 0;
            DigitalAccount sourceDigital = null;

            Transaction txn = (Transaction) obj;
            Transaction root = txn.findRoot(x);
            Account dest = root.findDestinationAccount(x);
            FeeSummaryTransaction feeTxn = new FeeSummaryTransaction();

            ArrayList<IndependentTransactionFeeLineItem> lineItems = new ArrayList();
            for ( TransactionLineItem li : txn.getLineItems() ) {
              if ( li instanceof IndependentTransactionFeeLineItem ) {
                lineItems.add((IndependentTransactionFeeLineItem) li);
                feeTotal += li.getAmount();
                if (sourceDigital == null) {
                  DigitalAccount feeDest = (DigitalAccount) li.findDestinationAccount(x);
                  User owner = dest.findOwner(x);
                  sourceDigital = DigitalAccount.findDefault(x, owner, ((IndependentTransactionFeeLineItem)li).getFeeCurrency(), feeDest.getTrustAccount());
                }
              }
            }

            if ( sourceDigital == null ) {
              return;
            }

            feeTxn.setLineItems(lineItems.toArray(new IndependentTransactionFeeLineItem[lineItems.size()]));

            TransactionQuote quote = new TransactionQuote();

            DAO transactionPlannerDAO = (DAO) x.get("localTransactionPlannerDAO");
            DAO transactionDAO = (DAO) x.get("localTransactionDAO");
            quote.setRequestTransaction(feeTxn);

            feeTxn.setSourceAccount(dest.getId());
            feeTxn.setDestinationAccount(sourceDigital.getId());
            feeTxn.setAmount(feeTotal);
            feeTxn.setDestinationAmount(feeTotal);
            feeTxn.setSourceCurrency(dest.getDenomination());
            feeTxn.setDestinationCurrency(dest.getDenomination());
            feeTxn.setPayerId(dest.getOwner());
            feeTxn.setPayeeId(dest.getOwner());
            feeTxn.setName("Fee Transaction for: "+root.getId());

            try {
              quote = (TransactionQuote) transactionPlannerDAO.put(quote);
              Transaction feeTxn2 = quote.getPlan();
              feeTxn2 = (Transaction) transactionDAO.put(quote.getPlan()).fclone();
              feeTxn2.setAssociateTransaction(root.getId());
              feeTxn2.setExternalId(root.getExternalId());
              feeTxn2.setExternalInvoiceId(root.getExternalInvoiceId());
              transactionDAO.put(feeTxn2);
            } catch ( RuntimeException error ) {
              // TODO: create a ticket for fee creation failure
            }


          }
        }, "Create fee transaction for IndependentTransactionFeeLineItem");
      `
    }
  ]
 });
