# Google 表格集成设置指南

## 步骤 1: 创建 Google 表格

1. 打开 [Google Sheets](https://sheets.google.com)
2. 创建新的空白表格
3. 命名为 "Flower Pot Orders" 或你喜欢的名字

## 步骤 2: 添加 Apps Script

1. 在表格中，点击 **扩展程序** > **Apps Script**
2. 删除默认代码
3. 复制 `google-apps-script.js` 文件中的所有代码并粘贴
4. 点击 **保存** (磁盘图标)

## 步骤 3: 部署为 Web 应用

1. 点击右上角 **部署** > **新部署**
2. 点击 **选择类型** > **Web 应用**
3. 设置：
   - **说明**: Flower Pot Webhook
   - **执行身份**: 我
   - **访问权限**: **任何人**
4. 点击 **部署**
5. 复制生成的 **Web 应用 URL**

## 步骤 4: 更新前端代码

1. 打开 `js/app.js`
2. 找到第 2 行的 `WEBHOOK_URL`
3. 替换为你复制的 Web 应用 URL：

```javascript
const WEBHOOK_URL = 'https://script.google.com/macros/s/你的SCRIPT_ID/exec';
```

4. 保存文件

## 步骤 5: 测试

1. 在浏览器中打开 `index.html`
2. 添加花朵和文字
3. 填写订单号或邮箱
4. 点击 **Submit Design**
5. 检查 Google 表格是否收到数据

## 表格列说明

- **提交时间**: 自动记录
- **订单号/邮箱**: 用户输入
- **标题**: 主标题文字
- **副标题**: 副标题文字
- **花朵详情**: 所有花朵的月份和名字
- **截图链接**: Google Drive 中的设计图片链接

## 故障排除

如果提交失败：
1. 确认 Web 应用访问权限设置为 "任何人"
2. 检查浏览器控制台是否有错误
3. 确认 WEBHOOK_URL 正确复制
