foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Branch ID'
    },
    {
      class: 'String',
      name: 'clearingId',
      label: 'Clearing ID'
    },
    {
      class: 'String',
      name: 'status',
      tableCellFormatter: function(status) {
        var bgColour = '#a4b3b8';
        var borderColour = '#a4b3b8';
        var textColour = '#ffffff';
        if ( status == 'Submitted' ) {
          bgColour = 'transparent';
          borderColour = '#2cab70';
          textColour = '#2cab70';
        } else if ( status == 'Active' ) {
          bgColour = '#2cab70';
          borderColour = '#2cab70';
          textColour = '#ffffff';
        }
        if ( status != '' ) {
          this.start()
            .add(status)
            .style({
              'color': textColour,
              'border': '1px solid ' + borderColour,
              'border-radius': '100px',
              'background': bgColour,
              'padding': '3px 10px 3px 10px',
              'display': 'inline-block'
            })
          .end()
        }
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      validateObj: function(jobTitle) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( jobTitle.length > 0 && ! re.test(jobTitle) ) {
          return 'Invalid job title.';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      value: false,
    }
  ]
});