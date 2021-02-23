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

// TODO: move to CC project when project-specific builds available
foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'CCTransferView',
  extends: 'net.nanopay.ui.TransferView',

  imports: [ 'userDAO as userDAO_' ],

  documentation: 'CC customized TransferView which only displays users in the "business" group.',

  properties: [
    {
      name: 'userDAO',
      factory: function() {
        return this.userDAO_.where(this.EQ(this.User.GROUP, "business"));
      }
    }
  ]
});
