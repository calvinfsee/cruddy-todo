const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');


// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, data) => {
    if (err) {
      console.log('an error: ', err);
    } else {
      let fileName = exports.dataDir;
      fs.writeFile(fileName + '/' + data + '.txt', text, (e, d) => {
        if ( e ) {
          console.log(e);
        }

        callback(null, { id: data, text });
      });
    }
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, data)=>{
    if (err) {
      console.log(err);
    }

    callback(null, data.map(item=>({id: item.split('.')[0], text: item.split('.')[0]})));
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + '/' + id + '.txt', (err, text)=>{
    if (!text) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: text.toString() });
    }
  });
};

exports.update = (id, text, callback) => {
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

exports.delete = (id, callback) => {
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
