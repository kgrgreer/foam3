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
  package: 'net.nanopay.meter',
  name: 'UserDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.User.ID,
          this.User.LEGAL_NAME.clone().copyFrom({
            createVisibility: 'HIDDEN',
            updateVisibility: 'HIDDEN',
            readVisibility: 'RO',
          }),
          this.User.FIRST_NAME.clone().copyFrom({
            createVisibility: 'RW',
            updateVisibility: 'RW',
            readVisibility: 'HIDDEN',
          }),
          this.User.LAST_NAME.clone().copyFrom({
            createVisibility: 'RW',
            updateVisibility: 'RW',
            readVisibility: 'HIDDEN',
          }),
          this.User.EMAIL,
          this.User.STATUS,
          this.User.COMPLIANCE,
          this.User.BIRTHDAY,
          this.User.PHONE_NUMBER,
          this.User.ADDRESS,
          this.User.CREATED,
          this.User.TWO_FACTOR_ENABLED,
          this.User.ENTITIES.clone().copyFrom({ label: 'Businesses' }),
          this.User.COMPLIANCE_RESPONSES,
          this.User.DESIRED_PASSWORD,
          this.User.GROUP
        ];
      }
    }
  ]
});
