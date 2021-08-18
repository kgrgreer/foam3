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
  package: 'foam.nanos.ticket',
  name: 'TicketHistory',

  documentation: 'Timestamped ticket history.',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedTo',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedFrom',
    },
    {
      class: 'DateTime',
      name: 'timeStamp',
      visibility: 'RO',
      documentation: 'Time at which status entry was created',
      order: 20,
      gridColumns: 6
    }
  ],

  methods: [
    function toSummary() {
      return this.timeStamp + ' → ' + this.status.label;
    }
  ]
});
