const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'storage_booking',
  username: process.env.DB_USER || 'storage_user',
  password: process.env.DB_PASSWORD || 'storage123',
  dialect: 'postgres',
  logging: console.log
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test creating a simple table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50)
      );
    `);
    console.log('✅ Table creation test successful.');
    
    // Clean up test table
    await sequelize.query('DROP TABLE IF EXISTS test_table;');
    console.log('✅ Table cleanup successful.');
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();