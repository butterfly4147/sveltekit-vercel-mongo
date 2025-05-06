import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// 诊断MongoDB连接问题的脚本
async function diagnoseMongoConnection() {
  console.log('MongoDB连接诊断开始...');
  console.log('当前工作目录:', process.cwd());

  // 读取.env.local文件
  let rawUri = '';
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    console.log('查找.env.local文件:', envPath);
    
    if (fs.existsSync(envPath)) {
      console.log('.env.local文件存在');
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('.env.local文件内容:', envContent);
      
      const match = envContent.match(/MONGODB_URI=(.+)/);
      if (match && match[1]) {
        rawUri = match[1].trim();
        console.log('原始MongoDB URI:', rawUri);
      } else {
        console.log('无法在.env.local中找到MONGODB_URI');
      }
    } else {
      console.log('.env.local文件不存在');
    }
  } catch (err) {
    console.error('读取.env.local文件出错:', err);
  }

  if (!rawUri) {
    console.log('无法获取MongoDB URI，测试结束');
    return;
  }

  // 处理连接字符串编码
  try {
    console.log('尝试解析并编码URI');
    
    // 解析URI格式
    const prefix = rawUri.split('://')[0] + '://';
    const rest = rawUri.split('://')[1];
    
    // 提取用户名、密码和主机信息
    const userPassHost = rest.split('@');
    const userPass = userPassHost[0].split(':');
    const username = userPass[0];
    // 对密码部分进行编码
    const password = encodeURIComponent(userPass[1]);
    // 主机部分
    const host = userPassHost.slice(1).join('@');
    
    // 重构URI
    const encodedUri = `${prefix}${username}:${password}@${host}`;
    console.log('编码后的URI (隐藏密码):', encodedUri.replace(password, '****'));
    
    // 尝试连接
    console.log('尝试连接到MongoDB...');
    const client = new MongoClient(encodedUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      // 设置短超时时间以快速获取错误
      serverSelectionTimeoutMS: 5000
    });
    
    try {
      await client.connect();
      console.log('MongoDB连接成功!');
      
      // 列出数据库以验证连接
      const adminDb = client.db().admin();
      const dbs = await adminDb.listDatabases();
      console.log('可用的数据库:');
      dbs.databases.forEach(db => {
        console.log(`- ${db.name}`);
      });
      
      await client.close();
      console.log('MongoDB连接已关闭');
    } catch (connError) {
      console.error('MongoDB连接错误:', connError);
      
      // 分析错误类型
      if (connError.name === 'MongoServerSelectionError') {
        console.log('服务器选择超时 - 可能是网络问题、防火墙或MongoDB服务器无法访问');
      } else if (connError.message.includes('Authentication failed')) {
        console.log('认证失败 - 用户名或密码错误');
      } else if (connError.message.includes('unauthorized')) {
        console.log('未授权 - 用户没有访问请求数据库的权限');
      } else if (connError.message.includes('timed out')) {
        console.log('连接超时 - 检查网络连接和MongoDB服务器状态');
      }
    }
  } catch (parseError) {
    console.error('解析/处理MongoDB URI时出错:', parseError);
  }
}

// 执行诊断
diagnoseMongoConnection().catch(err => {
  console.error('诊断过程中出现未捕获的错误:', err);
});
