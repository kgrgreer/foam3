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
	name: 'CotacaoTaxaCambio',
	properties: [
    {
      class: 'Double',
      name: 'CLIENTEC'
    },
		{
			class: 'Double',
			name: 'CLIENTEV'
		},
		{
			class: 'Double',
			name: 'COMERCIALC'
		},
		{
			class: 'Double',
			name: 'COMERCIALV'
		},
		{
			class: 'String',
			name: 'DATA'
		},
		{
			class: 'String',
			name: 'HORARIO'
		},
		{
			class: 'Int',
			name: 'MOEDA'
		},
		{
			class: 'Double',
			name: 'PARIDADEC'
		},
		{
			class: 'Double',
			name: 'PARIDADEV'
		},
		{
			class: 'Double',
			name: 'TURISMOC'
		},
		{
			class: 'Double',
			name: 'TURISMOV'
		}
	]
});
