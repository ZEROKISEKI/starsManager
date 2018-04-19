package main

import (
  "time"
  "net"
  "github.com/ZEROKISEKI/go-astilectron-bootstrap"
  "github.com/asticode/go-astilectron"
)

// 如果用navigator.online来判断, 可能会出现能上网但是不能访问api.github.com但是online为true的情况, see MDN API
// 所以就打算跟目标api地址进行tcp连接判断, 这个方法也是不靠谱的(windows下)
func checkAPI() {
  c := make(chan bool)
  defer close(c)
  var x bool
  var stop = false
  count := 0

  w.On(astilectron.EventNameWindowEventClosed, func(e astilectron.Event) (deleteListener bool) {
    stop = true
    return
  })

  go func() {
    for {
      select {
      case x = <- c:
        if stop {
          break
        }
        if !x {
          if count += 1; count == 1 {
            message := &bootstrap.MessageOut{
              Name: "NoNetwork",
            }
            w.SendMessage(message, func(m *astilectron.EventMessage) {})
          }
        } else {
          count = 0
          message := &bootstrap.MessageOut{
            Name: "HasNetwork",
          }
          w.SendMessage(message, func(m *astilectron.EventMessage) {})
        }
      }
    }
  }()

  for stop == false {
    func() {
      timeout := time.Duration(5 * time.Second)
      _, err := net.DialTimeout("tcp","api.github.com:80", timeout)
      if err != nil {
        // 本来是check no such host
        // 但是有多种启用网的时候不适用
        c <- false
      } else {
        c <- true
      }
    }()
  }

}