// create-sample-components.js
// Copy this entire file to your root directory

import { db } from './server/db.js';
import { components } from './shared/schema.js';

async function addSampleComponents() {
  const sampleComponents = [
    {
      name: 'NVIDIA GeForce RTX 4080',
      type: 'GPU',
      brand: 'NVIDIA', 
      model: 'RTX 4080',
      price: '1199.99',
      stockQuantity: 15,
      minStockLevel: 5,
      specifications: { memory: '16GB GDDR6X' },
      isActive: true
    },
    {
      name: 'Intel Core i7-13700K',
      type: 'CPU',
      brand: 'Intel',
      model: 'i7-13700K', 
      price: '429.99',
      stockQuantity: 25,
      minStockLevel: 5,
      specifications: { cores: '16', threads: '24' },
      isActive: true
    },
    {
      name: 'Corsair Vengeance 32GB DDR4',
      type: 'Memory',
      brand: 'Corsair',
      model: 'Vengeance LPX',
      price: '129.99', 
      stockQuantity: 40,
      minStockLevel: 10,
      specifications: { capacity: '32GB', speed: '3200MHz' },
      isActive: true
    },
    {
      name: 'Samsung 980 PRO 1TB SSD',
      type: 'Storage',
      brand: 'Samsung',
      model: '980 PRO',
      price: '149.99',
      stockQuantity: 30, 
      minStockLevel: 8,
      specifications: { capacity: '1TB', type: 'NVMe' },
      isActive: true
    },
    {
      name: 'ASUS ROG STRIX Z790-E',
      type: 'Motherboard', 
      brand: 'ASUS',
      model: 'ROG STRIX Z790-E',
      price: '399.99',
      stockQuantity: 12,
      minStockLevel: 5,
      specifications: { socket: 'LGA1700', chipset: 'Z790' },
      isActive: true
    }
  ];

  try {
    console.log('🔧 Adding sample components...');
    
    for (const component of sampleComponents) {
      try {
        const [created] = await db.insert(components).values({
          ...component,
          createdAt: new Date()
        }).returning();
        
        console.log(`✅ Added: ${created.name}`);
      } catch (error) {
        console.log(`⚠️  Component may already exist: ${component.name}`);
      }
    }
    
    console.log('\n🎉 Sample components added successfully!');
    console.log('\nNow you can search for:');
    console.log('- nvidia');
    console.log('- intel'); 
    console.log('- corsair');
    console.log('- gpu');
    console.log('- cpu');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

addSampleComponents();