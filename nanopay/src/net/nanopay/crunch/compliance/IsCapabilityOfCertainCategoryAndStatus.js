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
  package: 'net.nanopay.crunch.compliance',
  name: 'IsCapabilityOfCertainCategoryAndStatus',
  
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  
  documentation: `Returns true if the capability of the ucj submitted is one of the onboarding capabilities`,
  
  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityCategory',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      javaFactory: `
        return foam.nanos.crunch.CapabilityJunctionStatus.PENDING;
      `
    },
    {
      name: 'category',
      class: 'String'
    },
    {
      name: 'isRecurring',
      class: 'Boolean',
      value: true
    },
    {
      name: 'statusChanged',
      class: 'Boolean',
      value: true,
      documentation: `
        Denote if a status change is required.
        If this is true, the old ucj must not be in status this.status
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");

        if ( ( getStatusChanged() && old != null && old.getStatus() == getStatus() ) || 
             ( old != null && old.getStatus() == CapabilityJunctionStatus.EXPIRED && ! getIsRecurring() ) || 
              ucj.getStatus() != getStatus() ) 
          return false;

        DAO categoryJunctionDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");

        CapabilityCategoryCapabilityJunction junction = (CapabilityCategoryCapabilityJunction) categoryJunctionDAO.find(
          AND(
            EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, getCategory()),
            EQ(CapabilityCategoryCapabilityJunction.TARGET_ID, ucj.getTargetId())
          )
        );
        
        return junction != null;
      `
    }
  ]
});
  
  