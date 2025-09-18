-- Create menus table for application navigation and features
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

-- Insert default menu items
INSERT INTO menus (name, path, icon, sort_order) VALUES 
('Dashboard', '/dashboard', 'dashboard', 1),
('Users', '/users', 'users', 2),
('Groups', '/groups', 'users-cog', 3),
('Settings', '/settings', 'settings', 4)
ON CONFLICT DO NOTHING;
