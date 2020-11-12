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
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'sourceCapabilityList',
    },
    {
      class: 'Long',
      name: 'sourceCapabilityExceptionListUpperLimit'
    },
    {
      class: 'StringArray',
      name: 'sourceCapabilityExceptionList'
    },
    {
      class: 'StringArray',
      name: 'destinationCapabilityList'
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
        List sourceCapabilityList = new ArrayList(Arrays.asList(getSourceCapabilityList()));
        if ( txn.getAmount() < getSourceCapabilityExceptionListUpperLimit() ) {
          List exceptionList = new ArrayList(Arrays.asList(getSourceCapabilityExceptionList()));
          if ( exceptionList != null ) {
            sourceCapabilityList.addAll(exceptionList);
          }
        }

        // Check source account owner compliance
        User sourceOwner = txn.findSourceAccount(x).findOwner(x);
        if ( ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED) ||
             ! grantedOneOfCapabilitySet(x, sourceOwner, sourceCapabilityList)) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(txn.getId() + " planner validation failure on source account owner. (" + sourceOwner.getId() + ") " + sourceOwner.toSummary());
              
          return false;
        }

        // Check destination account owner compliance
        List destinationCapabilityList = new ArrayList(Arrays.asList(getDestinationCapabilityList()));
        User destinationOwner = txn.findDestinationAccount(x).findOwner(x);
        if ( ! destinationOwner.getCompliance().equals(ComplianceStatus.PASSED) ||
             ! grantedOneOfCapabilitySet(x, destinationOwner, destinationCapabilityList) ) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(txn.getId() + " planner validation failure on destination account owner. (" + destinationOwner.getId() + ") " + destinationOwner.toSummary());
          
          return false;
        }

        return true;
      `
    },
    {
      name: 'grantedOneOfCapabilitySet',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'User' },
        { name: 'capabilityList', type: 'List' }
      ],
      javaCode: `
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        Subject subject = new Subject.Builder(x).setUser(user).build();
        X subjectX = x.put("subject", subject);
        for ( Object id : capabilityList ) {
          String capabilityId = (String) id;
          UserCapabilityJunction ucj = crunchService.getJunctionForSubject(subjectX, capabilityId, subject);
          if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) 
            return true;
        }

        // No capabilities in set were granted
        return false;
      `
    }
  ]
});
