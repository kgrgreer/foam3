foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'InstructionCombinedSummary',

  documentation: 'Represents a combined disbursement instruction summary',

  properties: [
    {
      class: 'String',
      name: 'batchId',
      documentation:
        `Unique merchant batch number which is globally unique per merchant per file
         Should be the same with BatchID part of the filename.`
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      documentation: 'Source currency'
    },
    {
      class: 'Float',
      name: 'totalSourceAmount',
      documentation: 'Total amount in source currency in this batch',
    },
    {
      class: 'String',
      name: 'targetCurrency',
      documentation: 'Disbursement currency, only support CNY for now',
      value: 'CNY'
    },
    {
      class: 'Float',
      name: 'totalTargetAmount',
      documentation: 'Total amount in target currency in this batch'
    },
    {
      class: 'Int',
      name: 'totalCount',
      documentation: 'Total disbursement instructions in this batch'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.DistributionMode',
      name: 'distributeMode',
      documentation: 'Distribution mode'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.InstructionType',
      name: 'instructionType',
      documentation: 'Instruction type'
    }
  ]
});
