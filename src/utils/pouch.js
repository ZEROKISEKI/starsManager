import PouchDB from "pouchdb"

class DB {
  constructor() {
    this.database = new PouchDB('starsManager')
    this.delete = false
  }
  get db() {
    if(this.delete === true) {
      this.database = new PouchDB('starsManager')
      this.delete = false
    }
    return this.database
  }
  set db(value) {
    this.database = value
  }
  clear() {
    return this.database.destroy().then(res => {
      this.delete = true
      return res
    }).catch(err => {
      throw(err)
    })
  }
}


export default new DB();
