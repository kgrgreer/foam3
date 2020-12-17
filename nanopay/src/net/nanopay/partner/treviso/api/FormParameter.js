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
  name: 'FormParameter',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.Product',
      name: 'productDTO',
      shortName: 'productDTO'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.Template',
      name: 'template',
      shortName: 'template'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.FormOperationType',
      name: 'operationType',
      shortName: 'operationType'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.CounterPartType',
      name: 'counterPartType',
      shortName: 'counterPartType'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.Workflow',
      name: 'workflow',
      shortName: 'workflow'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.partner.treviso.api.Signatory',
      name: 'signerList',
      shortName: 'signerList'
    }
  ]
});
