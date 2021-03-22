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
  package: 'net.nanopay.auth.ruler',
  name: 'SpidLimitingPermissionedUserRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Rule that can only be seen if the user has permissions to select it.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'limitedSpidList',
      documentation: 'List of SPIDs that are limited to permission check.'
    }
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        User user = (User) obj;
        if (Arrays.stream(getLimitedSpidList()).anyMatch(s -> s.equals(user.getSpid())) {
          return user;
        }

        // When the SPID is not limited, no permission check is necessary (i.e. the rule applies to all SPIDs not listed)
        return null;
      `
    }
  ]
});
