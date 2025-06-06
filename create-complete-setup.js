import bcrypt from 'bcrypt';
import { db } from './server/db.ts';
import { users, components } from './shared/schema.ts';

async function createCompleteSetup() {
  try {
    console.log('🚀 Création des comptes utilisateurs...');
    
    // Comptes utilisateurs avec mots de passe hachés
    const userAccounts = [
      { email: 'admin@ultrapc.com', password: 'admin123', firstName: 'Administrateur', lastName: 'Principal', role: 'admin' },
      { email: 'montage@ultrapc.com', password: 'montage123', firstName: 'Employé', lastName: 'Montage', role: 'assembly' },
      { email: 'reception@ultrapc.com', password: 'reception123', firstName: 'Employé', lastName: 'Réception', role: 'receptionist' },
      { email: 'composants@ultrapc.com', password: 'composants123', firstName: 'Responsable', lastName: 'Composants', role: 'components' },
      { email: 'emballage@ultrapc.com', password: 'emballage123', firstName: 'Employé', lastName: 'Emballage', role: 'packaging' },
      { email: 'expedition@ultrapc.com', password: 'expedition123', firstName: 'Employé', lastName: 'Expédition', role: 'shipping' }
    ];

    // Supprimer les anciens utilisateurs
    await db.delete(users);

    // Créer les nouveaux comptes
    for (const account of userAccounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10);
      await db.insert(users).values({
        email: account.email,
        password: hashedPassword,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        isActive: true
      });
      console.log(`✅ Compte créé: ${account.email}`);
    }

    console.log('🖥️ Ajout des 30 composants PC gamer...');
    
    // Supprimer les anciens composants
    await db.delete(components);

    // 30 composants PC gamer avec emplacements
    const pcComponents = [
      // Processeurs (6)
      { name: 'AMD Ryzen 9 7950X', type: 'processeur', brand: 'AMD', model: '7950X', price: '699.99', stockQuantity: 15, location: 'Étagère A1', reference: 'CPU-AMD-001', section: 'Processeurs' },
      { name: 'Intel Core i9-13900K', type: 'processeur', brand: 'Intel', model: 'i9-13900K', price: '589.99', stockQuantity: 12, location: 'Étagère A1', reference: 'CPU-INT-001', section: 'Processeurs' },
      { name: 'AMD Ryzen 7 7800X3D', type: 'processeur', brand: 'AMD', model: '7800X3D', price: '449.99', stockQuantity: 8, location: 'Étagère A2', reference: 'CPU-AMD-002', section: 'Processeurs' },
      { name: 'Intel Core i7-13700K', type: 'processeur', brand: 'Intel', model: 'i7-13700K', price: '409.99', stockQuantity: 20, location: 'Étagère A2', reference: 'CPU-INT-002', section: 'Processeurs' },
      { name: 'AMD Ryzen 5 7600X', type: 'processeur', brand: 'AMD', model: '7600X', price: '299.99', stockQuantity: 25, location: 'Étagère A3', reference: 'CPU-AMD-003', section: 'Processeurs' },
      { name: 'Intel Core i5-13600K', type: 'processeur', brand: 'Intel', model: 'i5-13600K', price: '319.99', stockQuantity: 18, location: 'Étagère A3', reference: 'CPU-INT-003', section: 'Processeurs' },
      
      // Cartes graphiques (8)
      { name: 'NVIDIA RTX 4090', type: 'carte_graphique', brand: 'NVIDIA', model: 'RTX 4090', price: '1599.99', stockQuantity: 5, location: 'Armoire B1', reference: 'GPU-NV-001', section: 'Cartes Graphiques' },
      { name: 'NVIDIA RTX 4080', type: 'carte_graphique', brand: 'NVIDIA', model: 'RTX 4080', price: '1199.99', stockQuantity: 8, location: 'Armoire B1', reference: 'GPU-NV-002', section: 'Cartes Graphiques' },
      { name: 'AMD RX 7900 XTX', type: 'carte_graphique', brand: 'AMD', model: 'RX 7900 XTX', price: '999.99', stockQuantity: 6, location: 'Armoire B2', reference: 'GPU-AMD-001', section: 'Cartes Graphiques' },
      { name: 'NVIDIA RTX 4070 Ti', type: 'carte_graphique', brand: 'NVIDIA', model: 'RTX 4070 Ti', price: '799.99', stockQuantity: 12, location: 'Armoire B2', reference: 'GPU-NV-003', section: 'Cartes Graphiques' },
      { name: 'AMD RX 7800 XT', type: 'carte_graphique', brand: 'AMD', model: 'RX 7800 XT', price: '549.99', stockQuantity: 10, location: 'Armoire B3', reference: 'GPU-AMD-002', section: 'Cartes Graphiques' },
      { name: 'NVIDIA RTX 4060 Ti', type: 'carte_graphique', brand: 'NVIDIA', model: 'RTX 4060 Ti', price: '399.99', stockQuantity: 15, location: 'Armoire B3', reference: 'GPU-NV-004', section: 'Cartes Graphiques' },
      { name: 'AMD RX 7600', type: 'carte_graphique', brand: 'AMD', model: 'RX 7600', price: '269.99', stockQuantity: 22, location: 'Armoire B4', reference: 'GPU-AMD-003', section: 'Cartes Graphiques' },
      { name: 'NVIDIA RTX 4060', type: 'carte_graphique', brand: 'NVIDIA', model: 'RTX 4060', price: '299.99', stockQuantity: 18, location: 'Armoire B4', reference: 'GPU-NV-005', section: 'Cartes Graphiques' },
      
      // Mémoire RAM (5)
      { name: 'Corsair Vengeance DDR5-5600 32GB', type: 'memoire', brand: 'Corsair', model: 'Vengeance DDR5', price: '159.99', stockQuantity: 30, location: 'Tiroir C1', reference: 'RAM-COR-001', section: 'Mémoire' },
      { name: 'G.Skill Trident Z5 DDR5-6000 32GB', type: 'memoire', brand: 'G.Skill', model: 'Trident Z5', price: '179.99', stockQuantity: 25, location: 'Tiroir C1', reference: 'RAM-GSK-001', section: 'Mémoire' },
      { name: 'Kingston Fury Beast DDR5-5200 32GB', type: 'memoire', brand: 'Kingston', model: 'Fury Beast', price: '139.99', stockQuantity: 35, location: 'Tiroir C2', reference: 'RAM-KIN-001', section: 'Mémoire' },
      { name: 'Corsair Vengeance DDR4-3200 32GB', type: 'memoire', brand: 'Corsair', model: 'Vengeance DDR4', price: '99.99', stockQuantity: 40, location: 'Tiroir C2', reference: 'RAM-COR-002', section: 'Mémoire' },
      { name: 'G.Skill Ripjaws V DDR4-3600 32GB', type: 'memoire', brand: 'G.Skill', model: 'Ripjaws V', price: '109.99', stockQuantity: 28, location: 'Tiroir C3', reference: 'RAM-GSK-002', section: 'Mémoire' },
      
      // Stockage (6)
      { name: 'Samsung 980 PRO 2TB NVMe', type: 'stockage', brand: 'Samsung', model: '980 PRO', price: '199.99', stockQuantity: 20, location: 'Casier D1', reference: 'SSD-SAM-001', section: 'Stockage' },
      { name: 'WD Black SN850X 1TB NVMe', type: 'stockage', brand: 'Western Digital', model: 'SN850X', price: '129.99', stockQuantity: 25, location: 'Casier D1', reference: 'SSD-WD-001', section: 'Stockage' },
      { name: 'Crucial P5 Plus 1TB NVMe', type: 'stockage', brand: 'Crucial', model: 'P5 Plus', price: '89.99', stockQuantity: 30, location: 'Casier D2', reference: 'SSD-CRU-001', section: 'Stockage' },
      { name: 'Seagate FireCuda 2TB HDD', type: 'stockage', brand: 'Seagate', model: 'FireCuda', price: '79.99', stockQuantity: 15, location: 'Casier D3', reference: 'HDD-SEA-001', section: 'Stockage' },
      { name: 'WD Blue 1TB HDD', type: 'stockage', brand: 'Western Digital', model: 'Blue', price: '49.99', stockQuantity: 35, location: 'Casier D3', reference: 'HDD-WD-001', section: 'Stockage' },
      { name: 'Samsung 970 EVO Plus 500GB', type: 'stockage', brand: 'Samsung', model: '970 EVO Plus', price: '69.99', stockQuantity: 40, location: 'Casier D2', reference: 'SSD-SAM-002', section: 'Stockage' },
      
      // Cartes mères (3)
      { name: 'ASUS ROG Strix X670E-E', type: 'carte_mere', brand: 'ASUS', model: 'ROG Strix X670E-E', price: '499.99', stockQuantity: 8, location: 'Étagère E1', reference: 'MB-ASU-001', section: 'Cartes Mères' },
      { name: 'MSI MAG B650 Tomahawk', type: 'carte_mere', brand: 'MSI', model: 'MAG B650 Tomahawk', price: '199.99', stockQuantity: 12, location: 'Étagère E2', reference: 'MB-MSI-001', section: 'Cartes Mères' },
      { name: 'Gigabyte Z790 AORUS Elite', type: 'carte_mere', brand: 'Gigabyte', model: 'Z790 AORUS Elite', price: '299.99', stockQuantity: 10, location: 'Étagère E2', reference: 'MB-GIG-001', section: 'Cartes Mères' },
      
      // Alimentations (2)
      { name: 'Corsair RM850x 850W 80+ Gold', type: 'alimentation', brand: 'Corsair', model: 'RM850x', price: '149.99', stockQuantity: 15, location: 'Étagère F1', reference: 'PSU-COR-001', section: 'Alimentations' },
      { name: 'Seasonic Focus GX-750 750W 80+ Gold', type: 'alimentation', brand: 'Seasonic', model: 'Focus GX-750', price: '119.99', stockQuantity: 18, location: 'Étagère F1', reference: 'PSU-SEA-001', section: 'Alimentations' }
    ];

    // Insérer tous les composants
    for (const component of pcComponents) {
      await db.insert(components).values({
        name: component.name,
        type: component.type,
        brand: component.brand,
        model: component.model,
        price: component.price,
        stockQuantity: component.stockQuantity,
        location: component.location,
        reference: component.reference,
        section: component.section,
        specifications: {},
        minStockLevel: 5,
        isActive: true
      });
    }

    console.log('✅ Setup complet terminé !');
    console.log('📊 Comptes créés: 6 utilisateurs');
    console.log('🔧 Composants ajoutés: 30 composants PC gamer');
    console.log('\n🔑 Comptes de connexion:');
    userAccounts.forEach(account => {
      console.log(`   ${account.email} / ${account.password} (${account.role})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createCompleteSetup();