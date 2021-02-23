/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  name: 'InterestTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for adding Interest to LoanAccounts, enforces source/destination to always be Loan and LoanedTotalAccount`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.account.LoanAccount',
    'net.nanopay.account.LoanedTotalAccount',
    'net.nanopay.tx.model.Transaction',
    'foam.core.ValidationException',
    'java.util.List',
    'java.util.ArrayList'
  ],

  methods: [
    {
      documentation: `interest transactions can always be executed`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return true;
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      super.validate(x);
      if( ! ( findSourceAccount(x) instanceof LoanAccount ) ) {
        ((Logger)getX().get("logger")).error("Transaction must include a Loan Account as a Source Account");
        throw new ValidationException("Transaction must include a Loan Account as a Source Account");
      }
      if( ! ( findDestinationAccount(x) instanceof LoanedTotalAccount ) ) {
        ((Logger)getX().get("logger")).error("Transaction must include a LoanedTotalAccount as a Destination Account");
        throw new ValidationException("Transaction must include a LoanedTotalAccount as a Destination Account");
      }
      `
    }
  ]
});
