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
        'foam.nanos.crunch.CapabilityRuntimeException',
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
            agency.submit(x, agencyX -> {
                var invoice = (Invoice) obj;
                var invoiceDAO = (DAO) agencyX.get("invoiceDAO");

                try {
                    // If invoice is valid & capabilities are granted, set status to QUOTING
                    SafetyUtil.validate(agencyX, invoice);
                    var crunchService = (CrunchService) agencyX.get("crunchService");
                    var cre = new CapabilityRuntimeException();
                    cre.setDaoKey("invoiceDAO");

                    Arrays.stream(invoice.getUserCapabilityRequirements())
                        .filter(ucr -> {
                            var junction = crunchService.getJunction(agencyX, ucr);
                            return junction == null || (
                                junction.getStatus() != CapabilityJunctionStatus.GRANTED &&
                                junction.getStatus() != CapabilityJunctionStatus.PENDING
                            );
                        }).forEach(ucr -> cre.addCapabilityId(ucr));

                    if ( Arrays.stream(invoice.getCapablePayloads()).map(cp -> cp.getCapability().getId()).anyMatch(getObjectCapabilityID()::equals) ) {
                        var reqs = new String[] { getObjectCapabilityID() };
                        if ( 
                            ! invoice.checkRequirementsStatusNoThrow(agencyX, reqs, CapabilityJunctionStatus.GRANTED) &&
                            ! invoice.checkRequirementsStatusNoThrow(agencyX, reqs, CapabilityJunctionStatus.PENDING)
                        ) {
                            cre.addCapable(invoice);
                        }
                    } else {
                        // Invoice doesn't contain the proper Object Capability ID, silently warn, possibly delete invoice
                        var logger = (Logger) x.get("logger");
                        logger.error("[CapabilityValidateRule]","Invoice doesn't contain needed Object Capability ID");
                        invoice.setPaymentMethod(PaymentStatus.VOID);
                        invoiceDAO.put(invoice);
                        return;
                    }

                    if ( cre.getCapabilities().length > 0 || cre.getCapables().length > 0 ) {
                        throw cre;
                    }

                    invoice.setPaymentMethod(PaymentStatus.QUOTED);
                    invoiceDAO.put(invoice);
                } catch(IllegalStateException e) {
                    throw e;
                }

            }, "Sent out approval requests for needed payloads and granted the others");
            `
        }
    ]
  });
  