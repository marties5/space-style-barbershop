-- Create groups table for user groups/departments
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default groups
INSERT INTO groups (name, description) VALUES 
('superadmin', 'System administrators with full access'),
('manager', 'Department managers with limited admin access'),
('partner', 'Regular users with basic access')
ON CONFLICT (name) DO NOTHING;
