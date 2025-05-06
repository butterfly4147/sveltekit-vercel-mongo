const dns = require('dns');

// 测试DNS解析
const hostname = 'cluster0.anojpma.mongodb.net';
console.log(`正在测试主机名 ${hostname} 的DNS解析...`);

// 首先测试A记录
dns.resolve4(hostname, (err, addresses) => {
  if (err) {
    console.error('无法解析A记录:', err);
  } else {
    console.log('A记录解析结果:', addresses);
  }
  
  // 测试SRV记录 (MongoDB使用SRV记录)
  dns.resolveSrv(`_mongodb._tcp.${hostname}`, (srvErr, srvAddresses) => {
    if (srvErr) {
      console.error('无法解析SRV记录:', srvErr);
    } else {
      console.log('SRV记录解析结果:', srvAddresses);
    }
    
    // 也尝试使用lookup (结合本地hosts文件)
    dns.lookup(hostname, (lookupErr, address, family) => {
      if (lookupErr) {
        console.error('DNS lookup失败:', lookupErr);
      } else {
        console.log('DNS lookup结果:', address, 'IP版本:', family);
      }
      
      console.log('DNS测试完成');
    });
  });
});
