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
  name: 'Address',

  properties: [
    {
      class: 'String',
      name: 'extCode',
      shortName: 'ext_code',
      documentation: 'External address code'
    },
    {
      class: 'String',
      name: 'stAbbrvtn',
      shortName: 'st_abbrvtn',
      documentation: 'Address state'
    },
    {
      class: 'String',
      name: 'cityName',
      shortName: 'city_name',
    },
    {
      class: 'String',
      name: 'qtrName',
      shortName: 'qtr_name',
      documentation: 'Address neighborhood'
    },
    {
      class: 'String',
      name: 'addrName',
      shortName: 'addr_name',
      documentation: 'Street name / street address'
    },
    {
      class: 'String',
      name: 'addrNr',
      shortName: 'addr_nr',
      documentation: 'Address number'
    },
    {
      class: 'String',
      name: 'addrCmplmt',
      shortName: 'addr_nr',
      documentation: 'Address complement'
    },
    {
      class: 'String',
      name: 'zip',
      shortName: 'zip',
      documentation: 'Zip code'
    },
    {
      class: 'String',
      name: 'busPhoneNr',
      shortName: 'bus_phone_nr',
      documentation: 'Telephone number'
    },
    {
      class: 'String',
      name: 'faxNr',
      shortName: 'fax_nr',
      documentation: 'Fax number'
    },
  ]
});
