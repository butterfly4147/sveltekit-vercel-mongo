import clientPromise from '../lib/mongo';

// 模拟数据，当MongoDB连接失败时使用
const mockApothegms = [
  { apothegm: "生活就像一盒巧克力，你永远不知道会得到什么。", author: "阿甘正传" },
  { apothegm: "要么忙于生存，要么赶着去死。", author: "肖申克的救赎" },
  { apothegm: "希望是好事，也许是最好的事，好事不会消亡。", author: "肖申克的救赎" }
];

// 使用内存中的数组存储用户添加的数据（当数据库不可用时）
let inMemoryApothegms = [...mockApothegms];

export async function post ({request}) {
  console.log("处理POST请求");
  try {
    let apo = await request.json();
    console.log("收到的数据:", apo);
    
    try {
      const dbConnection = await clientPromise;
      const db = dbConnection.db("apothegm");
      const collection = db.collection('apothegm');
      const dbApo = await collection.insertOne(apo);
      console.log("数据已存入MongoDB");
      return { status: 200, body: { dbApo } };
    } catch (dbError) {
      console.error("无法存入MongoDB，使用内存存储:", dbError);
      // 如果MongoDB连接失败，将数据存储在内存中
      inMemoryApothegms.push(apo);
      return { 
        status: 200, 
        headers: { 'content-type': 'application/json' },
        body: { success: true, message: "数据已存入内存" } 
      };
    }
  } catch (error) {
    console.error("处理POST请求出错:", error);
    return { 
      status: 400, 
      headers: { 'content-type': 'application/json' },
      body: { error: error.message } 
    };
  }
}

export async function get ({request}) {
  console.warn("处理GET请求");
  try {
    console.warn("尝试连接MongoDB...");
    const dbConnection = await clientPromise;
    console.warn("MongoDB连接成功");
    const db = dbConnection.db("apothegm");
    const collection = db.collection("apothegm");
    let apos = await collection.find({}).toArray();
    console.warn("从MongoDB获取到" + apos.length + "条数据");

    return { 
      status: 200, 
      headers: { 'content-type': 'application/json' },
      body: { apos: apos && apos.length > 0 ? apos : mockApothegms } 
    };
  } catch (error) {
    console.error("MongoDB连接错误:", error);
    // 当MongoDB连接失败时，返回内存中的数据
    return { 
      status: 200, 
      headers: { 'content-type': 'application/json' },
      body: { apos: inMemoryApothegms, usingMockData: true } 
    };
  }
}
