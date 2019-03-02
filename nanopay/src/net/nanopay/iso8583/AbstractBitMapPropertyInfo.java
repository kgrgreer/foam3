package net.nanopay.iso8583;

import foam.core.AbstractPropertyInfo;
import foam.lib.json.Outputter;

/**
 * PropertyInfo class for BitMap types
 */
public abstract class AbstractBitMapPropertyInfo
  extends AbstractPropertyInfo
{
  protected final static ThreadLocal<StringBuilder> sb_ = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  @Override
  public Object fromString(String value) {
    return java.util.BitSet.valueOf(foam.util.SecurityUtil.HexStringToByteArray(value));
  }

  @Override
  public void toJSON(Outputter outputter, Object value) {
    int sum = 0;
    int digit = 1;

    StringBuilder sb = sb_.get();
    java.util.BitSet set = (java.util.BitSet) value;
    int bits = set.size();

    // output the bitset as a hex string
    for ( int i = 0 ; i < bits ; i++ ) {
      int bit = set.get(i + 1) ? 1 : 0;

      if ( digit == 1 ) {
        sum += bit * 8;
      } else if ( digit == 2 ) {
        sum += bit * 4;
      } else if ( digit == 3 ) {
        sum += bit * 2;
      } else if ( digit == 4 || i < bits + 1 ) {
        sum += bit;
        digit = 0;
        if ( sum < 10 ) {
          sb.append(sum);
        } else if ( sum == 10 ) {
          sb.append('A');
        } else if ( sum == 11 ) {
          sb.append('B');
        } else if ( sum == 12 ) {
          sb.append('C');
        } else if ( sum == 13 ) {
          sb.append('D');
        } else if ( sum == 14 ) {
          sb.append('E');
        } else if ( sum == 15 ) {
          sb.append('F');
        }
        sum = 0;
      }
      digit += 1;
    }

    outputter.output(sb.toString());
  }
}
