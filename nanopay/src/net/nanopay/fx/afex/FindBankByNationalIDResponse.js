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
  package: "net.nanopay.fx.afex",
  name: "FindBankByNationalIDResponse",
  properties: [
    {
      class: 'String',
      name: "NationalIdentifier"
    },
    {
      class: 'String',
      name: "NationalIdType"
    },
    {
      class: 'String',
      name: "InstitutionName"
    },
    {
      class: 'String',
      name: "BranchInformation"
    },
    {
      class: 'String',
      name: "StreetAddress1"
    },
    {
      class: 'String',
      name: "StreetAddress2"
    },
    {
      class: 'String',
      name: "StreetAddress3"
    },
    {
      class: 'String',
      name: "StreetAddress4"
    },
    {
      class: 'String',
      name: "City"
    },
    {
      class: 'String',
      name: "ZipCode"
    },
    {
      class: 'String',
      name: "CountryName"
    },
    {
      class: 'String',
      name: "IsoCountryCode"
    }
  ]
});
