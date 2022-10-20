Email

Updated : August 17, 2022





#### EmailTemplates

You can describe a different name, group, locale, and spid on each emailTemplate.
But, these properties do no need to be explicitly set on each emailTemplate but should be set if needed.
If not, they will just be the default values. (Check EmailTemplate.js)


There are several emailTemplates named as “header” but with a different spid or group.
These templates can be a kind of baseTemplates.
For example, per spid, it goes with different settings such as image logo, wordings, theme etc.
“header” will handle these. Once you add “header”, you don’t need to care about this base on every email template.
<include template = 'header'> will do. The proper header will be picked.

All you need to do is add a new emailTemplate that you need for the functionality as a body (if a proper “header” already exists).


The emailTemplate will be picked by the logic in “EmailTemplateSupport.java” dynamically.
The cases are defined like below :


name  group locale spid
Y     Y     Y     Y
Y     Y     Y     *
Y     Y     *     Y
Y     Y     *     *
Y     *     *     Y
Y     *     *     *


NOTE: EmailTemlateSupport searches on name, not id


For example, there can be several emailTemplates under the same name as well.
According to the given values of name, group, locale, spid, It will try to find a proper emailTemplate.

If no emailTemplate is found with the given info,
in the end it will try to search an emailTemplate with only a name which is not a totally desired one.
So make sure there is a proper emailTemplate that is well described for the purpose.






#### Adding functionality to Send Email Notification

Call one of the below:

     1. Use new EmailMessage() and its put()
     2. user.doNotify()  –  by using a notification
     3. EmailsUtility.sendEmailFromTemplate() – Deprecated, use emailMessageDAO directly


Make sure to set Map template arguments which are relevant variables for emailTemplates.
But no need to set every variable such as logo, link, appName etc.
This is handled by “ApplyBaseArgumentsEmailPropertyService.js”.
Only variables that will be used in a specific emailTemplate need to be added in an argument.







#### Trace Source of Email

To provide an easy means for a system administrator to see and manage which email is sent out or where it is triggered.
To track this, set “templateSource” which is about a source of email generation in an argument too.
This is like - args.put("templateSource", this.getClass().getName());






####  EmailMessage rule based flow

NOTE : No need to update this part every time when you add a functionality of sending email or a new emailTemplate.



Rule id :  "foam-nanos-notification-email-EmailMessagePropertyServiceRule"

Action : "foam.nanos.notification.email.EmailMessagePropertyServiceRuleAction"


The rule is passing EmailMessage through “emailPropertyService”.
"emailPropertyService" using “ChainedPropertyService”
that stores the array of decorators that fills the emailMessage with service level precedence on properties.


- ApplyBaseArgumentsEmailPropertyService.js
  Set up the base arguments of theme, appConfig, logo, link etc. that are being used in emailTemplate.

- EmailTemplateApplyEmailPropertyService
  Find an emailTemplate via EmailTemplateSupport.findTemplate() then apply template args to emailTemplate and onto the emailMessage

- GroupEmailTemplateService
  Fill out unset properties on an email with values from the group if needed

- EmailConfigEmailPropertyService
  Fill out unset properties on an email with values from the system emailConfig service

- EmailMessageValidationPropertyService
  Do validation check if email properties such as Subject, Body, To, From are set





##### template enable

There is a Boolean property named “enabled” and
its default value is set to true in “EmailTemplateSource” (mixins in EmailTemplate.js)

This determines whether to send out email. This is handled in “EmailTemplateApplyEmailPropertyService.js”
If this is false, it means that emailTemplate is disabled so skipping sending email.

A system administrator can manage this value to enable/disable emailTemplate.
