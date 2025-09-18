-- Create menu_roles table to control menu access by groups
CREATE TABLE IF NOT EXISTS menu_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT true,
    can_write BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(menu_id, group_id)
);

-- Insert default permissions
INSERT INTO menu_roles (menu_id, group_id, can_read, can_write, can_update, can_delete)
SELECT m.id, g.id, 
    CASE WHEN g.name = 'superadmin' THEN true ELSE true END,
    CASE WHEN g.name = 'superadmin' THEN true ELSE false END,
    CASE WHEN g.name = 'superadmin' THEN true WHEN g.name = 'manager' THEN true ELSE false END,
    CASE WHEN g.name = 'superadmin' THEN true ELSE false END
FROM menus m, groups g
ON CONFLICT (menu_id, group_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_roles_menu_id ON menu_roles(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_roles_group_id ON menu_roles(group_id);
