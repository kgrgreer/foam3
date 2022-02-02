/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var classes = [
  'foam.nanos.auth.CreatedByAware',
  'foam.nanos.crunch.Capability',
  'foam.nanos.auth.LastModifiedByAware',
  'foam.nanos.auth.EnabledAware',
  'foam.nanos.auth.User',
  'foam.nanos.approval.ApprovalRequest',
  'foam.nanos.auth.Group',
  'foam.nanos.crunch.CapabilityCapabilityJunction',
  'foam.nanos.crunch.CapabilityCapabilityJunctionId',
  'foam.nanos.crunch.AgentCapabilityJunction',
  'foam.nanos.crunch.UserCapabilityJunction',
  'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
  'foam.nanos.crunch.CapabilityCategoryCapabilityJunctionId',
  'foam.nanos.crunch.CapabilityCategory',
//  'foam.nanos.doc.DocumentationView',
  'foam.nanos.demo.relationship.StudentCourseJunction',
  'foam.nanos.demo.relationship.StudentCourseJunctionId',
  'foam.nanos.demo.relationship.Student',
  'foam.nanos.google.api.sheets.views.ImportDataMessage',
  'foam.nanos.google.api.sheets.views.GoogleSheetsTransactionsDataImportServiceImpl',
  'foam.nanos.google.api.sheets.views.GoogleSheetsDataImportServiceImpl',
  'foam.nanos.google.api.sheets.views.GoogleSheetsDataImportService',
  'foam.nanos.google.api.sheets.views.GoogleSheetsImportConfig',
  'foam.nanos.google.api.sheets.views.ColumnHeaderToPropertyMapping',
  'foam.nanos.column.NestedPropertiesExpression',
  'foam.nanos.column.ColumnPropertyValue',
  'foam.nanos.column.ColumnConfigToPropertyConverter',
  'foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder',
  'foam.nanos.notification.push.FirebasePushService',
  'foam.nanos.medusa.Clusterable',
//  'foam.nanos.menu.ViewMenu',
//  'foam.nanos.menu.TabsMenu',
//  'foam.nanos.menu.SubMenuView',
//  'foam.nanos.menu.PopupMenu',
//  'foam.nanos.menu.SubMenu',
//  'foam.nanos.menu.ListMenu',
//  'foam.nanos.menu.LinkMenu',
//  'foam.nanos.menu.DocumentMenu',
//  'foam.nanos.menu.DAOMenu2',
//  'foam.nanos.menu.DAOMenu',
  'foam.nanos.auth.DeletedAwareDummy',
  'foam.nanos.auth.DeletedAware',
  'foam.nanos.auth.HidePropertiesSink',
  'foam.nanos.auth.UserUserJunction',
  'foam.nanos.auth.UserUserJunctionId',
  'foam.nanos.auth.CheckPermissionsSink',
  'foam.nanos.auth.GroupPermissionJunction',
  'foam.nanos.auth.GroupPermissionJunctionId',
  'foam.nanos.auth.EnabledAwareDummy',
];


var abstractClasses = [
//  'foam.json.Outputter'
];


var skeletons = [
  'foam.dao.DAO',
  'foam.i18n.TranslationService',
  'foam.nanos.app.AppConfigService',
  'foam.nanos.auth.AgentAuthService',
  'foam.nanos.auth.AuthService',
  'foam.nanos.auth.UserPropertyAvailabilityServiceInterface',
  'foam.nanos.auth.UserQueryService',
  'foam.nanos.crunch.CrunchService',
  'foam.nanos.export.GoogleSheetsExport',
  'foam.nanos.google.api.sheets.views.GoogleSheetsDataImportService',
  'foam.nanos.medusa.ElectoralService',
  'foam.nanos.notification.ResendNotificationServiceInterface',
  'foam.nanos.session.SessionService',
  'foam.nanos.test.EchoService',
  'foam.strategy.StrategizerService',
  'foam.util.uid.GlobalSearchService'
 ];

 var proxies = [
   'foam.blob.Blob',
   'foam.blob.BlobService',
   'foam.dao.Journal',
   'foam.dao.Sink',
   'foam.i18n.TranslationService',
   'foam.lib.csv.CSVOutputter',
   'foam.lib.Outputter',
   'foam.lib.parse.Parser',
   'foam.lib.parse.PStream',
   'foam.nanos.auth.twofactor.OTPAuthService',
   'foam.nanos.auth.UniqueUserService',
   'foam.nanos.auth.UserPropertyAvailabilityServiceInterface',
   'foam.nanos.logger.Logger',
   'foam.nanos.notification.email.EmailService',
   'foam.nanos.notification.push.PushService',
   'foam.strategy.StrategizerService',
 ];

module.exports = {
    classes:         classes,
    abstractClasses: [],
    skeletons:       skeletons,
    proxies:         proxies,
    blacklist:       []
};
