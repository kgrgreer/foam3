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
	package: 'net.nanopay.country.br',
	name: 'CNPJCache',

  ids: [
    'cnpj'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

	properties: [
		{
			class: 'String',
			name: 'cnpj'
		},
		{
			class: 'FObjectProperty',
			of: 'net.nanopay.partner.soawebservices.PessoaResponse',
			name: 'response',
			hidden: true
		},
		{
			class: 'String',
			name: 'responseString'
		},
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO'
    },
	]
});
