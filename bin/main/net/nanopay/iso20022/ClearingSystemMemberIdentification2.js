// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ClearingSystemMemberIdentification2",
	documentation: "Unique identification, as assigned by a clearing system, to unambiguously identify a member of the clearing system.",
	properties: [
		{
			class: "FObjectProperty",
			name: "ClearingSystemIdentification",
			shortName: "ClrSysId",
			documentation: "Specification of a pre-agreed offering between clearing agents or the channel through which the payment instruction is processed.",
			of: "net.nanopay.iso20022.ClearingSystemIdentification2Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "MemberIdentification",
			shortName: "MmbId",
			documentation: "Identification of a member of a clearing system.",
			required: false
		}
	]
});