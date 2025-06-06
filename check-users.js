// check-users.js - Copy this entire content
import { db } from './server/db.js';
import { users } from './shared/schema.js';

async function checkUsers() {
  try {
    console.log('🔍 Checking database...');
    
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Found ${allUsers.length} users in database:`);
    
    allUsers.forEach(user => {
      console.log(`👤 ${user.email} (${user.role})`);
    });
    
    if (allUsers.length === 0) {
      console.log('❌ No users found! Need to create demo users.');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
  
  process.exit(0);
}

checkUsers();