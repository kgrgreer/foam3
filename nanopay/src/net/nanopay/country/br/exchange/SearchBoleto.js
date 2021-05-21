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
	name: "SearchBoleto",
	properties: [
		{
			class: "foam.core.String",
			name: "dataInicio"
		},
		{
			class: "foam.core.String",
			name: "dataFim"
		},
		{
			class: "foam.core.Double",
			name: "Titular",
			required: false
		},
		{
			class: "foam.core.String",
			name: "nrBoleto",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "tipo",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "subtipo",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "concilia",
			required: false
		},
		{
			class: "foam.core.String",
			name: "status"
		},
		{
			class: "foam.core.String",
			name: "statuspg"
		},
		{
			class: "foam.core.String",
			name: "segmento"
		},
		{
			class: "foam.core.String",
			name: "rsisb"
		},
		{
			class: "foam.core.Int",
			name: "tpmesa",
			required: false
		},
		{
			class: "foam.core.String",
			name: "refinterna"
		}
	]
});
