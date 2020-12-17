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
  package: 'net.nanopay.crunch.predicate',
  name: 'BusinessPassedCompliance',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if user in context is business and has passed compliance.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityCategory',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name:'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || ! ( user instanceof Business ) ) return false;

        //check if business has unlocked international payment
        DAO categoryJunctionDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");
        final List<String> junctions = new ArrayList<>();
        categoryJunctionDAO.where(EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, "AFEXOnboarding"))
        .select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            junctions.add(((CapabilityCategoryCapabilityJunction) obj).getTargetId());
          }
        });

        UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO"))
          .find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
              IN(UserCapabilityJunction.TARGET_ID, junctions),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
            )
          );

        return ucj != null;
      `
    }
  ]
});
