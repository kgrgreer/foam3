foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  documentation: 'View displaying history for invitation item',

  methods: [

    function formateDate(timestamp) {

    },


    function outputRecord(parentView, record) {
      var self = this;



      return parentView
        .style({' padding-left': '20px' })
        .start('')

      console.log('parentView', parentView);
      console.log('record = ', record);
    }
  ]
});
