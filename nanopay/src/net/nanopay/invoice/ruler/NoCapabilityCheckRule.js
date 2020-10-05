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
    name: 'NoCapabilityCheckRule',

    documentation: `When an submit ready invoice is put without any capabilities this rule will set it's status to QUOTING.`,

    implements: [
        'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
        'net.nanopay.invoice.model.Invoice',
        'net.nanopay.invoice.model.PaymentStatus',
    ],
  
    methods: [
        {
            name: 'applyAction',
            javaCode: `
            var invoice = (Invoice) obj;

            if ( invoice.getUserCapabilityRequirements().length == 0 && invoice.getCapablePayloads().length == 0 )
                invoice.setPaymentMethod(PaymentStatus.QUOTED);
            `
        }
    ]
  });
  