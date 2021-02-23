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
  name: "UpdateBeneficiaryRequest",
  properties: [
    {
      class: 'String',
      name: "clientAPIKey"
    },
    {
      class: 'String',
      name: "BankAccountNumber"
    },
    {
      class: 'String',
      name: "BankCountryCode"
    },
    {
      class: 'String',
      name: "BankName"
    },
    {
      class: 'String',
      name: "BankRoutingCode"
    },
    {
      class: 'String',
      name: "BeneficiaryAddressLine1"
    },
    {
      class: 'String',
      name: "BeneficiaryCity"
    },
    {
      class: 'String',
      name: "BeneficiaryCountryCode"
    },
    {
      class: 'String',
      name: "BeneficiaryName"
    },
    {
      class: 'String',
      name: "BeneficiaryPostalCode"
    },
    {
      class: 'String',
      name: "BeneficiaryRegion"
    },
    {
      class: 'String',
      name: "Currency"
    },
    {
      class: 'String',
      name: "VendorId"
    }
  ]
});
