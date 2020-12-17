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
    package: 'net.nanopay.ui',
    name: 'UserSelectionView',
    extends: 'foam.u2.Element',

    documentation: `The selection view for a RichChoiceView for user to display id and legal name.`,

    properties: [
      'data', 'userDAO'
    ],

    methods: [
      async function initE() {
        var display = 'Select a User';
        var user = await this.userDAO.find(this.data);
        if ( user ) {
          display = user.id + ' ' + user.legalName;
        }
        return this.add(display);
      }
    ]
});
