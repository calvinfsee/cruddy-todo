const fs = require('fs');
const path = require('path');
const util = require('util');
const _ = require('underscore');
const counter = require('./counter');
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, data) => { //Grabs new ID
    if (err) {
      console.log('an error: ', err);
    } else {
      let fileName = exports.dataDir;
      fs.writeFile(fileName + '/' + data + '.txt', text, (e, d) => { //Creates new file with new ID as filename, writes text in file
        if ( e ) {
          console.log(e);
        }
        // formulate data for server response
        callback(null, { id: data, text });
      });
    }
  });
};


exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files)=>{
    if (err) {
      callback(err);
    }
    let res = files.map(file => {
      return readFile(path.join(exports.dataDir, file)).then(text => {
        return {id: file.split('.')[0], text: text.toString()};
      }).catch(err => console.log(err));
    });
    Promise.all(res).then(results => callback(null, results)).catch(error => console.log(error));
  });
};

exports.readOne = (id, callback) => { //! Text parsed from this method is buffered
  fs.readFile(exports.dataDir + '/' + id + '.txt', (err, text)=>{ //grabs ID and text from the file
    if (!text) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      // server response data
      callback(null, { id, text: text.toString() });
    }
  });
};

exports.update = (id, text, callback) => { //Re-writes text in file if ID already exists
  fs.readFile(exports.dataDir + '/' + id + '.txt', (error)=>{
    if (error) {
      callback(new Error(`No item with id: ${error}`));
    } else {
      fs.writeFile(exports.dataDir + '/' + id + '.txt', text, (err)=>{
        if (err) {
          callback(new Error(`No item with id: ${err}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });

};

exports.delete = (id, callback) => { //Deletes file
  fs.rm(exports.dataDir + `/${id}.txt`, (err) => {
    if (err) {
      // report an error if item not found
      callback(new Error(`No item with id:${id} ${err}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
