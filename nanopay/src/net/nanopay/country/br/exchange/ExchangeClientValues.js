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
  package: 'net.nanopay.country.br.exchange',
  name: 'ExchangeClientValues',

  documentation: `Represents Service Provider specific Exchange client values
  `,

  implements: [
    'foam.nanos.auth.ServiceProviderAware',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Int',
      name: 'agencia',
      documentation: 'Agency Code'
    },
    {
      class: 'String',
      name: 'BANCO'
    },
    {
      class: 'String',
      name: 'CONTA'
    },
    {
      class: 'String',
      name: 'beneficiaryType',
      documentation: 'Type of beneficiary supported. A - Individual/Company'
    },
    {
      class: 'String',
      name: 'initialStatus',
      documentation: 'Initial status when creating transaction in exchange'
    },
    {
      class: 'String',
      name: 'processorName',
      documentation: 'Bank or financial institution that will process the remittance'
    },
    {
      class: 'String',
      name: 'IMPRESSO',
      documentation: 'E-mail indicator: T - Client / Broker, C - Client, R - Broker, N - No'
    },
    {
      class: 'String',
      name: 'GIRO',
      documentation: 'Turn: S - Yes, N - No'
    },
    {
      class: 'String',
      name: 'OPLINHA',
      documentation: 'Line: Y - Yes, N - No'
    },
    {
      class: 'String',
      name: 'PLATBMF',
      documentation: 'BMF Platform: Y - Yes, N - No'
    },
    {
      class: 'String',
      name: 'RSISB',
      documentation: `Transmission to Sisbacen: P - CAM0021 (Individualized Primary Market), A - Bacen File (Foreign Exchange Correspondent) Interbank Operations:
        R - CAM0009 - STR (Purchase), B - CAM0006 - BMF (Purchase), C - CAM0009 - STR (Sale), B - CAM0006 - BMF (Sale)`
    },
    {
      class: 'String',
      name: 'LEILAO',
      documentation: 'Auction: S - Yes, N - No'
    },
    {
      class: 'String',
      name: 'AVISO2'
    },
    {
      class: 'Int',
      name: 'TIPO',
      documentation: 'Operation type code: 01 - Export, 02 - Import, 03 - Financial Transfer Abroad, 04 - Financial Transfer Abroad, 05 - Banking Purchase, 06 - Banking Sale'
    },
    {
      class: 'String',
      name: 'GERENTE',
      documentation: 'Platform Manager'
    },
    {
      class: 'String',
      name: 'FORMAME'
    },
    {
      class: 'String',
      name: 'FORMAEN',
      documentation: "Delivery method of the national currency: “CAIXA” - Caixa “CC” - Current account “TED” - Electronic Transfer"
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    }
  ]
});
