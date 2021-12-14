/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'foam.nanos.ruler',
  name: 'PermissionedUserRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: `
    Authorizable rule - rule execution is permitted via permissions. 'rule.read.ruleId'
  `,

  javaImports: [
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: 'return (User) obj;'
    }
  ]
});
