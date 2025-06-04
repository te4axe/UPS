import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';

async function createDemoUsers() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  const users = [
    { email: 'admin@ultrapc.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
    { email: 'assembly@ultrapc.com', password: 'assembly123', firstName: 'Assembly', lastName: 'Worker', role: 'assembly' },
    { email: 'receptionist@ultrapc.com', password: 'receptionist123', firstName: 'Reception', lastName: 'Staff', role: 'receptionist' },
    { email: 'components@ultrapc.com', password: 'components123', firstName: 'Component', lastName: 'Manager', role: 'components' },
    { email: 'packaging@ultrapc.com', password: 'packaging123', firstName: 'Packaging', lastName: 'Worker', role: 'packaging' },
    { email: 'shipping@ultrapc.com', password: 'shipping123', firstName: 'Shipping', lastName: 'Clerk', role: 'shipping' }
  ];

  try {
    // Clear existing users
    await pool.query('DELETE FROM users');
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await pool.query(
        'INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.email, hashedPassword, user.firstName, user.lastName, user.role, true]
      );
      
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('All demo users created successfully!');
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await pool.end();
  }
}

createDemoUsers();