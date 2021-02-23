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
  package: 'net.nanopay.flinks.external',
  name: 'BusinessOverrideData',
  extends: 'net.nanopay.flinks.external.OverrideData',
  documentation: 'Business override data.',

  properties: [
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Business name'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'mailingAddress',
      documentation: 'Address'
    },
    {
      class: 'String',
      name: 'externalId',
      documentation: 'External ID for business'
    },
  ]
});
