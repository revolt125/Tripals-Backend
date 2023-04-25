//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

//處理圖檔
var multer = require('multer');
var mystorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/userno_2");//保存的路徑(目的地)
    },
    filename: function (req, file, cb) {//編寫檔案名稱
        // var userFileName = Date.now() + '-' + file.originalname;//留下檔案戳記記錄歷程
        var userFileName='avatar'+'.'+file.originalname.split('.')[1];//留下自己可辨別的檔案
        cb(null, userFileName);
    }
})
let upload = multer({
    storage: mystorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'image/png'||file.mimetype == 'image/jpg'||file.mimetype == 'image/jpeg'||file.mimetype == 'image/gif') {
            cb(null, true)
        } else {
           return cb(new Error('上傳檔案類型錯誤'))
        }
    }
});
page.post('/upload', upload.single('shotUpload'), function(req, res) {
    console.log('okk');
    console.log(req.file);
    console.log(req);
  });

//select
page.get('/avatar', function (req, res) {
    var sql = "SELECT avatar FROM `tb_user` WHERE userno=2; ";//?接收使用這輸入資料
    connhelper.query(sql,
        [],//填入2的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                res.json(result[0]);
            }
        });

});

module.exports = page;
