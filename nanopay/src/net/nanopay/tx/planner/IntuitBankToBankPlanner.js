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
  package: 'net.nanopay.tx.planner',
  name: 'IntuitBankToBankPlanner',
  extends: 'net.nanopay.tx.planner.BankToBankPlanner',

  documentation: 'Planner for bank to bank transactions for Intuit',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.planner.exceptions.PlannerCapabilityIncompleteException',
    'net.nanopay.tx.planner.exceptions.PlannerComplianceFailureException',
    'net.nanopay.tx.planner.exceptions.PlannerStatusInactiveException'
  ],

  messages: [
    { name: 'SOURCE_OWNER_INACTIVE', message: 'Invalid source account owner status: ' },
    { name: 'DESTINATION_OWNER_INACTIVE', message: 'Invalid destination account owner status: ' },
    { name: 'SOURCE_OWNER_COMPLIANCE_FAILED', message: 'Compliance failed for source account owner' },
    { name: 'DESTINATION_OWNER_COMPLIANCE_FAILED', message: 'Compliance failed for destination account owner' },
    { name: 'SOURCE_OWNER_INSUFFICIENT_CAPABILITIES', message: 'Insufficient capabilities for source account owner' },
    { name: 'DESTINATION_OWNER_INSUFFICIENT_CAPABILITIES', message: 'Insufficient capabilities for destination account owner' },
  ],

  properties: [
    {
      name: 'createCompliance',
      value: true
    },
    {
      name: 'createUserCompliance',
      value: true
    },
    {
      name: 'createLimit',
      value: true
    }
  ],

  methods: [
    {
      name: 'validatePlan',
      documentation: 'final step validation to see if there are any line items etc to be filled out',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        // Check source account owner compliance
        User sourceOwner = txn.findSourceAccount(x).findOwner(x);
        if ( ! sourceOwner.getStatus().equals(AccountStatus.ACTIVE) ) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(txn.getId() + " planner validation failure on source account owner. (" + sourceOwner.getId() + ") " + sourceOwner.toSummary() + " - " + sourceOwner.getStatus());
          
          PlannerStatusInactiveException exception = new PlannerStatusInactiveException(SOURCE_OWNER_INACTIVE + sourceOwner.getStatus());
          exception.setTransactionId(txn.getId());
          exception.setEntityId(sourceOwner.getId());
          exception.setEntityClass(sourceOwner.getClass().getName());
          exception.setStatus(sourceOwner.getStatus());
          throw exception;
        } else if ( sourceOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(txn.getId() + " planner validation failure on source account owner. (" + sourceOwner.getId() + ") " + sourceOwner.toSummary());
          
          PlannerCapabilityIncompleteException exception = 
            ( sourceOwner.getCompliance().equals(ComplianceStatus.FAILED) ) ?
              new PlannerComplianceFailureException(SOURCE_OWNER_COMPLIANCE_FAILED) :
              new PlannerCapabilityIncompleteException(SOURCE_OWNER_INSUFFICIENT_CAPABILITIES);
          exception.setTransactionId(txn.getId());
          exception.setEntityId(sourceOwner.getId());
          exception.setEntityClass(sourceOwner.getClass().getName());
          throw exception;
        }

        // Check destination account owner compliance
        User destinationOwner = txn.findDestinationAccount(x).findOwner(x);
        if ( ! destinationOwner.getStatus().equals(AccountStatus.ACTIVE) ) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(txn.getId() + " planner validation failure on destination account owner. (" + destinationOwner.getId() + ") " + destinationOwner.toSummary() + " - " + destinationOwner.getStatus());

          PlannerStatusInactiveException exception = new PlannerStatusInactiveException(DESTINATION_OWNER_INACTIVE + destinationOwner.getStatus());
          exception.setTransactionId(txn.getId());
          exception.setEntityId(destinationOwner.getId());
          exception.setEntityClass(destinationOwner.getClass().getName());
          exception.setStatus(destinationOwner.getStatus());
          throw exception;
        } else if ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(txn.getId() + " planner validation failure on destination account owner. (" + destinationOwner.getId() + ") " + destinationOwner.toSummary());

          PlannerCapabilityIncompleteException exception = 
            ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) ?
              new PlannerComplianceFailureException(DESTINATION_OWNER_COMPLIANCE_FAILED) :
              new PlannerCapabilityIncompleteException(DESTINATION_OWNER_INSUFFICIENT_CAPABILITIES);
          exception.setTransactionId(txn.getId());
          exception.setEntityId(destinationOwner.getId());
          exception.setEntityClass(destinationOwner.getClass().getName());
          throw exception;
        }

        return true;
      `
    }
  ]
});
