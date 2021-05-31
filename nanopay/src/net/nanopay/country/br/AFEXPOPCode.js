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
  package: 'net.nanopay.country.br',
  name: 'AFEXPOPCode',
  documentation: 'Mapping AFEX Purpose Of Payment codes to brazilian Nature codes',

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'afexCode',
      documentation: 'AFEX Purpose of Payment code as defined in AFEX API doc: https://doc.api.afex.com/?version=latest#28166472-e705-4f51-b6e6-1c6d64100eb1'
    },
    {
      class: 'String',
      name: 'partnerCode',
      documentation: 'Purpose of Payment code being used by partner eg. bepay uses nature codes for Brazil and kotak uses purpose codes for India'
    },
    {
      class: 'String',
      name: 'countryCode',
      documentation: 'Country code for the partnerCode, eg. "BR" for Brazilian nature code.`
    }
  ]
});
