// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Chars: AbstractFObject, Parser {

  public var chars: String {
    get {
      
if _chars_inited_ {
  return _chars_!
}

return ""

      
    }
set(value) {
      
self.set(key: "chars", value: value)
      
    }
  }

  var _chars_: String! = nil

  var _chars_inited_: Bool = false

  public static let CHARS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "chars"
  let classInfo: ClassInfo
  let transient = false
  let label = "Chars" // TODO localize
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

  private lazy var chars_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "chars",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var chars_Value_Sub_: Subscription?

  public var chars$: Slot {
    get {
      return self.chars_Value_
    }
set(value) {
      
self.chars_Value_Sub_?.detach()
self.chars_Value_Sub_ = self.chars$.linkFrom(value)
self.onDetach(self.chars_Value_Sub_!)
      
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

  private func `_chars_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_chars_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_chars_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
if ps.valid() && chars.index(of: ps.head()) != -1 {
  return ps.tail().setValue(ps.head())
}
return nil
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Chars.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Chars.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "chars":
    _chars_inited_ = false
    _chars_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "chars"]) {
      _ = pub(["propertyChange", "chars", chars$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "chars": return `_chars_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "chars": return `chars`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "chars": return `chars$`


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "chars$":
    chars$ = value as! Slot
    return
  case "chars":
  
    let oldValue: Any? = _chars_inited_ ? self.`chars` : nil
    _chars_ = _chars_preSet_(oldValue, _chars_adapt_(oldValue, value))
    _chars_inited_ = true
    _chars_postSet_(oldValue, _chars_)
    if hasListeners(["propertyChange", "chars"]) && !FOAM_utils.equals(oldValue, _chars_) {
      _ = pub(["propertyChange", "chars", chars$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Chars"

    lazy var label: String = "Chars"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [CHARS,PARSE]

    lazy var cls: AnyClass = Chars.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Chars(args, x)
    }

  }

}