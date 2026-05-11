const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'barberia.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema if not exists
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

db.exec(schema);

// Migration: add duracion_minutos if not exists (for existing databases)
try {
    db.exec("ALTER TABLE servicios ADD COLUMN duracion_minutos INTEGER DEFAULT 30");
} catch {
    // Column already exists, ignore
}

// Migration: add telefono column if not exists
try {
    db.exec("ALTER TABLE usuarios ADD COLUMN telefono TEXT DEFAULT ''");
} catch {
    // Column already exists, ignore
}

// Migration: add 'en_turno' to citas estado CHECK constraint
try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='citas'").get();
    if (tableInfo && !tableInfo.sql.includes('en_turno')) {
        db.exec(`
            CREATE TABLE citas_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_nombre TEXT NOT NULL,
                barbero_id INTEGER NOT NULL,
                servicio_id INTEGER NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'en_turno', 'completada', 'cancelada')),
                venta_id INTEGER,
                creado_por INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (barbero_id) REFERENCES usuarios(id),
                FOREIGN KEY (servicio_id) REFERENCES servicios(id),
                FOREIGN KEY (venta_id) REFERENCES ventas(id),
                FOREIGN KEY (creado_por) REFERENCES usuarios(id)
            );
            INSERT INTO citas_new SELECT * FROM citas;
            DROP TABLE citas;
            ALTER TABLE citas_new RENAME TO citas;
        `);
    }
} catch {
    // Migration already applied or not needed
}

// Migration: make barbero_id nullable in citas (for force-delete user support)
try {
    const colInfo = db.prepare("SELECT notnull FROM pragma_table_info('citas') WHERE name='barbero_id'").get();
    if (colInfo && colInfo.notnull === 1) {
        db.exec(`
            CREATE TABLE citas_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_nombre TEXT NOT NULL,
                barbero_id INTEGER,
                servicio_id INTEGER NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'en_turno', 'completada', 'cancelada')),
                venta_id INTEGER,
                creado_por INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (barbero_id) REFERENCES usuarios(id),
                FOREIGN KEY (servicio_id) REFERENCES servicios(id),
                FOREIGN KEY (venta_id) REFERENCES ventas(id),
                FOREIGN KEY (creado_por) REFERENCES usuarios(id)
            );
            INSERT INTO citas_new SELECT * FROM citas;
            DROP TABLE citas;
            ALTER TABLE citas_new RENAME TO citas;
        `);
    }
} catch {
    // Migration already applied or not needed
}

module.exports = db;
