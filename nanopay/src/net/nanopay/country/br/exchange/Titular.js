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
	name: "Titular",
	properties: [
		{
			class: "foam.core.Long",
			name: "AGENCIA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "ATIVIDADE",
			required: false
		},
		{
			class: "foam.core.String",
			name: "ATIVIDADE3"
		},
		{
			class: "foam.core.String",
			name: "ATIVO"
		},
		{
			class: "foam.core.String",
			name: "AUDITOR"
		},
		{
			class: "foam.core.String",
			name: "CELULAR"
		},
		{
			class: "foam.core.String",
			name: "CEP"
		},
		{
			class: "foam.core.String",
			name: "CEP2"
		},
		{
			class: "foam.core.String",
			name: "CIDADE"
		},
		{
			class: "foam.core.String",
			name: "CIDADE2"
		},
		{
			class: "foam.core.String",
			name: "CIVIL"
		},
		{
			class: "foam.core.String",
			name: "CODIGO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CODIGOIN",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "COMP",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "CONJC"
		},
		{
			class: "foam.core.String",
			name: "CONJN"
		},
		{
			class: "foam.core.String",
			name: "CONTA11"
		},
		{
			class: "foam.core.String",
			name: "CONTA12"
		},
		{
			class: "foam.core.String",
			name: "CONTA13"
		},
		{
			class: "foam.core.String",
			name: "CONTA131"
		},
		{
			class: "foam.core.String",
			name: "CONTA132"
		},
		{
			class: "foam.core.String",
			name: "CONTA133"
		},
		{
			class: "foam.core.String",
			name: "CONTA141"
		},
		{
			class: "foam.core.String",
			name: "CONTA142"
		},
		{
			class: "foam.core.String",
			name: "CONTA143"
		},
		{
			class: "foam.core.String",
			name: "CONTA151"
		},
		{
			class: "foam.core.String",
			name: "CONTA152"
		},
		{
			class: "foam.core.String",
			name: "CONTA153"
		},
		{
			class: "foam.core.String",
			name: "CONTA161"
		},
		{
			class: "foam.core.String",
			name: "CONTA162"
		},
		{
			class: "foam.core.String",
			name: "CONTA163"
		},
		{
			class: "foam.core.String",
			name: "CONTA171"
		},
		{
			class: "foam.core.String",
			name: "CONTA172"
		},
		{
			class: "foam.core.String",
			name: "CONTA173"
		},
		{
			class: "foam.core.String",
			name: "CONTA181"
		},
		{
			class: "foam.core.String",
			name: "CONTA182"
		},
		{
			class: "foam.core.String",
			name: "CONTA183"
		},
		{
			class: "foam.core.String",
			name: "CONTA191"
		},
		{
			class: "foam.core.String",
			name: "CONTA192"
		},
		{
			class: "foam.core.String",
			name: "CONTA193"
		},
		{
			class: "foam.core.String",
			name: "CONTA201"
		},
		{
			class: "foam.core.String",
			name: "CONTA202"
		},
		{
			class: "foam.core.String",
			name: "CONTA203"
		},
		{
			class: "foam.core.String",
			name: "CONTA21"
		},
		{
			class: "foam.core.String",
			name: "CONTA211"
		},
		{
			class: "foam.core.String",
			name: "CONTA212"
		},
		{
			class: "foam.core.String",
			name: "CONTA213"
		},
		{
			class: "foam.core.String",
			name: "CONTA22"
		},
		{
			class: "foam.core.String",
			name: "CONTA221"
		},
		{
			class: "foam.core.String",
			name: "CONTA222"
		},
		{
			class: "foam.core.String",
			name: "CONTA223"
		},
		{
			class: "foam.core.String",
			name: "CONTA23"
		},
		{
			class: "foam.core.String",
			name: "CONTA231"
		},
		{
			class: "foam.core.String",
			name: "CONTA232"
		},
		{
			class: "foam.core.String",
			name: "CONTA233"
		},
		{
			class: "foam.core.String",
			name: "CONTA241"
		},
		{
			class: "foam.core.String",
			name: "CONTA242"
		},
		{
			class: "foam.core.String",
			name: "CONTA243"
		},
		{
			class: "foam.core.String",
			name: "CONTA31"
		},
		{
			class: "foam.core.String",
			name: "CONTA32"
		},
		{
			class: "foam.core.String",
			name: "CONTA33"
		},
		{
			class: "foam.core.String",
			name: "CONTA41"
		},
		{
			class: "foam.core.String",
			name: "CONTA42"
		},
		{
			class: "foam.core.String",
			name: "CONTA43"
		},
		{
			class: "foam.core.String",
			name: "CONTA51"
		},
		{
			class: "foam.core.String",
			name: "CONTA52"
		},
		{
			class: "foam.core.String",
			name: "CONTA53"
		},
		{
			class: "foam.core.String",
			name: "CONTA61"
		},
		{
			class: "foam.core.String",
			name: "CONTA62"
		},
		{
			class: "foam.core.String",
			name: "CONTA63"
		},
		{
			class: "foam.core.String",
			name: "CONTA71"
		},
		{
			class: "foam.core.String",
			name: "CONTA72"
		},
		{
			class: "foam.core.String",
			name: "CONTA73"
		},
		{
			class: "foam.core.String",
			name: "CONTA81"
		},
		{
			class: "foam.core.String",
			name: "CONTA82"
		},
		{
			class: "foam.core.String",
			name: "CONTA83"
		},
		{
			class: "foam.core.String",
			name: "CONTATO"
		},
		{
			class: "foam.core.Date",
			name: "DATAAT"
		},
		{
			class: "foam.core.Date",
			name: "DATAN"
		},
		{
			class: "foam.core.Date",
			name: "DTFIM"
		},
		{
			class: "foam.core.Date",
			name: "DTINICIO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "ENDERECO"
		},
		{
			class: "foam.core.String",
			name: "ENDERECO2"
		},
		{
			class: "foam.core.String",
			name: "ENDERECON"
		},
		{
			class: "foam.core.String",
			name: "ESTADO"
		},
		{
			class: "foam.core.String",
			name: "ESTADO2"
		},
		{
			class: "foam.core.Double",
			name: "FATURAMENT",
			required: false
		},
		{
			class: "foam.core.String",
			name: "FAX"
		},
		{
			class: "foam.core.String",
			name: "GERENTE"
		},
		{
			class: "foam.core.String",
			name: "GRUPO"
		},
		{
			class: "foam.core.String",
			name: "IBAN"
		},
		{
			class: "foam.core.String",
			name: "IBAN10"
		},
		{
			class: "foam.core.String",
			name: "IBAN2"
		},
		{
			class: "foam.core.String",
			name: "IBAN3"
		},
		{
			class: "foam.core.String",
			name: "IBAN4"
		},
		{
			class: "foam.core.String",
			name: "IBAN5"
		},
		{
			class: "foam.core.String",
			name: "IBAN6"
		},
		{
			class: "foam.core.String",
			name: "IBAN7"
		},
		{
			class: "foam.core.String",
			name: "IBAN8"
		},
		{
			class: "foam.core.String",
			name: "IBAN9"
		},
		{
			class: "foam.core.String",
			name: "INDICADOR"
		},
		{
			class: "foam.core.String",
			name: "INTERNET"
		},
		{
			class: "foam.core.String",
			name: "IOF"
		},
		{
			class: "foam.core.Date",
			name: "LIMITEABPT"
		},
		{
			class: "foam.core.Long",
			name: "LIMITEDT",
			required: false
		},
		{
			class: "foam.core.Date",
			name: "LIMITEDT1"
		},
		{
			class: "foam.core.Date",
			name: "LIMITEDT2"
		},
		{
			class: "foam.core.Double",
			name: "LIMITEOP",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "LIMITEPT",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "LIMITEQT",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "LIMITEV1PT",
			required: false
		},
		{
			class: "foam.core.String",
			name: "MAE"
		},
		{
			class: "foam.core.String",
			name: "MONITORAR"
		},
		{
			class: "foam.core.String",
			name: "NOME"
		},
		{
			class: "foam.core.String",
			name: "NOMEAB"
		},
		{
			class: "foam.core.String",
			name: "NOMESRF"
		},
		{
			class: "foam.core.String",
			name: "OCUPACAO"
		},
		{
			class: "foam.core.String",
			name: "PAI"
		},
		{
			class: "foam.core.Int",
			name: "PAIS",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "PAISMT",
			required: false
		},
		{
			class: "foam.core.String",
			name: "PEP1"
		},
		{
			class: "foam.core.String",
			name: "PEP2"
		},
		{
			class: "foam.core.String",
			name: "PEP3"
		},
		{
			class: "foam.core.String",
			name: "PEP4"
		},
		{
			class: "foam.core.String",
			name: "PORTE"
		},
		{
			class: "foam.core.String",
			name: "PROCURACAO"
		},
		{
			class: "foam.core.String",
			name: "RADAR"
		},
		{
			class: "foam.core.String",
			name: "REFINTERNA"
		},
		{
			class: "foam.core.String",
			name: "RG"
		},
		{
			class: "foam.core.Date",
			name: "RGDATA"
		},
		{
			class: "foam.core.String",
			name: "RGEMISSOR"
		},
		{
			class: "foam.core.String",
			name: "RSISBACEN"
		},
		{
			class: "foam.core.Long",
			name: "SEC",
			required: false
		},
		{
			class: "foam.core.String",
			name: "SEXO"
		},
		{
			class: "foam.core.String",
			name: "SPB"
		},
		{
			class: "foam.core.String",
			name: "SUBTIPO"
		},
		{
			class: "foam.core.String",
			name: "TAG"
		},
		{
			class: "foam.core.String",
			name: "TAG2"
		},
		{
			class: "foam.core.String",
			name: "TELEFONE"
		},
		{
			class: "foam.core.Int",
			name: "TIPO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "TIPOLIM"
		},
		{
			class: "foam.core.String",
			name: "TOKEN"
		},
		{
			class: "foam.core.Double",
			name: "UTILIZADO",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "UTILIZADOPT",
			required: false
		}
	]
});
