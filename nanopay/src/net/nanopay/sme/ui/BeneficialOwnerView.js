foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BeneficialOwnerView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business beneficial owner information.
  `,

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.auth.User'
  ],

  imports: [
    'user'
  ],

  css: `
    ^ {
      padding: 24px;
    }
    ^ .info-container {
      width: 25%;
      display: inline-grid;
      height: 40px;
      margin-top: 30px;
    }
    ^ .table-content {
      height: 21px;
    }
    ^ .owner-container {
      margin-top: 25px;
    }
  `,

  properties: [
    {
      name: 'beneficialOwners',
      factory: function() {
        return this.user.principalOwners ? this.user.principalOwners : [];
      }
    },
    {
      name: 'ownerCount',
      value: 0
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Principal owners' },
    { name: 'LEGAL_NAME_LABEL', message: 'Legal name' },
    { name: 'JOB_TITLE_LABEL', message: 'Job title' },
    { name: 'ADDRESS_LABEL', message: 'Residential address' },
    { name: 'DATE_OF_BIRTH_LABEL', message: 'Date of birth' },
    { name: 'OWNER_COUNT_LABEL', message: 'Principal owner' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('card')
        .start().addClass('sub-heading').add(this.TITLE).end()
        // TODO: Edit Business
        .forEach(this.beneficialOwners, (owner) => {
          this.ownerCount++;
          this.start().addClass('owner-container')
            .start().add(this.OWNER_COUNT_LABEL, ' ', this.ownerCount).addClass('table-heading').end()
            .start().addClass('info-container')
              .start().addClass('table-content').add(this.LEGAL_NAME_LABEL).end()
              .start().addClass('table-content').addClass('subdued-text').add(owner.firstName, ' ', owner.lastName).end()
            .end()
            .start().addClass('info-container')
              .start().addClass('table-content').add(this.JOB_TITLE_LABEL).end()
              .start().addClass('table-content').addClass('subdued-text').add(owner.jobTitle).end()
            .end()
            .start().addClass('info-container')
              .start().addClass('table-content').add(this.ADDRESS_LABEL).end()
              .start().addClass('table-content').addClass('subdued-text').add(owner.address.getAddress()).end()
            .end()
            .start().addClass('info-container')
              .start().addClass('table-content').add(this.DATE_OF_BIRTH_LABEL).end()
              .start().addClass('table-content').addClass('subdued-text').add(owner.birthday ? owner.birthday.toISOString().substring(0, 10) : '').end()
            .end()
          .end();
      });
    }
  ]
});
