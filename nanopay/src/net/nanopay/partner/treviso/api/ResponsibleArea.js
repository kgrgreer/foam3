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
  package: 'net.nanopay.partner.treviso.api',
  name: 'ResponsibleArea',

  properties: [
    {
      class: 'String',
      name: 'extCode',
      shortName: 'ext_code',
      documentation: 'External code of the responsible area'
    },
    {
      class: 'String',
      name: 'respAreaNm',
      shortName: 'resp_area_nm',
      documentation: 'Responsible area name'
    },
    {
      class: 'String',
      name: 'email',
      shortName: 'email',
      documentation: 'Responsible area name'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.CurrentPlatform',
      name: 'currentPlatform',
      shortName: 'currentPlatform',
      documentation: 'Platform associated with responsible area'
    },
  ]
});
