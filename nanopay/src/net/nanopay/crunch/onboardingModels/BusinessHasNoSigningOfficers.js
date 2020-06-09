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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessHasNoSigningOfficers',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the business has no signing officer junctions`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || ! ( user instanceof Business ) ) return false;

        List<BusinessUserJunction> soJunction = ((ArraySink) signingOfficerJunctionDAO
          .where(EQ(BusinessUserJunction.SOURCE_ID, user.getId()))
          .select(new ArraySink()))
          .getArray();
        return soJunction.size() == 0;
      `
    }
  ]
});
  