package main

import (
  "flag"
  "github.com/asticode/go-astilectron"
  "github.com/ZEROKISEKI/go-astilectron-bootstrap"
  "github.com/asticode/go-astilog"
  "github.com/pkg/errors"
  "os"
  "path/filepath"
  "log"
  "runtime"
  "path"
)

var (
  AppName string
  BuiltAt string
  debug   = flag.Bool("d", true, "enables the debug mode")
  w       *astilectron.Window
  s       = runtime.GOOS
  dir     string
)

func main() {

  flag.Parse()
  astilog.FlagInit()

  if p, err := os.Executable(); err != nil {
    err = errors.Wrap(err, "os.Executable failed")
    return
  } else {
    p = filepath.Dir(p)
    log.Print(p)
  }

  if s != "windows" {
    dir, _ = filepath.Abs(filepath.Dir(os.Args[0]))
    dir = path.Join(dir, "../../..")
    _ = os.Chdir(dir)
  }

  astilog.Debugf("Running app built at %s", BuiltAt)

  if err := bootstrap.Run(bootstrap.Options{
    Asset: Asset,
    AstilectronOptions: astilectron.Options{
      AppName:            AppName,
      AppIconDarwinPath:  "src/dist/icon.icns",
      AppIconDefaultPath: "src/dist/icon.png",
    },
    Debug:    *debug,
    ResourcesPath: "src/dist",
    Homepage: "index.html",
    OnWait: func(_ *astilectron.Astilectron, iw *astilectron.Window, _ *astilectron.Menu, _ *astilectron.Tray, _ *astilectron.Menu) error {
      w = iw
      go checkAPI()
      return nil
    },
    MessageHandler: handleMessages,
    RestoreAssets:  RestoreAssets,
    WindowOptions: &astilectron.WindowOptions{
      BackgroundColor: astilectron.PtrStr("#fff"),
      Center:          astilectron.PtrBool(true),
      Height:          astilectron.PtrInt(760),
      Width:           astilectron.PtrInt(1350),
      MinWidth:        astilectron.PtrInt(1050),
    },
  }); err != nil {
    astilog.Fatal(errors.Wrap(err, "running bootstrap failed"))
  }

}
