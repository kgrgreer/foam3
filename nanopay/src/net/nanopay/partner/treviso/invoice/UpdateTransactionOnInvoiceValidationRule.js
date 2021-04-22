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
    package: 'net.nanopay.partner.treviso.invoice',
    name: 'UpdateTransactionOnInvoiceValidationRule',

    documentation: `When an submit ready invoice is put without any capabilities this rule will set it's status to QUOTING.`,

    implements: [
        'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
        'foam.dao.DAO',
        'foam.nanos.crunch.CapabilityJunctionStatus',
        'foam.nanos.crunch.CrunchService',
        'foam.util.SafetyUtil',
        'foam.log.LogLevel',

        'net.nanopay.invoice.model.Invoice',
        'net.nanopay.invoice.model.PaymentStatus',
        'net.nanopay.tx.model.Transaction',
        'net.nanopay.tx.model.TransactionStatus',

        'foam.nanos.alarming.Alarm',
        'foam.nanos.alarming.AlarmReason'
    ],

    properties: [
        {
            class: 'String',
            name:'requiredCapabilityId',
        }
    ],
  
    methods: [
        {
            name: 'applyAction',
            javaCode: `
            agency.submit(x, agencyX -> {
                var invoice = (Invoice) obj;

                if ( SafetyUtil.isEmpty(invoice.getPaymentId()) ){
                    String message = "Invoice " + invoice.getId() + " does not have a paymentId while in processing";
                    ((DAO) agencyX.get("alarmDAO")).put(new Alarm.Builder(x)
                        .setName("Update Transaction On Invoice Validation")
                        .setReason(AlarmReason.UNSPECIFIED)
                        .setSeverity(LogLevel.ERROR)
                        .setNote(message)
                        .build());
                    
                    throw new RuntimeException(message);
                }

                if ( ! SafetyUtil.isEmpty(getRequiredCapabilityId()) ){
                    try {
                        // If invoice is valid & capabilities are granted, change the summaryTransaction status to completed
                        SafetyUtil.validate(agencyX, invoice);
                        var crunchService = (CrunchService) agencyX.get("crunchService");

                        boolean isRejected = invoice.checkRequirementsStatusNoThrow(x, new String[]{getRequiredCapabilityId()}, CapabilityJunctionStatus.REJECTED);

                        if ( isRejected ){
                            var transactionDAO = (DAO) agencyX.get("transactionDAO");
                            var transaction = (Transaction) transactionDAO.find(invoice.getPaymentId());
                            if (transaction != null) {
                                transaction = (Transaction) transaction.fclone();
                                transaction.setStatus(TransactionStatus.CANCELLED);
                                transactionDAO.put(transaction);
                            }
                            
                            var invoiceDAO = (DAO) agencyX.get("invoiceDAO");
                        
                            invoice.setPaymentMethod(PaymentStatus.REJECTED);

                            invoiceDAO.put(invoice);
                            return;
                        }
                        try {
                            invoice.verifyRequirements(x, new String[]{ getRequiredCapabilityId() });
                        } catch (IllegalStateException e) {
                            return;
                        }
                    } catch (IllegalStateException e) {
                        throw e;
                    }
                }

                try{
                    var transactionDAO = (DAO) agencyX.get("transactionDAO");
                    var transaction = (Transaction) transactionDAO.find(invoice.getPaymentId());
                    if (transaction != null) {
                        transaction = (Transaction) transaction.fclone();
                        transaction.setStatus(TransactionStatus.COMPLETED);
                        transactionDAO.put(transaction);
                    }
                } catch (IllegalStateException e) {
                    throw e;
                }
            }, "Updates transaction to completed when all capables are approved for the user");
            `
        }
    ]
  });
  
