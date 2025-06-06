// create-demo-users.js
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import bcrypt from 'bcrypt';

async function createDemoUsers() {
  try {
    // Create demo users
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedDemo = await bcrypt.hash('password123', 10);
    
    const demoUsers = [
      {
        email: 'admin@ultrapc.com',
        password: hashedAdmin,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      },
      {
        email: 'demo@example.com',
        password: hashedDemo,
        firstName: 'Demo',
        lastName: 'User',
        role: 'receptionist'
      }
    ];
    
    for (const user of demoUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }
    
    console.log('✅ Demo users created!');
    console.log('👤 Admin: admin@ultrapc.com / admin123');
    console.log('👤 Demo: demo@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

createDemoUsers();