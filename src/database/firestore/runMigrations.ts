import { up } from './migrations/001_initial_setup';

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migrações...');
    await up();
    console.log('✅ Migrações concluídas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao rodar migrações:', error);
  }
}

runMigrations();
