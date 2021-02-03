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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXUser',
  extends: 'net.nanopay.fx.afex.AFEXBusiness',

  documentation: `
    Model used to store AFEX related data for a user,
    Uses the same properties as AFEXBusiness except for tableCellFormatter to look up
    user name for 'user' property
  `,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      documentation: `The ID for the user`,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.__subSubContext__.publicUserDAO.find(value).then( function( user ) {
          if ( user ) self.add(user.legalName);
        });
      }
    }
  ]
});
