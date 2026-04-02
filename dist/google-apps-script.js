// Google Apps Script 代码
// 部署步骤：
// 1. 打开 Google Sheets，创建新表格
// 2. 扩展程序 > Apps Script
// 3. 粘贴此代码
// 4. 部署 > 新部署 > 类型：Web 应用
// 5. 执行身份：我，访问权限：任何人
// 6. 复制 Web 应用 URL 到前端代码

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 如果是第一次运行，添加表头
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['提交时间', '订单号/邮箱', '标题', '副标题', '花朵详情', '截图链接']);
    }

    // 处理图片上传到 Google Drive
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(data.image_base64.split(',')[1]),
      'image/png',
      `design_${data.order_id}_${new Date().getTime()}.png`
    );

    const folder = DriveApp.getRootFolder(); // 或指定文件夹
    const file = folder.createFile(imageBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const imageUrl = file.getUrl();

    // 整理花朵信息
    const flowersText = data.layout_data.flowers.map(f =>
      `${getMonthName(f.month)} - ${f.name || '(无名字)'}`
    ).join('\n');

    // 添加数据行
    sheet.appendRow([
      new Date(),
      data.order_id,
      data.layout_data.global_text.title.text,
      data.layout_data.global_text.subtitle.text,
      flowersText,
      imageUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '提交成功'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getMonthName(month) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
}
