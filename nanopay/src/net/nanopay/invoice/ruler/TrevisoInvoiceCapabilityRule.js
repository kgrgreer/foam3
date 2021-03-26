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
        'foam.nanos.crunch.ServerCrunchService',
        'foam.nanos.crunch.UserCapabilityJunction',
        'foam.util.SafetyUtil',

        'net.nanopay.invoice.model.Invoice',
        'net.nanopay.invoice.model.InvoiceStatus',
        'net.nanopay.liquidity.LiquiditySettings',

        'java.util.ArrayList',
        'java.util.Arrays',

        'static foam.mlang.MLang.*',
        'static foam.nanos.crunch.CapabilityJunctionStatus.*'
    ],

    constants: [
        {
            name: 'USER_CAPABILITY_ID',
            type: 'String',
            value: '2910C2C9-3597-42A3-BF85-CFBC8F0E1388',
            documentation: `
              The user requires this capability to submit an invoice.
            `
        },
        {
            name: 'OBJECT_CAPABILITY_ID',
            type: 'String',
            value: 'invoice.capable.treviso',
            documentation: `
              This invoice requires its own fulfillment of this capability.
            `
        }
    ],
  
    methods: [
        {
            name: 'applyAction',
            javaCode: `
              var capabilityDAO = (DAO) x.get("capabilityDAO");
              var crunchService = (ServerCrunchService) x.get("crunchService");

              // Can't use agency here as it would cause this rule's logic to
              //   run after the capability validate rule. To get around this
              //   the context is obtained from crunchService.
              var updateX = crunchService.getX();
              updateX = updateX.put("subject", x.get("subject"));

              var invoice = (Invoice) obj;
              
              SafetyUtil.validate(x, (Capability) capabilityDAO.find(USER_CAPABILITY_ID));

              // Check if user capability is already granted;
              //   if it is, it should not be included in the intercept
              UserCapabilityJunction userUCJ = crunchService
                .getJunction(x, USER_CAPABILITY_ID);
              if ( userUCJ == null ) userUCJ = crunchService
                .updateJunction(updateX, USER_CAPABILITY_ID, null, null);

              boolean isGranted = userUCJ.getStatus() == GRANTED;
              
              var userCapabilityList = new ArrayList<String>(Arrays.asList(invoice.getUserCapabilityRequirements()));
              if ( ! userCapabilityList.contains(USER_CAPABILITY_ID) && ! isGranted ) {
                userCapabilityList.add(USER_CAPABILITY_ID);
                invoice.setUserCapabilityRequirements((String[]) userCapabilityList.toArray(new String[0]));
              }

              invoice.addRequirement(x, OBJECT_CAPABILITY_ID);
            `
        }
    ]
  });
  