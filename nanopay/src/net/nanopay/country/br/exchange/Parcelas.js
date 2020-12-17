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
	package: "net.nanopay.country.br.exchange",
	name: "Parcelas",
	properties: [
		{
			class: "foam.core.String",
			name: "banco"
		},
		{
			class: "foam.core.Int",
			name: "basis",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "captaliza",
			required: false
		},
		{
			class: "foam.core.Date",
			name: "dataf",
			required: false
		},
		{
			class: "foam.core.Date",
			name: "datai",
			required: false
		},
		{
			class: "foam.core.Date",
			name: "datap",
			required: false
		},
		{
			class: "foam.core.String",
			name: "inden"
		},
		{
			class: "foam.core.Double",
			name: "moeda",
			required: false
		},
		{
			class: "foam.core.String",
			name: "perien"
		},
		{
			class: "foam.core.Double",
			name: "rate",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "sequencia",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "tipo",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "valor",
			required: false
		}
	]
});
