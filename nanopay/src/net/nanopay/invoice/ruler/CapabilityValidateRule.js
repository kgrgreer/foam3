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
    package: 'net.nanopay.invoice.ruler',
    name: 'CapabilityValidateRule',

    documentation: `When an submit ready invoice is created, this will submit the transaction.`,

    implements: [
        'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
        'foam.core.ContextAwareAgent',
        'foam.core.FObject',
        'foam.core.X',
        'foam.dao.DAO',
        'foam.nanos.crunch.CrunchService',
        'foam.nanos.crunch.Capability',
        'foam.nanos.crunch.CapabilityJunctionStatus',
        'foam.nanos.crunch.CapabilityIntercept',
        'foam.nanos.crunch.lite.Capable',
        'foam.nanos.logger.Logger',
        'foam.util.SafetyUtil',

        'net.nanopay.invoice.model.Invoice',
        'net.nanopay.invoice.model.InvoiceStatus',
        'net.nanopay.invoice.model.PaymentStatus',
        'net.nanopay.liquidity.LiquiditySettings',

        'java.util.ArrayList',
        'java.util.Arrays'
    ],

    properties: [
        {
            name: 'objectCapabilityID',
            class: 'String',
        }
    ],
  
    methods: [
        {
            name: 'applyAction',
            javaCode: `
                FObject clonedObj = (FObject) obj.fclone();
                var invoice = (Invoice) clonedObj;
                var capable = (Capable) clonedObj;

                try {
                    // If invoice is valid & capabilities are granted, set status to QUOTING
                    SafetyUtil.validate(x, invoice);
                    var crunchService = (CrunchService) x.get("crunchService");
                    var cre = new CapabilityIntercept();
                    cre.setDaoKey("invoiceDAO");

                    Arrays.stream(invoice.getUserCapabilityRequirements())
                        .filter(ucr -> {
                            var junction = crunchService.getJunction(x, ucr);
                            return junction == null || (
                                junction.getStatus() != CapabilityJunctionStatus.GRANTED &&
                                junction.getStatus() != CapabilityJunctionStatus.PENDING
                            );
                        }).forEach(ucr -> cre.addCapabilityId(ucr));

                    if (
                        Arrays.stream(invoice.getCapablePayloads()).map(cp -> cp.getCapability()).anyMatch(getObjectCapabilityID()::equals) ||
                        ( invoice.getCapablePayloads().length == 0 && Arrays.stream(capable.getCapabilityIds()).anyMatch(getObjectCapabilityID()::equals))
                        ) {
                        var reqs = new String[] { getObjectCapabilityID() };
                        if ( 
                            ! invoice.checkRequirementsStatusNoThrow(x, reqs, CapabilityJunctionStatus.GRANTED) &&
                            ! invoice.checkRequirementsStatusNoThrow(x, reqs, CapabilityJunctionStatus.PENDING)
                        ) {
                            cre.addCapable(invoice);
                        }
                    } else {
                        // Invoice doesn't contain the proper Object Capability ID, silently warn, possibly delete invoice
                        var logger = (Logger) x.get("logger");
                        logger.error("[CapabilityValidateRule]","Invoice doesn't contain needed Object Capability ID");
                        invoice.setPaymentMethod(PaymentStatus.VOID);
                        agency.submit(x, agencyX -> {
                            var invoiceDAO = (DAO) agencyX.get("invoiceDAO");
                            invoiceDAO.put(invoice);
                        }, "Reput invoice as VOID");
                        return;
                    }

                    if ( cre.getCapabilities().length > 0 || cre.getCapables().length > 0 ) {
                        // Client expects to get a SUBMIT invoice back for reput, but if wizard is prematurely closed
                        // then next time the invoice is received it will correctly be in DRAFT status
                        var newInvoice = (Invoice) invoice.fclone();
                        newInvoice.setDraft(true);
                        agency.submit(x, agencyX -> {
                            var invoiceDAO = (DAO) agencyX.get("invoiceDAO");
                            invoiceDAO.put(newInvoice);
                        }, "Reput invoice as DRAFT");
                        throw cre;
                    }

                    invoice.setPaymentMethod(PaymentStatus.QUOTED);
                    agency.submit(x, agencyX -> {
                        var invoiceDAO = (DAO) agencyX.get("invoiceDAO");
                        invoiceDAO.put(invoice);
                    }, "Reput invoice as QUOTED");
                } catch(IllegalStateException e) {
                    throw e;
                }

            
            `
        }
    ]
  });
  
