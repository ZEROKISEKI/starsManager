package main

import (
  "os"
  "log"
  "io/ioutil"
  "encoding/json"
  "time"
  "path"
  "strconv"
)

type StorageRepo struct {
  Name  string `json:"name"`
  Path  struct {
    Default  string   `json:"default"`
    Custom   string   `json:"custom,omitempty"`
  } `json:"path"`
}

type CloneRepoPath struct {
  Default string  `json:"default"`
  Custom  string  `json:"custom,omitempty"`
}

type SettingFile struct {
  StorageRepo   *StorageRepo    `json:"storageRepo"`
  CloneRepoPath *CloneRepoPath  `json:"cloneRepoPath"`
}

// 定义时间戳
type Timestamp int64

func (t *Timestamp) MarshalJSON() ([]byte, error) {
  return []byte(strconv.FormatInt(int64(*t), 10)), nil
}

func (t *Timestamp) UnmarshalJSON(b []byte) error {
  ts, err := strconv.Atoi(string(b))
  if err != nil {
    return err
  }

  *t = Timestamp(int64(time.Unix(int64(ts), 0).Unix()))

  return nil
}

type Classification struct {
  Name        string    `json:"name"`
  CreatedDate Timestamp `json:"createdDate"`
  Repos       []int64  `json:"repos,omitempty"`
}

func getClassification(storageRepoName string) (message interface{}, err error) {
  file, err := os.Open(path.Join(storageRepoName, "classifications.json"))
  if err != nil {
    return nil, err
  }

  classificationData, err := ioutil.ReadAll(file)
  if err != nil {
    return nil, err
  }

  file.Close()

  var data []Classification

  err = json.Unmarshal(classificationData, &data)
  if err != nil {
    return nil, err
  }

  return data, nil
}

func addClassification(storageRepoName, classificationName string) (message interface{}, err error) {
  file, err := os.Open(path.Join(storageRepoName, "classifications.json"))
  if err != nil {
    return nil, err
  }

  classificationData, err := ioutil.ReadAll(file)
  if err != nil {
    return nil, err
  }

  file.Close()

  var data []Classification

  if len(classificationData) == 0 {

  } else {
    err = json.Unmarshal(classificationData, &data)
    if err != nil {
      return nil, err
    }
  }

  var newClassification = Classification{
    Name: classificationName,
    CreatedDate: Timestamp(time.Now().Unix()),
    Repos: []int64{},
  }

  data = append(data, newClassification)
  newData, err := json.Marshal(data)
  if err != nil {
    return nil, err
  }

  file, err = os.OpenFile(
    path.Join(storageRepoName, "classifications.json"),
    os.O_WRONLY|os.O_TRUNC|os.O_CREATE,
    0666,)

  if err != nil {
    return nil, err
  }

  _, err = file.Write(newData)
  if err != nil {
    return nil, err
  }

  file.Close()

  return newClassification, nil
}

func setClassification(storageRepoName string, classification []Classification) error {
  file, err := os.OpenFile(
    path.Join(storageRepoName, "classifications.json"),
    os.O_WRONLY|os.O_TRUNC|os.O_CREATE,
    0666,)

  if err != nil {
    return err
  }

  newData, err := json.Marshal(classification)
  if err != nil {
    return err
  }

  _, err = file.Write(newData)
  if err != nil {
    return err
  }

  file.Close()

  return nil
}

func readSettingsFile() SettingFile {
  file, err := os.Open("config.json")
  if err != nil {
    log.Print(err)
  }

  defer file.Close()

  data, err := ioutil.ReadAll(file)
  if err != nil {
    log.Print(err)
  }

  var fileData SettingFile

  err = json.Unmarshal(data, &fileData)
  if err != nil {
    log.Println(err)
  }

  return fileData
}

func saveSettingsFile(data SettingFile) error {
  file, err := os.OpenFile(
    "config.json",
    os.O_WRONLY|os.O_TRUNC|os.O_CREATE,
    0666,
  )

  if err != nil {
    return err
  }

  defer file.Close()

  bytesData, err := json.Marshal(data)

  if err != nil {
    return err
  }

  _, err = file.Write(bytesData)
  if err != nil {
    log.Fatal(err)
  }

  return nil
}

