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

foam.ENUM({
    package: 'net.nanopay.invoice.model',
    name: 'InvoiceStatus',

    documentation: `The base model for tracking the status of an Invoice. The
      values in this model will return specific labels on the UI.`,

    values: [
      {
        name: 'SCHEDULED',
        documentation: `A status that indicates that the invoice has a scheduled
          due date, and has not been paid yet.`,
        label: { en: 'Scheduled', pt: 'Programado'},
        color: '#406dea !important'
      },
      {
        name: 'OVERDUE',
        documentation: `A status that indicates that the invoice has a passed
          due date, and has not been paid yet.`,
        label: { en: 'Overdue', pt: 'Em atraso'},
        color: '#d42035 !important'
      },
      {
        name: 'UNPAID',
        documentation: 'A status that indicates that the invoice is unpaid.',
        label: { en: 'Unpaid', pt: 'Não pago'},
        color: '#545d87 !important'
      },
      {
        name: 'PAID',
        documentation: 'A status that indicates that the invoice has been paid.',
        label: { en: 'Complete', pt: 'Completo'},
        color: '#07941f !important'
      },
      {
        name: 'VOID',
        documentation: 'A status that indicates the invoice has been voided.',
        label: { en: 'Void', pt: 'Vazio'},
        color: '#424242 !important'
      },
      {
        name: 'FAILED',
        documentation: 'A status that indicates the invoice transaction failed.',
        label: { en: 'Transaction failed', pt: 'Falha na transação'},
        color: '#a61414 !important',
      },
      {
        name: 'PROCESSING',
        documentation: `A status that indicates that the invoice has been paid,
          but that payment is still in processing.`,
        label: { en: 'Processing', pt: 'Em processamento'},
        color: '#cf6f0a !important'
      },
      {
        name: 'PENDING_ACCEPTANCE',
        documentation: `A status that indicates that the invoice has been paid by
          moving money into Payer owned holding account(default DigitalAccount),
          and is pending Payee acceptance of transfer.`,
        label: { en: 'Pending acceptance', pt: 'Pendente de aceitação'},
        color: '#cf6f0a !important'
      },
      {
        name: 'DEPOSITING_MONEY',
        documentation: `A status that indicates that the invoice has been paid by
          moving money into the Payer's owned holding account (default DigitalAccount),
          and is now moving to the Payee's BankAccount.`,
        label: { en: 'Depositing money', pt: 'Depositando dinheiro'},
        color: '#cf6f0a !important'
      },
      {
        name: 'DRAFT',
        documentation: 'A status that indicates that the invoice is a draft.',
        label: { en: 'Draft', pt: 'Esboço'},
        color: '#8b90a6 !important'
      },
      {
        name: 'PENDING_APPROVAL',
        documentation: `A status that indicates that the invoice still needs to be
          approved and paid.`,
        label: { en: 'Pending approval', pt: 'Aprovação pendente'},
        color: '#545d87 !important'
      },
      {
        name: 'QUOTED',
        documentation: 'A status that indicates that the invoice is being used to create a quote for a transaction',
        label: { en: 'Quote', pt: 'Citar'},
        color: '#302378 !important'
      },
      {
        name: 'SUBMIT',
        documentation: 'A status that indicates that the quoting invoice is ready to be submited as a transaction',
        label: { en: 'Submit', pt: 'Enviar'},
        color: '#048012 !important'
      },
      {
        name: 'REJECTED',
        documentation: 'A status that indicates the invoice has been rejected.',
        label: { en: 'Rejected', pt: 'Rejeitado'},
        color: '#ebb434 !important'
      }
    ]
  });
