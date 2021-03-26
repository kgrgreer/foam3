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
  package: 'net.nanopay.notification',
  name: 'PermissionedNotificationSettingRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Rule that can only be seen if the user or the agent of a business has permissions to select it.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction'
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        if ( obj instanceof User ) {
          return (User) obj;
        }

        if ( obj instanceof UserUserJunction ) {
          return ((UserUserJunction) obj).findSourceId(x);
        }

        return null;
      `
    }
  ]
});
