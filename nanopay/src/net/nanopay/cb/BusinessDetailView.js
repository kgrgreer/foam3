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
  package: 'net.nanopay.cb',
  name: 'BusinessDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.Business.ID,
          this.Business.STATUS,
          this.Business.BUSINESS_NAME,
          this.Business.BUSINESS_TYPE_ID,
          this.Business.BUSINESS_IDENTIFICATION_CODE,
          this.Business.INDIRECT_PARTICIPANT,
          this.Business.CREATED,
          this.Business.NOTE,
          this.Business.ADDRESS
        ];
      }
    }
  ]
});
