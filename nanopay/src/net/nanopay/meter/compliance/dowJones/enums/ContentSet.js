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

foam.ENUM({
  package: 'net.nanopay.meter.compliance.dowJones.enums',
  name: 'ContentSet',

  documentation: 'The content sets included in the search.',

  values: [
    {
      name: 'WATCHLIST',
      label: 'Watchlist'
    },
    {
      name: 'STATE_OWNED_COMPANIES',
      label: 'State Owned Companies'
    },
    {
      name: 'ADVERSE_MEDIA_ENTITIES',
      label: 'Adverse Media - Entities'
    },
    {
      name: 'TRADE_COMPLIANCE',
      label: 'Trade Compliance'
    }
  ]
});
