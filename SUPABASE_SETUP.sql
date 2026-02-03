-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  monthly_income DECIMAL(10, 2) DEFAULT 0,
  frequency VARCHAR(50) DEFAULT 'MONTHLY',
  currency VARCHAR(10) DEFAULT 'USD',
  streak INTEGER DEFAULT 0,
  last_login_date TIMESTAMP,
  reminders JSONB DEFAULT '{"enabled": false, "time": "20:00", "frequency": "DAILY", "customMessage": "¡Es hora de registrar tus movimientos! No olvides tus gastos fijos 🦂"}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de movimientos (gastos)
CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  frequency VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS movements_user_id_idx ON movements(user_id);
CREATE INDEX IF NOT EXISTS movements_date_idx ON movements(date);
CREATE INDEX IF NOT EXISTS movements_category_idx ON movements(category);

-- Crear tabla de metas de ahorro (opcional)
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  deadline DATE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para goals
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON savings_goals(user_id);

-- Habilitar RLS (Row Level Security) para seguridad
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas de RLS para movements
CREATE POLICY "Los usuarios pueden ver sus propios movimientos" ON movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios movimientos" ON movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios movimientos" ON movements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios movimientos" ON movements
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para savings_goals
CREATE POLICY "Los usuarios pueden ver sus propias metas" ON savings_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias metas" ON savings_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias metas" ON savings_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias metas" ON savings_goals
  FOR DELETE USING (auth.uid() = user_id);
