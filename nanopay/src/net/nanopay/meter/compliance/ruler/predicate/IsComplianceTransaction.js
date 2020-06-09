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
  name: 'IsComplianceTransaction',

  documentation: 'Returns true if new object is a ComplianceTransaction.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.ComplianceTransaction',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      javaFactory: 'return ComplianceTransaction.getOwnClassInfo();'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, CLASS_OF(getOf().getObjClass())), true
        ).f(obj);
      `
    }
  ]
});
