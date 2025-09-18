import { neon } from "@neondatabase/serverless";

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Database types
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupRole {
  id: string;
  user_id: string;
  group_id: string;
  assigned_by?: string;
  assigned_at: string;
}

export interface MenuRole {
  id: string;
  menu_id: string;
  group_id: string;
  can_read: boolean;
  can_write: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_at: string;
}
