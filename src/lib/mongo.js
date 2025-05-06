import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log('开始加载 MongoDB 配置...');

// 加载环境变量
try {
  // 首先使用新创建的环境文件
  dotenv.config({ path: 'new-env.local' });
  // 其次使用原始文件作为备用
  dotenv.config({ path: '.env.local' });
  // 最后使用全局环境变量
  dotenv.config();
  
  console.log('环境变量已加载');
} catch (err) {
  console.error('加载环境变量出错:', err);
}

// 获取 MongoDB URI
let mongoUri = '';

// 从环境变量中获取URI
if (process.env.MONGODB_URI) {
  console.log('从环境变量中找到MongoDB URI');
  const rawUri = process.env.MONGODB_URI;
  
  // 处理密码中的特殊字符
  try {
    // 对URI进行解析和编码
    const parts = rawUri.split('://');
    const protocol = parts[0];
    const restParts = parts[1].split('@');
    
    // 如果有多个@符号，就需要特殊处理
    if (restParts.length > 1) {
      const credentials = restParts[0].split(':');
      if (credentials.length > 1) {
        const username = credentials[0];
        const password = encodeURIComponent(credentials[1]);
        const host = restParts.slice(1).join('@');
        
        // 重构URI与编码密码
        mongoUri = `${protocol}://${username}:${password}@${host}`;
        console.log('MongoDB URI已重新编码');
      } else {
        mongoUri = rawUri; // 无法解析凭证
      }
    } else {
      mongoUri = rawUri; // 无@符号，不需要特殊处理
    }
  } catch (parseError) {
    console.error('MongoDB URI解析出错:', parseError);
    // 出错时使用原始URI
    mongoUri = rawUri;
  }
} else {
  console.log('在环境变量中找不到 MONGODB_URI');
}

// 如果仍然没有URI，使用备用的测试URI
const uri = mongoUri || "mongodb+srv://test:test@cluster0.mongodb.net/test?retryWrites=true&w=majority";

// 安全地记录URI（隐藏凭据）
const uriParts = uri.split('@');
if (uriParts.length > 1) {
  console.log('MongoDB URI主机部分:', uriParts[uriParts.length - 1]);
} else {
  console.log('使用备用MongoDB连接字符串');
}

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}

let client
let clientPromise

if (!uri) {
    throw new Error('MongoDB URI is not defined');
}

if (process.env['NODE_ENV'] === 'development') {
    // In development mode, use a global variable 
    // so that the value is preserved across module reloads 
    // caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
	console.log("***** uri: " + uri);
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
} else {
    // In production mode, it's best to 
    // not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. 
// By doing this in a separate module, 
// the client can be shared across functions.
export default clientPromise
