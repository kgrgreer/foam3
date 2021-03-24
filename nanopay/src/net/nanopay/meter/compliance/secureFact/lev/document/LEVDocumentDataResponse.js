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
  package: 'net.nanopay.meter.compliance.secureFact.lev.document',
  name: 'LEVDocumentDataResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',

  properties: [
    {
      class: 'Int',
      name: 'orderId',
      documentation: 'The orderId provided in the LEVDocumentOrderResponse.'
    },
    {
      class: 'String',
      name: 'status',
      documentation: 'The profile order data fulfillment status.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataEntity',
      name: 'entity',
      documentation: 'The entity details.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentParty',
      name: 'parties',
      documentation: 'The parties (for example Directors, Officers, Shareholders or Partners).'
    },
    {
      class: 'String',
      name: 'message',
      documentation: 'Additional message with description of the status.'
    },
    {
      name: 'type',
      value: 'LEVDocumentData'
    }
  ]
});
