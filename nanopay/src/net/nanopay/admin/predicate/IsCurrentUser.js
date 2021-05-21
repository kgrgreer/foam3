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
  package: 'net.nanopay.admin.predicate',
  name: 'IsCurrentUser',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the userId is the current user id.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject'
  ],

  properties: [
    {
      class: 'Long',
      name: 'userId'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return obj instanceof X
          && getUserId() > 0
          && getUserId() == ((Subject) ((X) obj).get("subject")).getUser().getId();
      `
    }
  ]
});
