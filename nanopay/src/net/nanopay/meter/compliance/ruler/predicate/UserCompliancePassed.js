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
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'UserCompliancePassed',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user compliance is passed.',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        NEQ(DOT(OLD_OBJ, User.COMPLIANCE), ComplianceStatus.PASSED),
        EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.PASSED)
      ).f(obj);
      `
    }
  ]
});
