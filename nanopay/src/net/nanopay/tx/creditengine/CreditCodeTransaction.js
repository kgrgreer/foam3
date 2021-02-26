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
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  documentation: `This transaction is used for managing the balance in credit code accounts.
  All it does is try to increment or decrement the balance of the "applicable account" the applicable account
  is the SourceAccount, and the amount is the "amount".
  `,

  javaImports: [
    'foam.core.ValidationException',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'CreditCode Usage Increment/Decrement';
      },
      javaFactory: `
        return "CreditCode Usage Increment/Decrement";
      `,
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        return [
          'No status to choose.'
        ];
      }
    },
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      AbstractCreditCodeAccount account = (AbstractCreditCodeAccount) findSourceAccount(x);
      if ( sourceAccount == null ) {
        throw new ValidationException("CreditCode account not found");
      }
      if ( deatinationAccount != null ) {
        throw new ValidationException("destination account should not be set");
      }
      `
    },
  ]
});
