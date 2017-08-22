/* Furthur extend this feature by adding an invoice resolution list with requirement
properties instead of having the invoice model containing them. Then creating a one to many relationship
between invoice resolution list to invoice resolutions. Current issue pertaining to this implementation
is the 1:1 relationship feature of FOAM.
*/
foam.CLASS({
  package: 'net.nanopay.b2b.model',
  name: 'InvoiceResolution',

  documentation: 'Approval/Dispute item on invoice resolutions.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'note'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId'
    }
  ]
});
