/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse.test',
  name: 'FScriptParserTestUser',
  extends: 'foam.nanos.auth.User',

  properties: [
//    {
//      name: 'EMPLOYEE_EI_CREDIT_CA_FEDERAL',
//      class: 'Double'
//    },
    {
      name: 'EMPLOYEE_EI_CREDIT_CA',
      class: 'Double'
    },
    {
      name: 'testint1',
      class: 'Int'
    },
    {
      name: 'testint2',
      class: 'Int'
    },
    {
      name: 'testint3',
      class: 'Int'
    },
    {
      name: 'Employee_Earnings_CA',
      class: 'Double',
      value: 222.3
    },
    {
      name: 'Employee_Reimbursement_CA',
      class: 'Double',
      value: 44.1
    },
    {
      name: 'Employee_Tax_CA_Federal',
      class: 'Double',
      value: 14.1
    },
    {
      name: 'Employee_Tax_Non_Periodic_CA_Federal',
      class: 'Double',
      value: 3.05
    },
    {
      name: 'Employee_Tax_CA_Provincial',
      class: 'Double',
      value: 2.2
    },
    {
      name: 'Employee_Tax_Non_Periodic_CA_Provincial',
      class: 'Double',
      value: 3.3
    },
    {
      name: 'Employee_EI_Contribution_CA',
      class: 'Double',
      value: 4.4
    },
    {
      name: 'Employee_CPP_Contribution_CA',
      class: 'Double',
      value: 5.5
    },
    {
      name: 'Employee_Deductions_CA',
      class: 'Double',
      value: 6.6
    }
  ]
});
