//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

let userno;

//處理圖檔
var multer = require("multer");
var mystorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.route.path);// '/uploadBanner'或'/upload'
    if (req.route.path == "/upload") {
      cb(null, "public/useravatar");
    } else if (req.route.path == "/uploadBanner") {
      cb(null, "public/user_banner");
    } //保存的路徑(目的地)
  },
  filename: function (req, file, cb) {
    //編寫檔案名稱
    var userFileName = userno + "." + file.originalname.split(".")[1]; //留下自己可辨別的檔案
    cb(null, userFileName);
  },
});
let upload = multer({
  storage: mystorage,
  fileFilter: function (req, file, cb) {
    // console.log('apple:'+JSON.stringify(req));
    // console.log('apple:'+JSON.stringify(file));
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("上傳檔案類型錯誤"));
    }
  },
});

page.post("/upload", upload.array("shotUpload", "userno"), function (req, res) {
  // console.log(req.files[0].originalname.split('.')[1]);
  // userno=req.body.userno;
  // console.log(res);
  let sql = `UPDATE tb_user SET avatar = ? WHERE userno = ?;`;
  let sqlAll = "SELECT `avatar` FROM `tb_user` WHERE userno=?;";
  connhelper.query(
    sql + sqlAll,
    [
      "/useravatar/" + userno + "." + req.files[0].originalname.split(".")[1],
      userno,
      userno,
    ],
    (err, results, fields) => {
      if (err) {
        console.log("MySQL 可能語法寫錯了", err);
        res.send(
          "伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。"
        );
      } else {
        // console.log(results[1]);
        res.json({ myPhotoAlert: "大頭貼修改完成", avatarData: results[1][0] });
      }
    }
  );
});
page.post(
  "/uploadBanner",
  upload.array("shotUpload", "userno"),
  function (req, res) {
    // console.log(req.files[0].originalname.split('.')[1]);
    // userno=req.body.userno;
    let sql = `UPDATE tb_user SET banner = ? WHERE userno = ?;`;
    let sqlAll = "SELECT `banner` FROM `tb_user` WHERE userno=?;";
    connhelper.query(
      sql + sqlAll,
      [
        "/user_banner/" +
        userno +
        "." +
        req.files[0].originalname.split(".")[1],
        userno,
        userno,
      ],
      (err, results, fields) => {
        if (err) {
          console.log("MySQL 可能語法寫錯了", err);
          res.send(
            "伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。"
          );
        } else {
          // console.log(results);
          res.json({
            myPhotoAlert: "封面照片修改完成",
            bannerData: results[1][0],
          });
        }
      }
    );
  }
);

// --------------- 這裡是個人資料讀取 --------------------
/* GET */
// ---------------//
page.get("/identity", function (req, res) {
  // console.log(req.body.userno);
  userno = req.query.userno;
  var sql =
    "SELECT  `userno`,`id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username`,`avatar`,`banner` FROM `tb_user` WHERE userno=?;";
  var sql2 =
    "SELECT SUBSTRING_INDEX(`id`, '@', 1) AS `username`, `articleno`, `nickname`, `avatar`, `tb_main_article`.`userno`, `title`, `image`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE `tb_collect`.`articleno` = `tb_main_article`.`articleno`) AS `count` FROM `tb_main_article` LEFT JOIN `tb_user` ON `tb_user`.`userno` = `tb_main_article`.`userno` WHERE `tb_main_article`.`articleno` IN (SELECT `tb_collect`.`articleno` FROM `tb_collect` WHERE `tb_collect`.`userno` = ?) AND `tb_main_article`.`status` = 'show' ORDER BY `tb_main_article`.`articleno` DESC;";

  connhelper.query(sql + sql2, [req.query.userno, req.query.userno], function (err, result, fields) {
    if (err) {
      // console.log(req.body.userno);
      res.send("<個人資料-渲染get>MySQL 可能語法寫錯了", err);
    } else {
      res.json({ userMessage: result[0], userLikes: result[1] });
    }
  });
});
//---------
/* POST */
//---------
page.post("/identity/update", express.urlencoded(), function (req, res) {
  var birthday = req.body.birthday ? req.body.birthday : null;
  var sql =
    "UPDATE `tb_user` SET `password`=?,`nickname`=?,`birthday`=?, `intro`=?,date=now() WHERE `userno`=?;";

  var sqlAll =
    "SELECT  `userno`,`id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=? ;";
  connhelper.query(
    sql + sqlAll,
    [
      req.body.password,
      req.body.nickname,
      birthday,
      req.body.intro,
      req.body.userno,
      req.body.userno,
    ],
    function (err, results, fields) {
      if (err) {
        res.send("<個人資料-更新post>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});
module.exports = page;
