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
  package: 'net.nanopay.partner.treviso.tx',
  name: 'TrevisoTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  implements: [
    'net.nanopay.meter.clearing.ClearingTimesTrait'
  ],

  documentation: `Hold Treviso specific properties`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'foam.core.Currency',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.COMPLETED ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED'],
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.SENT ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED'],
            ['DECLINED', 'DECLINED']
          ];
        }
       return ['No status to choose'];
      }
    },
    {
      name: 'clearingTimes',
      javaFactory: 'return new java.util.HashMap<>();',
      networkTransient: true,
      hidden: true
    },
    {
      name: 'estimatedCompletionDate',
      javaFactory: 'return null;'
    },
    {
      name: 'processDate',
      javaFactory: 'return null;'
    },
    {
      class: 'DateTime',
      name: 'completionDate',
      storageTransient: false
    }
  ],
 methods: [
   {
     name: `validate`,
     args: [
       { name: 'x', type: 'Context' }
     ],
     type: 'Void',
     javaCode: `
     super.validate(x);

    // Check source account owner compliance
    User sourceOwner = findSourceAccount(x).findOwner(x);
    if ( sourceOwner instanceof Business
      && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED)
    ) {
      throw new RuntimeException("Sender needs to pass business compliance.");
    }
    `
  }
  ]

});
