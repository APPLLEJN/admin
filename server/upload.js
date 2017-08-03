/**
 * Created by jiangnan on 17/7/19.
 */
//处理图像文件上传，图像文件保存在public/upload下
var fs = require('fs')
exports.upload = function (req, res) {
  fs.readFile(req.files.file.path, function (err, data) {
    var file = req.files.file
    file.path = "/upload/images/" + file.name;
    fs.writeFile(__dirname + file.path, data, function (err) {
      if (err) {
        return console.warn(err);
      }
      res.send({image_url: file.path})
      console.log("The file: " + file.name + " was saved to " + file.path);
    });
  });
}