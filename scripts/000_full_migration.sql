-- Full database migration for SaaS Auth System
-- Run this script to create all tables and functions at once

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    path VARCHAR(255),
    icon VARCHAR(50),
    parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create group_roles table (many-to-many between users and groups)
CREATE TABLE IF NOT EXISTS group_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);

-- Create menu_roles table (many-to-many between groups and menus)
CREATE TABLE IF NOT EXISTS menu_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT true,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, menu_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_group_roles_user_id ON group_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_group_roles_group_id ON group_roles(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_roles_group_id ON menu_roles(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_roles_menu_id ON menu_roles(menu_id);
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO groups (name, description) VALUES 
    ('superadmin', 'System administrators with full access'),
('manager', 'Department managers with limited admin access'),
('partner', 'Regular users with basic access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO menus (name, path, icon, sort_order) VALUES 
    ('Dashboard', '/dashboard', 'LayoutDashboard', 1),
    ('Users', '/dashboard/users', 'Users', 2),
    ('Groups', '/dashboard/groups', 'Shield', 3),
    ('Menus', '/dashboard/menus', 'Menu', 4),
    ('Profile', '/profile', 'User', 5)
ON CONFLICT DO NOTHING;

-- Grant admin group access to all menus
INSERT INTO menu_roles (group_id, menu_id, can_read, can_write, can_delete)
SELECT g.id, m.id, true, true, true
FROM groups g, menus m
WHERE g.name = 'superadmin'
ON CONFLICT (group_id, menu_id) DO NOTHING;

-- Grant user group read access to dashboard and profile
INSERT INTO menu_roles (group_id, menu_id, can_read, can_write, can_delete)
SELECT g.id, m.id, true, false, false
FROM groups g, menus m
WHERE g.name = 'partner' AND m.name IN ('Dashboard', 'Profile')
ON CONFLICT (group_id, menu_id) DO NOTHING;
