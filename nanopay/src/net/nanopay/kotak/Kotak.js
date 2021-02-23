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

foam.INTERFACE({
  package: 'net.nanopay.kotak',
  name: 'Kotak',

  documentation: 'Interface for Kotak API',

  methods: [
    {
      name: 'submitPayment',
      async: true,
      type: 'net.nanopay.kotak.model.paymentResponse.AcknowledgementType',
      args: [
        {
          type: 'FObject',
          name: 'request'
        }
      ]
    },
    {
      name: 'submitReversal',
      async: true,
      type: 'net.nanopay.kotak.model.reversal.Reversal',
      args: [
        {
          type: 'net.nanopay.kotak.model.reversal.Reversal',
          name: 'request'
        }
      ]
    },
    {
      name: 'submitSOAPPayment',
      async: true,
      type: 'net.nanopay.kotak.model.paymentResponse.AcknowledgementType',
      args: [
        {
          type: 'FObject',
          name: 'request'
        }
      ]
    },
    {
      name: 'submitSOAPReversal',
      async: true,
      type: 'net.nanopay.kotak.model.reversal.Reversal',
      args: [
        {
          type: 'net.nanopay.kotak.model.reversal.Reversal',
          name: 'request'
        }
      ]
    }
  ]
});
