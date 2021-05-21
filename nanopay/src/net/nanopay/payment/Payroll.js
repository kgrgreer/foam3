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
  package: 'net.nanopay.payment',
  name: 'Payroll',
  documentation: 'Payroll model.',

  javaImports: [
    'java.util.Calendar',
    'java.util.Formatter'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'timePeriod',
      javaFactory: `
      try (Formatter fmt = new Formatter()) {
        Calendar cal = Calendar.getInstance();
        return fmt.format("%tB", cal) + " " + cal.get(Calendar.YEAR);
      }
       `
    },
    {
      class: 'String',
      name: 'note',
      javaFactory: `
      try (Formatter fmt = new Formatter()) {
        Calendar cal = Calendar.getInstance();
        return "nanopay " + getTimePeriod() + " Payroll";
      }
      `
    },
    {
      class: 'String',
      name: 'group',
      value: 'payblii'
    },
    {
      class: 'String',
      name: 'spid',
      value: 'payblii.nanopay'
    },
    {
      class: 'String',
      name: 'sourceAccount'
    },
    {
      class: 'String',
      name: 'company',
      value: 'nanopay'
    },
    {
      class: 'DateTime',
      name: 'executedAt'
    },
    {
      class: 'String',
      name: 'executedBy'
    },
    {
      class: 'Double',
      name: 'total'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.payment.PayrollEntry',
      name: 'payrollEntries'
    }
  ]
  });
