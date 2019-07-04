// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "InstructionForNextAgent1",
	documentation: "Further information related to the processing of the payment instruction that may need to be acted upon by an other agent. The instruction may relate to a level of service, or may be an instruction that has to be executed by the creditor's agent, or may be information required by the other agent.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Code",
			shortName: "Cd",
			documentation: "Coded information related to the processing of the payment instruction, provided by the initiating party, and intended for the next agent in the payment chain.",
			of: "net.nanopay.iso20022.Instruction4Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "InstructionInformation",
			shortName: "InstrInf",
			documentation: "Further information complementing the coded instruction or instruction to the next agent that is bilaterally agreed or specific to a user community.",
			required: false
		}
	]
});