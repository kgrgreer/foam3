/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.logger.Loggers;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import org.jtwig.resource.loader.ResourceLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static foam.mlang.MLang.*;

public class EmailTemplateSupport
  extends    ContextAwareSupport
  implements ResourceLoader
{
  protected String groupId_;
  protected String locale_;
  protected String spid_;

  public static EmailTemplate findTemplate(X x, String idOrName, String groupId, String locale, String spid, Map templateArgs) {
    String name = idOrName;
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    EmailTemplate emailTemplate = null;
    Logger logger = Loggers.logger(x, new EmailTemplateSupport());

    /*
    name  group locale spid
      Y     Y     Y     Y
      Y     Y     Y     *
      Y     Y     *     Y
      Y     Y     *     *
      Y     *     *     Y
      Y     *     *     *
    */

    // logger.debug("name", name, "groupId", groupId, "locale", locale, "spid", spid);

    List<String> groupIdList = new ArrayList<>();

    while ( ! SafetyUtil.isEmpty(groupId) ) {
      groupIdList.add(groupId);

      if ( ! SafetyUtil.isEmpty(spid) )
        emailTemplate = findTemplateHelper(x, name, groupId, locale, spid, templateArgs);

      if ( emailTemplate != null ) return emailTemplate;

      // next group setup
      Group group = (Group) groupDAO.find(groupId);
      groupId = ( group != null && ! SafetyUtil.isEmpty(group.getParent()) ) ? group.getParent() : "";
    }

    // loop through grps again without spid
    for ( String group : groupIdList ) {
      emailTemplate = findTemplateHelper(x, name, group, locale, "", templateArgs);

      if ( emailTemplate != null ) return emailTemplate;
    }

    // loop through grps again without locale - default 'en'
    for ( String group : groupIdList ) {
      emailTemplate = findTemplateHelper(x, name, group, "en", spid, templateArgs);

      if ( emailTemplate != null ) return emailTemplate;
    }

    // loop through grps again without locale or spid
    for ( String group : groupIdList ) {
      emailTemplate = findTemplateHelper(x, name, group, "en", "", templateArgs);

      if ( emailTemplate != null ) return emailTemplate;
    }

    // check spid no locale or group
    emailTemplate = findTemplateHelper(x, name,"", "en", spid, templateArgs);

    //check just name - if not null
    if ( emailTemplate == null )
      emailTemplate = findTemplateHelper(x, name, "", "en", "", templateArgs);

    return emailTemplate;
  }

  public static EmailTemplate findTemplate(X x, String name, String groupId, String locale, String spid) {
    Map templateArgs = new HashMap<>();
    return findTemplate(x, name, groupId, locale, spid, templateArgs);
  }

  public static EmailTemplate findTemplate(X x, String name) {
    User user = ((Subject) x.get("subject")).getRealUser();
    var groupId = user.findGroup(x).getId();
    String locale = user.getLanguage().getCode();
    String spid = user.getSpid();

    return findTemplate(x, name, groupId, locale, spid);
  }

  public static EmailTemplate findTemplateHelper(X x, String name, String groupId, String locale, String spid, Map templateArgs) {
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    EmailTemplate emailTemplate_ = (EmailTemplate) emailTemplateDAO
      .find(
        AND(
            OR(
               EQ(EmailTemplate.ID, name),
               EQ(EmailTemplate.NAME, name)
               ),
          EQ(EmailTemplate.GROUP, SafetyUtil.isEmpty(groupId) ? "*" : groupId),
          EQ(EmailTemplate.SPID, spid),
          EQ(EmailTemplate.LOCALE, locale)
        ));

    // NOTE: email is using during startup for error reporting. This put()
    // itself can fail and lead to a cascade of errors.
    // if ( emailTemplate_ != null ) {
    //   EmailTemplate clonedTemplate = (EmailTemplate) emailTemplate_.fclone();
    //   setTemplateSource(x, name, clonedTemplate,templateArgs);

    //   emailTemplateDAO.put(clonedTemplate);
    // }

    return emailTemplate_;
  }

  public static void setTemplateSource(X x, String name, EmailTemplate emailTemplate, Map templateArgs) {
      String sourceType = (String) templateArgs.get("templateSourceType");
      String templateSource = (String) templateArgs.get("templateSource");
      String source = templateSource != null ? templateSource : "emailTemplate";
      emailTemplate.setSourceClass(source);

      PM pm = PM.create(x, source,  "emailTemplate", name);
      pm.log(x);
  }

  public EmailTemplateSupport() {
  }

  public EmailTemplateSupport(X x, String groupId, String locale, String spid) {
    setX(x);
    this.groupId_ = groupId;
    this.locale_  = locale;
    this.spid_ = spid;
  }

  @Override
  public Optional<Charset> getCharset(String s) {
    return Optional.absent();
  }

  @Override
  public InputStream load(String s) {
    EmailTemplate template = EmailTemplateSupport.findTemplate(getX(), s, this.groupId_, this.locale_, this.spid_);
    return template == null ? null : new ByteArrayInputStream(template.getBodyAsByteArray());
  }

  @Override
  public boolean exists(String s) {
    return load(s) != null;
  }

  @Override
  public Optional<URL> toUrl(String s) {
    return Optional.absent();
  }
}
