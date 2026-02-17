import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testUploadBase64() {
  console.log('🧪 Test d\'upload avec Base64...\n');

  const imagePath = path.join(__dirname, 'test-image.jpg');
  
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️  Fichier test-image.jpg non trouvé');
    console.log('   Créez une image de test nommée "test-image.jpg" dans le dossier scripts/\n');
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  try {
    const response = await fetch(`${API_URL}/api/upload/photo/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Erreur:', error.message);
      return;
    }

    const result = await response.json();
    console.log('✅ Upload réussi!');
    console.log('   URL:', result.url);
    console.log('   Public ID:', result.publicId);
    console.log('\n📸 Image accessible à:', result.url);
    
    return result.publicId;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error.message);
  }
}

async function testDeletePhoto(publicId) {
  console.log('\n🧪 Test de suppression...\n');

  try {
    const response = await fetch(`${API_URL}/api/upload/photo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Erreur:', error.message);
      return;
    }

    const result = await response.json();
    console.log('✅ Suppression réussie!');
    console.log('   Message:', result.message);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('  TEST D\'UPLOAD CLOUDINARY');
  console.log('='.repeat(60));
  console.log('\n');

  const publicId = await testUploadBase64();

  if (publicId) {
    console.log('\n⏳ Attente de 3 secondes avant la suppression...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await testDeletePhoto(publicId);
  }

  console.log('\n' + '='.repeat(60));
  console.log('  FIN DES TESTS');
  console.log('='.repeat(60));
}

runTests();
