-- Stock movements tracking table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    staff_id INTEGER REFERENCES staff(id),
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);   

-- Insert some sample stock movements
INSERT INTO stock_movements (product_id, type, quantity, reason, staff_id, previous_quantity, new_quantity) VALUES
(1, 'in', 50, 'Initial stock', 1, 0, 50),
(2, 'in', 40, 'Initial stock', 1, 0, 40),
(3, 'in', 30, 'Initial stock', 1, 0, 30),
(4, 'in', 25, 'Initial stock', 1, 0, 25),
(1, 'out', 5, 'Sales transaction', 2, 50, 45),
(2, 'out', 12, 'Sales transactions', 2, 40, 28),
(3, 'out', 30, 'Sales transactions', 3, 30, 0)
ON CONFLICT DO NOTHING;
