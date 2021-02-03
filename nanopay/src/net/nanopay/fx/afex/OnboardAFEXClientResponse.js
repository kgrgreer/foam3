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
  name: "OnboardAFEXClientResponse",

  documentation: `
    Model of the parameters of response returned upon successful creation of private client account in AFEX.
    Source: https://doc.api.afex.com/?version=latest#a6621ef8-1efe-432d-827f-20d651244912
  `,

  properties: [
    {
      class: 'String',
      name: 'APIKey'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    },
    {
      class: 'String',
      name: 'Message'
    }
  ]
});
