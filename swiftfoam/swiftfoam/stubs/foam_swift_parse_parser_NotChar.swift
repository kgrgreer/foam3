// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class NotChar: AbstractFObject, Parser {

  public var ch: Character {
    get {
      
if _ch_inited_ {
  return _ch_!
}

fatalError("No default value for ch")

      
    }
set(value) {
      
self.set(key: "ch", value: value)
      
    }
  }

  var _ch_: Character! = nil

  var _ch_inited_: Bool = false

  public static let CH: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "ch"
  let classInfo: ClassInfo
  let transient = false
  let label = "Ch" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var ch_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "ch",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var ch_Value_Sub_: Subscription?

  public var ch$: Slot {
    get {
      return self.ch_Value_
    }
set(value) {
      
self.ch_Value_Sub_?.detach()
self.ch_Value_Sub_ = self.ch$.linkFrom(value)
self.onDetach(self.ch_Value_Sub_!)
      
    }
  }

  lazy var parse$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let ps = args[0] as! PStream

    let x = args[1] as! ParserContext

    
    return self!.`parse`(
        _: ps, _: x)
  }
])
      
  }()

  public static let PARSE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parse"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_ch_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Character {
    return newValue as! Character
  }

  private func `_ch_preSet_`(_ oldValue: Any?, _ newValue: Character) -> Character {
    return newValue
  }

  private func `_ch_postSet_`(_ oldValue: Any?, _ newValue: Character) {
    
  }

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
return ps.valid() && ps.head() != ch ? ps.tail().setValue(ps.head()) : nil
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return NotChar.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return NotChar.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "ch":
    _ch_inited_ = false
    _ch_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "ch"]) {
      _ = pub(["propertyChange", "ch", ch$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "ch": return `_ch_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "ch": return `ch`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "ch": return `ch$`


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "ch$":
    ch$ = value as! Slot
    return
  case "ch":
  
    let oldValue: Any? = _ch_inited_ ? self.`ch` : nil
    _ch_ = _ch_preSet_(oldValue, _ch_adapt_(oldValue, value))
    _ch_inited_ = true
    _ch_postSet_(oldValue, _ch_)
    if hasListeners(["propertyChange", "ch"]) && !FOAM_utils.equals(oldValue, _ch_) {
      _ = pub(["propertyChange", "ch", ch$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.NotChar"

    lazy var label: String = "Not Char"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [CH,PARSE]

    lazy var cls: AnyClass = NotChar.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return NotChar(args, x)
    }

  }

}