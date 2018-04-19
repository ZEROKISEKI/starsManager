package main

import (
  "github.com/asticode/go-astilectron"
  "github.com/ZEROKISEKI/go-astilectron-bootstrap"
  "github.com/asticode/go-astilog"
  "net/url"
  "github.com/pkg/errors"
  "net/http"
  "strings"
  "encoding/json"
  "os"
  "os/exec"
  "path"
)

const (
  ClientId                 = "bd3647343f421a446897"
  ClientSecret             = "e86f4c1a925fd0b7464406cf5c88a758378b517b"
  RedirectUri              = "http://localhost"
  AuthorizedCodeURL        = "https://github.com/login/oauth/authorize"
  AuthorizedTokenURL       = "https://github.com/login/oauth/access_token"
)


// handleMessages handles messages
func handleMessages(a *astilectron.Astilectron, _ *astilectron.Window, m bootstrap.MessageIn) (payload interface{}, err error) {
  switch m.Name {
    case "Login": {
      requestCodeUrl := url.Values{}
      requestCodeUrl.Set("response_type", "code")
      requestCodeUrl.Add("client_id", ClientId)
      requestCodeUrl.Add("client_secret", ClientSecret)
      requestCodeUrl.Add("redirect_uri", RedirectUri)
      requestCodeUrl.Add("scope", "user public_repo")

      var ow, _ = a.NewWindow(AuthorizedCodeURL + "?" + requestCodeUrl.Encode(), &astilectron.WindowOptions{
        Center: astilectron.PtrBool(true),
        Height: astilectron.PtrInt(600),
        Width:  astilectron.PtrInt(600),
      })

      ow.On(astilectron.EventNameWindowEventDidGetRedirectRequest, func(e astilectron.Event) (deleteListener bool) {

        result := &struct {
          AccessToken   string  `json:"access_token"`
          TokenType     string  `json:"token_type,omitempty"`
          Scope         string  `json:"scope,omitempty"`
        }{}

        client := &http.Client{}

        requestTokenUrl := url.Values{}
        requestTokenUrl.Set("client_id", ClientId)
        requestTokenUrl.Add("client_secret", ClientSecret)
        requestTokenUrl.Add("code", getURLParam(e.URLNew, "code"))
        requestTokenUrl.Add("redirect_uri", RedirectUri)

        req, _ := http.NewRequest("POST", AuthorizedTokenURL,
          strings.NewReader(requestTokenUrl.Encode()))

        req.Header.Add("Accept", "application/json")
        req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

        resp, _ := client.Do(req)

        json.NewDecoder(resp.Body).Decode(result)

        resp.Body.Close()

        message :=  &bootstrap.MessageOut{
          Name: e.Name,
          Payload: struct {
            AccessToken   string  `json:"access_token"`
            TokenType     string  `json:"token_type,omitempty"`
            Scope         string  `json:"scope,omitempty"`
          }{
            AccessToken: result.AccessToken,
            TokenType: result.TokenType,
            Scope: result.Scope,
          },
        }

        w.SendMessage(message, func(m *astilectron.EventMessage) {
          // Unmarshal
          // var s string
          // m.Unmarshal(&s)

          // Process message
          // astilog.Debugf("received %s", s)
          ow.Close()
        })

        return
      })

      ow.On(astilectron.EventNameWindowEventWillNavigate, func(e astilectron.Event) (deleteListener bool) {

        // as what the above code do

        result := &struct {
          AccessToken   string  `json:"access_token"`
          TokenType     string  `json:"token_type,omitempty"`
          Scope         string  `json:"scope,omitempty"`
        }{}

        client := &http.Client{}

        requestTokenUrl := url.Values{}
        requestTokenUrl.Set("client_id", ClientId)
        requestTokenUrl.Add("client_secret", ClientSecret)
        requestTokenUrl.Add("code", getURLParam(e.URL, "code"))
        requestTokenUrl.Add("redirect_uri", RedirectUri)

        req, _ := http.NewRequest("POST", AuthorizedTokenURL,
          strings.NewReader(requestTokenUrl.Encode()))

        req.Header.Add("Accept", "application/json")
        req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

        resp, _ := client.Do(req)

        json.NewDecoder(resp.Body).Decode(result)

        resp.Body.Close()

        message :=  &bootstrap.MessageOut{
          Name: e.Name,
          Payload: struct {
            AccessToken   string  `json:"access_token"`
            TokenType     string  `json:"token_type,omitempty"`
            Scope         string  `json:"scope,omitempty"`
          }{
            AccessToken: result.AccessToken,
            TokenType: result.TokenType,
            Scope: result.Scope,
          },
        }

        w.SendMessage(message, func(m *astilectron.EventMessage) {
          // Unmarshal
          // var s string
          // m.Unmarshal(&s)

          // Process message
          // astilog.Debugf("received %s", s)
          ow.Close()
        })

        return
      })

      ow.Create()
      break
    }
    case "SaveSettingsFile": {

      var fileData SettingFile
      err = json.Unmarshal(m.Payload, &fileData)
      if err != nil {
        return "fail", nil
      }

      err = saveSettingsFile(fileData)
      if err != nil {
        return "fail", nil
      }

      return "success", nil
    }
    case "GetSettingsFile" : {
      fileData := readSettingsFile()
      return fileData, nil
    }
    case "Download" : {
      break
    }
    case "CreateStorageRepo": {
      var repoName string
      json.Unmarshal(m.Payload, &repoName)
      if _, err := os.Stat(repoName); os.IsNotExist(err) {
        _ = os.Mkdir(repoName, 0755)
        classificationsFile, err := os.Create(path.Join(repoName, "classifications.json"))
        if err != nil {
          return err.Error(), nil
        }
        classificationsFile.Close()
        wd, _ := os.Getwd()
        _ = os.Chdir(repoName)
        cmd := exec.Command("git", "init")
        err = cmd.Run()
        if err != nil {
          return err.Error(), nil
        }
        _ = os.Chdir(wd)
        return "success", nil
      } else {
        return "not empty", nil
      }
      break
    }
    case "AddClassification": {
      var pathData struct{
        ClassificationName string `json:"classificationName"`
        StorageRepoName    string `json:"storageRepoName"`
      }

      err := json.Unmarshal(m.Payload, &pathData)
      if err != nil {
        return err.Error(), nil
      }

      message, err := addClassification(pathData.StorageRepoName, pathData.ClassificationName)
      if err != nil {
        return err.Error(), nil
      }

      return message, nil
    }
    case "GetClassification" : {
      var t struct {
        StorageRepoName    string `json:"storageRepoName"`
      }
      err := json.Unmarshal(m.Payload, &t)
      if err != nil {
        return err.Error(), nil
      }

      data, err := getClassification(t.StorageRepoName)

      if err != nil {
        return err.Error(), nil
      }

      return data, nil
    }
    case "SetClassification": {
      var t struct {
        StorageRepoName    string             `json:"storageRepoName"`
        Classification     []Classification   `json:"classification"`
      }
      err := json.Unmarshal(m.Payload, &t)
      if err != nil {
        return err.Error(), nil
      }

      err = setClassification(t.StorageRepoName, t.Classification)

      if err != nil {
        return err.Error(), nil
      }

      return "success", nil
    }
  }
  return
}


// get url parameter
func getURLParam(targetURL, param string) string {
  query, err := url.Parse(targetURL)
  if err != nil {
    astilog.Error(errors.Wrap(err, "parsing URL failed"))
  }
  value, err := url.ParseQuery(query.RawQuery)
  if err != nil {
    astilog.Error(errors.Wrap(err, "parsing URLQuery failed"))
  }
  return value.Get(param)
}