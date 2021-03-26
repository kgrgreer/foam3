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
  package: 'net.nanopay.partner.soawebservices',
  name: 'SoaWebService',

  documentation: 'Interface to the SoaWebServices API',

  methods: [
    {
      name: 'pessoaFisicaNFe',
      type: 'net.nanopay.partner.soawebservices.PessoaResponse',
      documentation: 'Consultation for Individual with Date of Birth',
      async: true,
      args: [
        {
          name: 'request',
          type: 'net.nanopay.partner.soawebservices.PessoaFisicaNFe'
        }
      ]
    },
    {
      name: 'pessoaJuridicaNFe',
      type: 'net.nanopay.partner.soawebservices.PessoaResponse',
      documentation: 'Consultation for Legal Entity',
      async: true,
      args: [
        {
          name: 'request',
          type: 'net.nanopay.partner.soawebservices.PessoaJuridicaNFe'
        }
      ]
    }
  ]
});
