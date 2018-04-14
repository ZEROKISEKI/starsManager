package main

import (
  "time"
  "net"
  "github.com/ZEROKISEKI/go-astilectron-bootstrap"
  "github.com/asticode/go-astilectron"
  "strings"
)

// 如果用navigator.online来判断, 可能会出现能上网但是不能访问api.github.com但是online为true的情况, see MDN API
// 所以就打算跟目标api地址进行tcp连接判断, 当然这个方法觉得也是不靠谱的
func checkAPI(w *astilectron.Window) {
  c := make(chan bool)
  defer close(c)
  var x bool
  count := 0
  go func() {
    for {
      select {
      case x = <- c:
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

  // ticker := time.NewTicker(1 * time.Second)
  for {
    func() {
      timeout := time.Duration(500 * time.Millisecond)
      _, err := net.DialTimeout("tcp","api.github.com:80", timeout)
      if err != nil {
        // check if timeout or no such host
        if i := strings.Index(err.Error(), "no such host"); i != -1 {
          c <- false
        }
      } else {
        c <- true
      }
    }()
  }

}