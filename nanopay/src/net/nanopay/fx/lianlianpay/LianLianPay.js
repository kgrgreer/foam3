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

foam.INTERFACE({
  package: 'net.nanopay.fx.lianlianpay',
  name: 'LianLianPay',

  documentation: 'Interface to the LianLian Pay service',

  methods: [
    {
      name: 'uploadInstructionCombined',
      documentation: '',
      args: [
        {
          name: 'merchantId',
          type: 'String'
        },
        {
          name: 'batchId',
          type: 'String'
        },
        {
          name: 'request',
          type: 'net.nanopay.fx.lianlianpay.model.InstructionCombined'
        }
      ]
    },
    {
      name: 'downloadPreProcessResult',
      documentation: '',
      type: 'net.nanopay.fx.lianlianpay.model.PreProcessResult',
      args: [
        {
          name: 'date',
          type: 'Date'
        },
        {
          name: 'merchantId',
          type: 'String'
        },
        {
          name: 'batchId',
          type: 'String'
        }
      ]
    },
    {
      name: 'downloadReconciliation',
      documentation:
        `LianLian Pay will generate a list of instructions in final status finished during prior accounting
         period (aka previous accounting date) every day and upload the generated file to SFTP server.
         Note: reconciliation file may contain final result for instructions not uploaded on previous day due
         to processing delay.`,
      type: 'net.nanopay.fx.lianlianpay.model.Reconciliation',
      args: [
        {
          name: 'date',
          type: 'Date'
        },
        {
          name: 'merchantId',
          type: 'String'
        }
      ]
    },
    {
      name: 'downloadStatement',
      documentation:
        `LianLian Pay will generate a list of account fund in / out records which occurred during prior
         accounting period (aka previous accounting date) every day and upload the generated file to SFTP
         server.`,
      type: 'net.nanopay.fx.lianlianpay.model.Statement',
      args: [
        {
          name: 'date',
          type: 'Date'
        },
        {
          name: 'merchantId',
          type: 'String'
        }
      ]
    }
  ]
});
