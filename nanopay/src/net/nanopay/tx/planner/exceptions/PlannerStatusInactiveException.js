/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.planner.exceptions',
  name: 'PlannerStatusInactiveException',
  extends: 'net.nanopay.tx.planner.exceptions.PlannerCapabilityIncompleteException',
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'status'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
    public PlannerStatusInactiveException(String message) {
      super(message);
    }

    public PlannerStatusInactiveException(String message, java.lang.Exception cause) {
      super(message, cause);
    }
            `
        }));
      }
    }
  ]
});
