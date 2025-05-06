// 简单的MongoDB连接测试
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('开始MongoDB连接测试...');
  
  // 使用正确编码的连接字符串
  const uri = "mongodb+srv://vercelmongodb:jK9%24p2Lm%237xZ%40Qr5vB8%2AtN3eD@cluster0.anojpma.mongodb.net/";
  console.log('测试连接URI:', uri);
  
  const client = new MongoClient(uri, {
    // 设置短超时，以便快速发现问题
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });
  
  try {
    console.log('尝试连接到MongoDB...');
    await client.connect();
    console.log('成功连接到MongoDB!');
    
    // 尝试列出数据库
    const dbs = await client.db().admin().listDatabases();
    console.log('可用的数据库:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    await client.close();
    console.log('MongoDB连接已关闭');
  } catch (err) {
    console.error('MongoDB连接错误:', err);
    console.log('错误名称:', err.name);
    console.log('错误代码:', err.code);
    console.log('错误消息:', err.message);
    
    if (err.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('=> 无法解析主机名，可能是主机名不存在或DNS问题');
    } else if (err.message.includes('connection timed out')) {
      console.log('=> 连接超时，可能是网络问题或防火墙限制');
    } else if (err.message.includes('Authentication failed')) {
      console.log('=> 认证失败，用户名或密码不正确');
    }
  }
}

testConnection().catch(console.error);
