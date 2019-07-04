// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "LineItem10",
	documentation: "Unit of information showing the related provision of products and/or services and monetary summations reported as a discrete line items.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "The unique identification of this invoice line item.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TradeProduct",
			shortName: "TradPdct",
			documentation: "Something that is produced and sold as the result of an industrial process.",
			of: "net.nanopay.iso20022.TradeProduct1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "BuyerOrderIdentification",
			shortName: "BuyrOrdrId",
			documentation: "Purchase order reference assigned by the buyer related to the provision of products and/or services for this line item.",
			of: "net.nanopay.iso20022.DocumentIdentification23",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ContractIdentification",
			shortName: "CtrctId",
			documentation: "Contract reference related to the provision of products and/or services for this line item.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectArray",
			name: "PurchaseAccountingAccount",
			shortName: "PurchsAcctgAcct",
			documentation: "Specific purchase account for recording debits and credits for accounting purposes.",
			of: "net.nanopay.iso20022.AccountingAccount1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "NetPrice",
			shortName: "NetPric",
			documentation: "Value of the price, eg, as a currency and value.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "NetPriceQuantity",
			shortName: "NetPricQty",
			documentation: "Quantity and conversion factor on which the net price is based for this line item product and/or service.",
			of: "net.nanopay.iso20022.Quantity4",
			required: false
		},
		{
			class: "FObjectArray",
			name: "NetPriceAllowanceCharge",
			shortName: "NetPricAllwncChrg",
			documentation: "Allowance or charge applied to the net price.",
			of: "net.nanopay.iso20022.LineItemAllowanceCharge1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "NetWeight",
			shortName: "NetWght",
			documentation: "Net weight of the product.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "FObjectArray",
			name: "GrossPrice",
			shortName: "GrssPric",
			documentation: "Gross price of the product and/or service.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "GrossPriceQuantity",
			shortName: "GrssPricQty",
			documentation: "Quantity and conversion factor on which the gross price is based for this line item product and/or service.",
			of: "net.nanopay.iso20022.Quantity4",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "GrossWeight",
			shortName: "GrssWght",
			documentation: "Gross weight of the product.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "FObjectArray",
			name: "LogisticsCharge",
			shortName: "LogstcsChrg",
			documentation: "Logistics service charge for this line item.",
			of: "net.nanopay.iso20022.ChargesDetails2",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Tax",
			shortName: "Tax",
			documentation: "Amount of money due to the government or tax authority, according to various pre-defined parameters such as thresholds or income.",
			of: "net.nanopay.iso20022.LineItemTax1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AllowanceCharge",
			shortName: "AllwncChrg",
			documentation: "Allowance or charge specified for this line item.",
			of: "net.nanopay.iso20022.LineItemAllowanceCharge1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "FinancialAdjustment",
			shortName: "FinAdjstmnt",
			documentation: "Modification on the value of goods and / or services. For example: rebate, discount, surcharge.",
			of: "net.nanopay.iso20022.Adjustment4",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "BilledQuantity",
			shortName: "BlldQty",
			documentation: "Quantity billed for this line item.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "PackageQuantity",
			shortName: "PackgQty",
			documentation: "Number of product packages delivered.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PerPackageUnitQuantity",
			shortName: "PerPackgUnitQty",
			documentation: "Number of units per package in this line item for a supply chain trade delivery.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Packaging",
			shortName: "Packgng",
			documentation: "Physical packaging of the product.",
			of: "net.nanopay.iso20022.Packaging1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ChargeFreeQuantity",
			shortName: "ChrgFreeQty",
			documentation: "Quantity that is free of charge for this line item.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "MeasureQuantityStart",
			shortName: "MeasrQtyStart",
			documentation: "Quantity value on which the quantity measurement started for a line item. For instance the start amount of a meter reading for an electricity supplier.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "MeasureQuantityEnd",
			shortName: "MeasrQtyEnd",
			documentation: "Quantity value on which the quantity measurement ended for a line item. For instance the end amount of a meter reading for an electricity supplier.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "MeasureDateTimeStart",
			shortName: "MeasrDtTmStart",
			documentation: "Date/time on which the clock time measure started for a line item.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "MeasureDateTimeEnd",
			shortName: "MeasrDtTmEnd",
			documentation: "Date/time on which the clock time measure ended for a line item.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ShipTo",
			shortName: "ShipTo",
			documentation: "Party to whom the goods must be delivered in the end.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Incoterms",
			shortName: "Incotrms",
			documentation: "Specifies the applicable Incoterm and associated location.",
			of: "net.nanopay.iso20022.Incoterms3",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "DeliveryDateTime",
			shortName: "DlvryDtTm",
			documentation: "Actual delivery date/time of the products and/or services for this line item.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DeliveryNoteIdentification",
			shortName: "DlvryNoteId",
			documentation: "Delivery note related to the delivery of the products and/or services for this line item.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "MonetarySummation",
			shortName: "MntrySummtn",
			documentation: "Monetary totals for this line item.",
			of: "net.nanopay.iso20022.LineItemMonetarySummation1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "IncludedNote",
			shortName: "InclNote",
			documentation: "Note included in this line item.",
			of: "net.nanopay.iso20022.AdditionalInformation1",
			required: false
		}
	]
});