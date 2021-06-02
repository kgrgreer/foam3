
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
  package: 'net.nanopay.tx.ruler',
  name: 'UserComplianceTransactionAction',

  documentation: 'Checks whether a user compliance transaction can be marked complete.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.ruler.exceptions.TransactionValidationException',
    'net.nanopay.tx.UserComplianceTransaction',
    'net.nanopay.tx.model.Transaction'
  ],

  messages: [
    { name: 'SOURCE_OWNER_NOT_FOUND', message: 'Source account owner not found: ' },
    { name: 'DESTINATION_OWNER_NOT_FOUND', message: 'Destination account not found: ' },
    { name: 'NOT_FOUND', message: 'NOT FOUND'}
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
      name: 'applyAction',
      javaCode: `
        UserComplianceTransaction txn = (UserComplianceTransaction) obj;  

        // Source capabilities necessary for performing transactions
        List sourceCapabilityList = new ArrayList(Arrays.asList(getSourceCapabilityList()));
        if ( txn.getAmount() < getSourceCapabilityExceptionListUpperLimit() ) {
          List exceptionList = new ArrayList(Arrays.asList(getSourceCapabilityExceptionList()));
          if ( exceptionList != null ) {
            sourceCapabilityList.addAll(exceptionList);
          }
        }

        // Destination capabilities for performing transactions
        List destinationCapabilityList = new ArrayList(Arrays.asList(getDestinationCapabilityList()));
        
        // Find account owners
        Account sourceAccount = txn.findSourceAccount(x);
        User sourceOwner = sourceAccount != null ? sourceAccount.findOwner(x) : null;
        Account destinationAccount = txn.findDestinationAccount(x);
        User destinationOwner = destinationAccount != null ? destinationAccount.findOwner(x) : null;
        
        if ( sourceOwner == null ) {
          getLogger(x).warning(txn.getId() + " user complaince validation failure on source account: " + sourceAccount);
          TransactionValidationException exception = new TransactionValidationException(SOURCE_OWNER_NOT_FOUND + (sourceAccount != null ? sourceAccount.getId() : NOT_FOUND));
          exception.setPropName("sourceAccount");
          exception.setTransactionId(txn.getId());
          throw exception;
        }

        if ( destinationOwner == null ) {
          getLogger(x).warning(txn.getId() + " user complaince validation failure on destination account: " + destinationAccount);
          TransactionValidationException exception = new TransactionValidationException(DESTINATION_OWNER_NOT_FOUND + (destinationAccount != null ? destinationAccount.getId() : NOT_FOUND));
          exception.setPropName("destinationAccount");
          exception.setTransactionId(txn.getId());
          throw exception;
        }

        // Check whether the account owners have failed compliance
        if (sourceOwner.getCompliance().equals(ComplianceStatus.FAILED) ||
            destinationOwner.getCompliance().equals(ComplianceStatus.FAILED)) {
            txn.setStatus(TransactionStatus.DECLINED);
            return;
        }
        
        // Check whether owners have passed compliance or have the capabilities to send transactions
        if ((sourceOwner.getCompliance().equals(ComplianceStatus.PASSED) || grantedOneOfCapabilitySet(x, sourceOwner, sourceCapabilityList)) &&
            (destinationOwner.getCompliance().equals(ComplianceStatus.PASSED) || grantedOneOfCapabilitySet(x, destinationOwner, destinationCapabilityList))) {
            txn.setStatus(TransactionStatus.COMPLETED);
            return;
        }
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
    },
    {
      name: 'getLogger',
      type: 'foam.nanos.logger.Logger',
      args: [ { name: 'x', type: 'Context' } ],
      javaCode: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) x.get("logger"));
      `
    }
  ]
});
