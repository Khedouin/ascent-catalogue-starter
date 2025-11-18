import http from 'http';
import url from 'url';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT_LISTEN } from '../config/network.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = PORT_LISTEN || 4200;
const FORMATIONS_FILE = path.join(__dirname, '../data/formations.json');

async function loadFormations() {
  try {
    const data = await fs.readFile(FORMATIONS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Bug subtil : pas de validation du schéma JSON
    // Problème : si le JSON est malformé ou invalide, on retourne quand même des données
    if (!Array.isArray(parsed)) {
      console.warn('Le fichier formations.json ne contient pas un tableau');
      return [];
    }
    return parsed;
  } catch (error) {
    // Bug : en cas d'erreur, on retourne un tableau vide sans loguer l'erreur complète
    console.error('Erreur lors du chargement des formations:', error);
    return [];
  }
}

function searchFormations(formations, keyword) {
  if (!keyword) {
    return formations;
  }
  
  const lowerKeyword = keyword.toLowerCase();
  // Bug subtil : recherche dans titre ET description mais pas documenté
  // Problème de performance : pas de limite de résultats
  return formations.filter(formation => 
    (formation.titre && formation.titre.toLowerCase().includes(lowerKeyword)) ||
    (formation.description && formation.description.toLowerCase().includes(lowerKeyword))
  );
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Bug de sécurité : CORS trop permissif (allow-origin: *)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Bug : pas de headers de sécurité (X-Content-Type-Options, etc.)

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && pathname === '/formations/search') {
    try {
      const formations = await loadFormations();
      const keyword = query.keyword || '';
      // Bug de sécurité : pas de validation/sanitization de l'input
      // Problème : injection possible via keyword
      const results = searchFormations(formations, keyword);
      
      // Bug de performance : charge le fichier à chaque requête (pas de cache)
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: results.length,
        data: results
      }));
    } catch (error) {
      // Bug de sécurité : exposition d'informations sensibles dans les erreurs
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la recherche',
        details: error.message // Ne devrait pas être exposé en production
      }));
    }
    return;
  }

  if (req.method === 'GET' && pathname === '/formations') {
    try {
      const formations = await loadFormations();
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: formations.length,
        data: formations
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors du chargement des formations'
      }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: 'Route non trouvée'
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   GET /formations - Liste toutes les formations`);
  console.log(`   GET /formations/search?keyword=XXX - Recherche par mot-clé`);
});

server.on('error', (error) => {
  console.error('❌ Erreur du serveur:', error);
  process.exit(1);
});

