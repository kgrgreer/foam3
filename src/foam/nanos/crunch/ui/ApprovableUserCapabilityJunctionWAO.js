/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ApprovableUserCapabilityJunctionWAO',
  extends: 'foam.nanos.crunch.ui.UserCapabilityJunctionWAO',
  flags: ['web'],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'userCapabilityJunctionApprovableDAO'
  ],

  requires: [
    'foam.nanos.approval.Approvable',
    'foam.nanos.crunch.UserCapabilityJunction',
  ],

  properties: [],

  methods: [
    async function load(wizardlet) {
      if ( wizardlet.loading ) return;
      wizardlet.loading = true;

      try {
        var { ucj, approvable } = await this.getUcjAndApprovable_(wizardlet);
        ucj = this.applyApprovalToUCJ_(approvable, ucj);
        this.load_(wizardlet, ucj);
      } catch (e) {
        console.error(e);
        this.reportNetworkFailure(wizardlet, 'load', null);
      }
    },
    async function save_(wizardlet, options) {
      try {
        var wData = wizardlet.data ? wizardlet.data.clone() : null;
        wizardlet.loading = true;
        if ( wizardlet.reloadAfterSave && options.reloadData ) {
          wizardlet.loadingLevel = this.LoadingLevel.LOADING;
        }
        var { ucj, approvable } = await this.getUcjAndApprovable_(wizardlet);
        this.updateApprovable_(wizardlet, ucj, approvable);
        approvable = await this.userCapabilityJunctionApprovableDAO.put(approvable);
        ucj = this.applyApprovalToUCJ_(approvable, ucj);
        if ( wizardlet.reloadAfterSave && options.reloadData ) {
          wizardlet.loadingLevel = this.LoadingLevel.IDLE;
          this.load_(wizardlet, ucj);
        } else {
          wizardlet.status = ucj.status;
          wizardlet.loading = false;
        }
      } catch (e) {
        console.error(e);
        this.reportNetworkFailure(wizardlet, 'save', options);
      }
    },
    async function getUcjAndApprovable_(wizardlet) {
      let ucj = this.subject ? await this.crunchService.getJunctionFor(
        null, wizardlet.capability.id, this.subject.user, this.subject.realUser
      ) : await this.crunchService.getJunction(
        null, wizardlet.capability.id
      );
      let approvable = (await this.userCapabilityJunctionApprovableDAO.where(this.AND(
        this.EQ(this.Approvable.OBJ_ID, ucj.id),
        this.EQ(this.Approvable.STATUS, this.ApprovalStatus.REQUESTED)
      )).select()).array[0];
      if ( ! approvable ) approvable = this.createApprovable_(ucj);
      return { ucj: ucj, approvable: approvable };
    },
    function createApprovable_(ucj) {
      return this.Approvable.create({
        id: foam.uuid.randomGUID(),
        daoKey: 'userCapabilityJunctionDAO',
        serverDaoKey: 'userCapabilityJunctionDAO',
        of: 'foam.nanos.crunch.UserCapabilityJunction',
        objId: ucj.id,
        operation: 'UPDATE'
      });
    },
    function updateApprovable_(wizardlet, ucj, approvable) {
      var ucjNew = ucj.clone();
      ucjNew.data = wizardlet.data;
      approvable.propertiesToUpdate = ucj.diff(ucjNew);
    },
    function applyApprovalToUCJ_(approvable, oldUCJ) {
      var ucj = oldUCJ.clone();
      for ( let k in approvable.propertiesToUpdate ) {
        ucj[k] = approvable.propertiesToUpdate[k];
      }
      return ucj;
    },
  ]
});
