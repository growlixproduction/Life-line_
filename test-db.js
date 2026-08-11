import mysql from 'mysql2/promise';

async function testRemoteHostingerDB() {
  const hostsToTest = ['olive-fly-576617.hostingersite.com', 'lightgray-butterfly-523930.hostingersite.com', 'sql.hostinger.com', '109.106.255.45'];

  for (const host of hostsToTest) {
    try {
      console.log(`🔍 Testing Hostinger Remote MySQL Connection to: ${host}...`);
      const connection = await mysql.createConnection({
        host: host,
        user: 'u239297722_lifeline2026',
        password: 'LifeLine@2026',
        database: 'u239297722_lifeline2026',
        port: 3306,
        connectTimeout: 5000
      });
      console.log(`✅ SUCCESS! Connected to Hostinger MySQL Database remotely via ${host}!`);
      const [rows] = await connection.query('SHOW TABLES;');
      console.log('📋 Database Tables:', rows);
      await connection.end();
      return true;
    } catch (err) {
      console.log(`❌ ${host} connection notice:`, err.message);
    }
  }
}

testRemoteHostingerDB();
