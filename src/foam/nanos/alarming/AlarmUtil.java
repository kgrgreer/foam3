package foam.nanos.alarming;

import foam.core.X;
import foam.dao.DAO;
import static foam.mlang.MLang.*;

public class AlarmUtil {

  public static void createAlarm(X x, String name, String note, AlarmReason reason) {
    DAO alarmDAO = (DAO) x.get("alarmDAO");
    Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, name));
    if ( alarm != null && alarm.getIsActive() ) { return; }
    alarm = new Alarm.Builder(x)
      .setName(name)
      .setReason(reason)
      .setNote(note)
      .build();
    alarmDAO.put(alarm);
  }

}
