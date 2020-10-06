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
    name: 'TrevisoInvoiceCapabilityRule',

    documentation: `When a quote invoice is created, this will set the proper capability.`,

    implements: [
        'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
        'foam.dao.DAO',
        'foam.nanos.crunch.CrunchService',
        'foam.nanos.crunch.Capability',
        'foam.util.SafetyUtil',

        'net.nanopay.invoice.model.Invoice',
        'net.nanopay.invoice.model.InvoiceStatus',
        'net.nanopay.liquidity.LiquiditySettings',

        'java.util.ArrayList',
        'java.util.Arrays'
    ],

    constants: [
        {
            name: 'USER_CAPABILITY_ID',
            type: 'String',
            value: '554af38a-8225-87c8-dfdf-eeb15f71215f-49'
        },
        {
            name: 'OBJECT_CAPABILITY_ID',
            type: 'String',
            value: 'dfbe9220-ba4e-42d1-9bed-f4b4f8efcbb8'
        }
    ],
  
    methods: [
        {
            name: 'applyAction',
            javaCode: `
            var invoice = (Invoice) obj;
            
            var capabilityDAO = (DAO) x.get("capabilityDAO");
            SafetyUtil.validate(x, (Capability) capabilityDAO.find(USER_CAPABILITY_ID));
            
            var capablePayloadList = new ArrayList<String>(Arrays.asList(invoice.getUserCapabilityRequirements()));
            if ( ! capablePayloadList.contains(USER_CAPABILITY_ID) ) {
                capablePayloadList.add(USER_CAPABILITY_ID);
                invoice.setUserCapabilityRequirements((String[]) capablePayloadList.toArray(new String[0]));
            }

            invoice.addRequirement(x, OBJECT_CAPABILITY_ID);
            `
        }
    ]
  });
  