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
  package: 'net.nanopay.liquidity.ui.user',
  name: 'LiquidUserDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  // TODO: Remove this when CRUNCH is capable of handling this via capabilities.
  documentation: 'A view for creating a Liquid user.',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User'
  ],

  properties: [
    ['of', 'foam.nanos.auth.User'],
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.User.FIRST_NAME.clone().copyFrom({
            gridColumns: 6
          }),
          this.User.LAST_NAME.clone().copyFrom({
            gridColumns: 6
          }),
          this.User.EMAIL,
          this.User.DESIRED_PASSWORD.clone().copyFrom({
            validateObj: function(desiredPassword) {
              if ( desiredPassword.length < 6 ) {
                return 'Password must be at least 6 characters long.';
              }
            }
          }),
          this.User.PHONE_NUMBER,
          this.User.ORGANIZATION.clone().copyFrom({
            label: 'Company Name'
          }),
          this.User.JOB_TITLE.clone().copyFrom({
            required: true,
          }),
          this.User.ADDRESS.clone().copyFrom({
            label: '',
            view: {
              class: 'foam.u2.detail.VerticalDetailView',
              of: 'foam.nanos.auth.Address',
              propertyWhitelist: [
                this.Address.COUNTRY_ID.clone().copyFrom({
                  validateObj: function() {},
                  gridColumns: 12
                })
              ]
            }
          }),
          this.User.CAPABILITIES
        ];
      }
    }
  ]
});
