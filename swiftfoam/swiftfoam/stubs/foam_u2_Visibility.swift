// GENERATED CODE. DO NOT MODIFY BY HAND.
public enum Visibility: Int, FOAM_enum {
  case RW
  case FINAL
  case DISABLED
  case RO
  case HIDDEN
    public var ordinal: Int {
    get {
      switch self {

  case .RW: return 0  

  case .FINAL: return 1  

  case .DISABLED: return 2  

  case .RO: return 3  

  case .HIDDEN: return 4  

}
    }
  }
    public var name: String {
    get {
      switch self {

  case .RW: return "RW"

  case .FINAL: return "FINAL"

  case .DISABLED: return "DISABLED"

  case .RO: return "RO"

  case .HIDDEN: return "HIDDEN"

}
    }
  }
    public var label: String {
    get {
      switch self {

  case .RW: return "Read-Write"

  case .FINAL: return "Final"

  case .DISABLED: return "Disabled"

  case .RO: return "Read-Only"

  case .HIDDEN: return "Hidden"

}
    }
  }
}