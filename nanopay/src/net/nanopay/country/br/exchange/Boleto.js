foam.CLASS({
	package: "net.nanopay.country.br.exchange",
	name: "Boleto",
	properties: [
		{
			class: "foam.core.Int",
			name: "AGENCIA",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "ANO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "ASSINATURA"
		},
		{
			class: "foam.core.String",
			name: "AVISO2",
			value: "OUR",
			documentation: "sender(our) / receiver(beneficiary) / sha (shared) "
		},
		{
			class: "foam.core.String",
			name: "BANCO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "BANCO2",
			required: false
		},
		{
			class: "foam.core.String",
			name: "BANCO2NIF"
		},
		{
			class: "foam.core.String",
			name: "BANCOBEN0"
		},
		{
			class: "foam.core.String",
			name: "BANCOBEN1"
		},
		{
			class: "foam.core.String",
			name: "BANCOBEN2"
		},
		{
			class: "foam.core.String",
			name: "BANCOBEN3"
		},
		{
			class: "foam.core.String",
			name: "BANCOBEN4"
		},
		{
			class: "foam.core.String",
			name: "BANCOBEN5"
		},
		{
			class: "foam.core.Double",
			name: "BANCOCC",
			required: false
		},
		{
			class: "foam.core.String",
			name: "BANCOINT0"
		},
		{
			class: "foam.core.String",
			name: "BANCOINT1"
		},
		{
			class: "foam.core.String",
			name: "BANCOINT2"
		},
		{
			class: "foam.core.String",
			name: "BANCOINT3"
		},
		{
			class: "foam.core.String",
			name: "BANCOINT4"
		},
		{
			class: "foam.core.String",
			name: "BANCOINT5"
		},
		{
			class: "foam.core.String",
			name: "BANCOINT6"
		},
		{
			class: "foam.core.String",
			name: "BANCONIF"
		},
		{
			class: "foam.core.Long",
			name: "BASEEN",
			required: false
		},
		{
			class: "foam.core.String",
			name: "BBENCC"
		},
		{
			class: "foam.core.Double",
			name: "BOLETO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "BTIME"
		},
		{
			class: "foam.core.Double",
			name: "CAPTALIZA",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CARTAO"
		},
		{
			class: "foam.core.Double",
			name: "CIDEBASE",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "CIDETAXA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "CIDEVALOR",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA01",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA01D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA02",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA02D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA03",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA03D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA04",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA04D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA05",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA05D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA06",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA06D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA07",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA07D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA08",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA08D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA09",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA09D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA10",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA10D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA11",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA11D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA12",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA12D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA13",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA13D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA14",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA14D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA15",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA15D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA16",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA16D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA17",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA17D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA18",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA18D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA19",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA19D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA20",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA20D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA21",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA21D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA22",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA22D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA23",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA23D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA24",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA24D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA25",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA25D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA26",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA26D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA27",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA27D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA28",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA28D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA29",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA29D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA30",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA30D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA31",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA31D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA32",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA32D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA33",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA33D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA34",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA34D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA35",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA35D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA36",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA36D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA37",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA37D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA38",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA38D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA39",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA39D"
		},
		{
			class: "foam.core.Int",
			name: "CLAUSULA40",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CLAUSULA40D"
		},
		{
			class: "foam.core.Boolean",
			name: "CLAUSULAXX",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CNPJPCPFCLIENTE",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CNPJPCPFCORRETOR",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CNPJPCPFINDICADOR",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CODCLI"
		},
		{
			class: "foam.core.Double",
			name: "COFINSBASE",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "COFINSTAXA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "COFINSVALOR",
			required: false
		},
		{
			class: "foam.core.String",
			name: "CONCILIA"
		},
		{
			class: "foam.core.String",
			name: "CONTA"
		},
		{
			class: "foam.core.String",
			name: "CONTAME"
		},
		{
			class: "foam.core.Double",
			name: "CONTRATO",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "CUSTOLN",
			required: false
		},
		{
			class: "foam.core.String",
			name: "DATADC"
		},
		{
			class: "foam.core.String",
			name: "DATAEB"
		},
		{
			class: "foam.core.String",
			name: "DATAEF"
		},
		{
			class: "foam.core.String",
			name: "DATAEI"
		},
		{
			class: "foam.core.String",
			name: "DATAEN"
		},
		{
			class: "foam.core.String",
			name: "DATAFX"
		},
		{
			class: "foam.core.String",
			name: "DATALQ"
		},
		{
			class: "foam.core.String",
			name: "DATAME"
		},
		{
			class: "foam.core.String",
			name: "DATAMN"
		},
		{
			class: "foam.core.String",
			name: "DATAOP"
		},
		{
			class: "foam.core.Date",
			name: "DATAROF"
		},
		{
			class: "foam.core.String",
			name: "DATAV"
		},
		{
			class: "foam.core.String",
			name: "DAYTRADE"
		},
		{
			class: "foam.core.String",
			name: "DR",
			documentation: "This amount refers to the Tariff charged to the customer for shipping operations"
		},
		{
			class: "foam.core.String",
			name: "DR2"
		},
		{
			class: "foam.core.String",
			name: "DR3"
		},
		{
			class: "foam.core.String",
			name: "DR4"
		},
		{
			class: "foam.core.String",
			name: "DR5"
		},
		{
			class: "foam.core.String",
			name: "ENCARGO"
		},
		{
			class: "foam.core.String",
			name: "ESP1"
		},
		{
			class: "foam.core.String",
			name: "ESP10"
		},
		{
			class: "foam.core.String",
			name: "ESP11"
		},
		{
			class: "foam.core.String",
			name: "ESP12"
		},
		{
			class: "foam.core.String",
			name: "ESP13"
		},
		{
			class: "foam.core.String",
			name: "ESP14"
		},
		{
			class: "foam.core.String",
			name: "ESP15"
		},
		{
			class: "foam.core.String",
			name: "ESP16"
		},
		{
			class: "foam.core.String",
			name: "ESP17"
		},
		{
			class: "foam.core.String",
			name: "ESP18"
		},
		{
			class: "foam.core.String",
			name: "ESP19"
		},
		{
			class: "foam.core.String",
			name: "ESP2"
		},
		{
			class: "foam.core.String",
			name: "ESP20"
		},
		{
			class: "foam.core.String",
			name: "ESP21"
		},
		{
			class: "foam.core.String",
			name: "ESP22"
		},
		{
			class: "foam.core.String",
			name: "ESP23"
		},
		{
			class: "foam.core.String",
			name: "ESP24"
		},
		{
			class: "foam.core.String",
			name: "ESP25"
		},
		{
			class: "foam.core.String",
			name: "ESP26"
		},
		{
			class: "foam.core.String",
			name: "ESP27"
		},
		{
			class: "foam.core.String",
			name: "ESP28"
		},
		{
			class: "foam.core.String",
			name: "ESP29"
		},
		{
			class: "foam.core.String",
			name: "ESP3"
		},
		{
			class: "foam.core.String",
			name: "ESP30"
		},
		{
			class: "foam.core.String",
			name: "ESP4"
		},
		{
			class: "foam.core.String",
			name: "ESP5"
		},
		{
			class: "foam.core.String",
			name: "ESP6"
		},
		{
			class: "foam.core.String",
			name: "ESP7"
		},
		{
			class: "foam.core.String",
			name: "ESP8"
		},
		{
			class: "foam.core.String",
			name: "ESP9"
		},
		{
			class: "foam.core.Long",
			name: "FIRCE1",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "FIRCE2",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "FIRCE3",
			required: false
		},
		{
			class: "foam.core.String",
			name: "FLUXOME",
			value: "S",
			documentation: "Cash Flow Indicator: “N” - Inflow “S” - Outflow"
		},
		{
			class: "foam.core.String",
			name: "FLUXOMN"
		},
		{
			class: "foam.core.String",
			name: "FORMAEN",
			value: "TED"
		},
		{
			class: "foam.core.String",
			name: "FORMAME",
			value: "TX",
			documentation: "Form of delivery of foreign currency: “CC” - Current account “ESPECIE” - Type “TX” - Tele transmission “ORDER” - Payment Order"
		},
		{
			class: "foam.core.String",
			name: "FORMAMN",
			value: "TED",
			documentation: "Delivery method of the national currency: “CAIXA” - Caixa “CC” - Current account “TED” - Electronic Transfer"
		},
		{
			class: "foam.core.String",
			name: "GARANTIA"
		},
		{
			class: "foam.core.String",
			name: "GARANTIA2"
		},
		{
			class: "foam.core.String",
			name: "GARANTIA3"
		},
		{
			class: "foam.core.String",
			name: "GARDET"
		},
		{
			class: "foam.core.String",
			name: "GARDET2"
		},
		{
			class: "foam.core.String",
			name: "GARDET3"
		},
		{
			class: "foam.core.Double",
			name: "GARPERC",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "GARPERC2",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "GARPERC3",
			required: false
		},
		{
			class: "foam.core.String",
			name: "GERENTE"
		},
		{
			class: "foam.core.String",
			name: "GIRO",
			value: "N",
			documentation: "Turn: “S” - Yes “N” - No"
		},
		{
			class: "foam.core.String",
			name: "IMPRESSO",
			value: "C",
			documentation: "E-mail indicator: “T” - Client / Broker, “C” - Client, “R” - Broker, “N” - No"
		},
		{
			class: "foam.core.String",
			name: "INDEN"
		},
		{
			class: "foam.core.Double",
			name: "IOFBASE",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "IOFCONTA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "IOFTAXA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "IOFVALOR",
			required: false
		},
		{
			class: "foam.core.String",
			name: "IR"
		},
		{
			class: "foam.core.Int",
			name: "IRBANCO",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "IRBASE",
			required: false
		},
		{
			class: "foam.core.String",
			name: "IRDATA"
		},
		{
			class: "foam.core.Int",
			name: "IRREAJUSTA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "IRRECOLHE",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "IRRESP",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "IRTAXA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "ISSBASE",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "ISSTAXA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "ISSVALOR",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "JUROS",
			of: "net.nanopay.country.br.exchange.ArrayOfParcelas"
		},
		{
			class: "foam.core.String",
			name: "JUSTIFICA"
		},
		{
			class: "foam.core.String",
			name: "LEILAO",
			value: "N",
			documentation: "Auction: “S” - Yes “N” - No"
		},
		{
			class: "foam.core.String",
			name: "LINKEDOP"
		},
		{
			class: "foam.core.String",
			name: "MERCADORIA"
		},
		{
			class: "foam.core.String",
			name: "MODALIDADE"
		},
		{
			class: "foam.core.Int",
			name: "MOEDA",
			value: 220,
			documentation: "Destination currency code: 220 - USD, 978  - EUR"
		},
		{
			class: "foam.core.Int",
			name: "MOEDA2",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "MOEDAEN",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "MOEDAR",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "MOEDAR2",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "MOEDAR3",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "MOEDAR4",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "MOEDAR5",
			required: false
		},
		{
			class: "foam.core.String",
			name: "NATUREZA",
			required: false
		},
		{
			class: "foam.core.String",
			name: "NIF"
		},
		{
			class: "foam.core.String",
			name: "NUMSEQCOR"
		},
		{
			class: "foam.core.String",
			name: "OBSERVACAO"
		},
		{
			class: "foam.core.String",
			name: "OBSERVACAO2"
		},
		{
			class: "foam.core.String",
			name: "OPERADOR"
		},
		{
			class: "foam.core.String",
			name: "OPLINHA",
			value: "N",
			documentation: "Line: “Y” - Yes “N” - No"
		},
		{
			class: "foam.core.String",
			name: "PAGACR"
		},
		{
			class: "foam.core.String",
			name: "PAGADOR"
		},
		{
			class: "foam.core.String",
			name: "PAGADORC"
		},
		{
			class: "foam.core.Long",
			name: "PAGADORCADE",
			required: false
		},
		{
			class: "foam.core.String",
			name: "PAGADORCD"
		},
		{
			class: "foam.core.String",
			name: "PAGADORE"
		},
		{
			class: "foam.core.String",
			name: "PAGADORORD1"
		},
		{
			class: "foam.core.String",
			name: "PAGADORORD2"
		},
		{
			class: "foam.core.String",
			name: "PAGADORORD3"
		},
		{
			class: "foam.core.String",
			name: "PAGADORS"
		},
		{
			class: "foam.core.String",
			name: "PAGADORUF"
		},
		{
			class: "foam.core.String",
			name: "PAGS"
		},
		{
			class: "foam.core.Long",
			name: "PAIS",
			value: 1058,
			documentation: "Paying / Receiving Abroad - Pais Bacen",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "PARIDADE",
			value: 1,
			documentation: `FX rate to be reported to exhange. The full flow of funds: 1 Treviso BRL > 2 Bank in Brazil BRL >
			  3 Bank in US USD > 4 AFEX USD. PARIDADE is between 3 and 4`,
			required: false
		},
		{
			class: "foam.core.String",
			name: "PERIEN"
		},
		{
			class: "foam.core.Double",
			name: "PISBASE",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "PISTAXA",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "PISVALOR",
			required: false
		},
		{
			class: "foam.core.String",
			name: "PLACEFX"
		},
		{
			class: "foam.core.String",
			name: "PLATBMF",
			value: "N",
			documentation: 'BMF Platform: “Y” - Yes “N” - No'
		},
		{
			class: "foam.core.String",
			name: "POC"
		},
		{
			class: "foam.core.String",
			name: "PORTFOLIO"
		},
		{
			class: "foam.core.String",
			name: "PRACA"
		},
		{
			class: "foam.core.Int",
			name: "PRAZODC",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "PRAZOL",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PRINCIPAL",
			of: "net.nanopay.country.br.exchange.ArrayOfParcelas"
		},
		{
			class: "foam.core.String",
			name: "PROPOSTA"
		},
		{
			class: "foam.core.String",
			name: "RATING"
		},
		{
			class: "foam.core.String",
			name: "RDE"
		},
		{
			class: "foam.core.String",
			name: "RDETPLIQ"
		},
		{
			class: "foam.core.String",
			name: "REF1"
		},
		{
			class: "foam.core.String",
			name: "REFINTERNA"
		},
		{
			class: "foam.core.String",
			name: "REMETEDORA"
		},
		{
			class: "foam.core.String",
			name: "RSISB",
			value: 'P',
			documentation: 'Transmission to Sisbacen: “P” - CAM0021 (Individualized Primary Market) "A" - Bacen File (Foreign Exchange Correspondent) Interbank Operations: "R" - CAM0009 - STR (Purchase) "B" - CAM0006 - BMF (Purchase) "C" - CAM0009 - STR (Sale) "B" - CAM0006 - BMF (Sale)'
		},
		{
			class: "foam.core.String",
			name: "SACADO"
		},
		{
			class: "foam.core.String",
			name: "SEGMENTO",
			value: 'L',
			documentation: 'Operation Segment: "F" - For Tourism operations "L" - For Remittance operations'
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICO"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOCEP"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOCIDADE"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOCODIGO"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICODATA"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOENDERECO"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOESTADO"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICONOME"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOPAIS"
		},
		{
			class: "foam.core.String",
			name: "SIMBOLICOTIPO"
		},
		{
			class: "foam.core.Double",
			name: "SPREAD",
			required: false
		},
		{
			class: "foam.core.String",
			name: "STATUS",
			documentation: `R - Pre-Boleto - Used to reserve an operation. F - Closed - Closed operation awaiting verification by Treviso.
			M - Pending Payment - Operation awaiting payment from the customer (already reviewed by BackOffice). E - Completed - Operation settled.`
		},
		{
			class: "foam.core.String",
			name: "STATUSPG"
		},
		{
			class: "foam.core.Int",
			name: "SUBTIPO",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "SWIFT",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "TAXACET",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "TAXAEN",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "TAXANV",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "TAXANV2",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "TAXAOP",
			documentation: 'Exchange rate',
			required: false
		},
		{
			class: "foam.core.Double",
			name: "TAXAOP2",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "TIPO",
			value: 4,
			documentation: "Operation type code: 01 - Export, 02 - Import, 03 - Financial Transfer Abroad, 04 - Financial Transfer Abroad, 05 - Banking Purchase, 06 - Banking Sale"
		},
		{
			class: "foam.core.String",
			name: "TIPOCT"
		},
		{
			class: "foam.core.String",
			name: "TIPOEV"
		},
		{
			class: "foam.core.Long",
			name: "TIPOJR",
			required: false
		},
		{
			class: "foam.core.String",
			name: "TIPOPF"
		},
		{
			class: "foam.core.String",
			name: "TOKEN"
		},
		{
			class: "foam.core.Double",
			name: "TOTALEN",
			required: false
		},
		{
			class: "foam.core.String",
			name: "TPADTO"
		},
		{
			class: "foam.core.String",
			name: "TPFIRCE"
		},
		{
			class: "foam.core.Int",
			name: "TPMESA",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "TPMESA2",
			required: false
		},
		{
			class: "foam.core.String",
			name: "TPMESA2D"
		},
		{
			class: "foam.core.String",
			name: "TPMESAD"
		},
		{
			class: "foam.core.Int",
			name: "TRANSITO",
			required: false
		},
		{
			class: "foam.core.String",
			name: "TRANSMITE"
		},
		{
			class: "foam.core.Double",
			name: "VALOR2",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORAD",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORADPERC",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORCR",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALOREN",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORIN",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORLQ",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORME",
			documentation: 'TODO Foreign Currency Value',
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORMN",
			documentation: 'TODO National Currency Value',
			required: false
		},
		{
			class: "foam.core.Double",
			name: "VALORR",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "VALORR2",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "VALORR3",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "VALORR4",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "VALORR5",
			required: false
		},
		{
			class: "foam.core.Long",
			name: "VALORROF",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "VINCULO",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "YIELD",
			required: false
		}
	]
});
