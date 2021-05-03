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
    'subject'
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
  `,

  messages: [
    { name: 'TITLE', message: 'Owners' },
    { name: 'LEGAL_NAME_LABEL', message: 'Name' },
    { name: 'JOB_TITLE_LABEL', message: 'Job title' },
    { name: 'ADDRESS_LABEL', message: 'Address' },
    { name: 'DATE_OF_BIRTH_LABEL', message: 'Date of birth' },
    { name: 'OWNER_COUNT_LABEL', message: 'Beneficial owner' }
  ],

  methods: [
    function initE() {
      // TODO: Allow users to edit the beneficial owners.
      this.subject.user.beneficialOwners.select().then(owners => {
        if (owners.array.length == 0) return
        this.addClass(this.myClass()).addClass('card')
          .start().addClass('sub-heading').add(this.TITLE).end()
        .forEach(owners.array, owner => {
          this.start()
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
              .start().addClass('table-content').addClass('subdued-text').add(owner.birthday ? owner.birthday.toLocaleDateString(foam.locale) : '').end()
            .end()
          .end();
        })
      })
    }
  ]
});
