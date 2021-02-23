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
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CrunchService',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name:'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || ! ( user instanceof Business ) ) return false;

        CrunchService crunchService = (CrunchService) x.get("crunchService");
        return crunchService.atLeastOneInCategory(x, "AFEXOnboarding");
      `
    }
  ]
});
