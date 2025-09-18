import { neon } from "@neondatabase/serverless";
import { type NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("range") || "7d";

    let dateFilter = "";
    switch (dateRange) {
      case "7d":
        dateFilter =
          "WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "30d":
        dateFilter =
          "WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "90d":
        dateFilter =
          "WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days'";
        break;
      case "1y":
        dateFilter =
          "WHERE transaction_date >= CURRENT_DATE - INTERVAL '1 year'";
        break;
    }

    // Get daily sales data
    const dailySales = await sql`
      SELECT 
        DATE(transaction_date) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as transactions,
        SUM(CASE WHEN ti.item_type = 'service' THEN ti.quantity ELSE 0 END) as services,
        SUM(CASE WHEN ti.item_type = 'product' THEN ti.quantity ELSE 0 END) as products
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      ${sql.unsafe(dateFilter)}
      GROUP BY DATE(transaction_date)
      ORDER BY date ASC
    `;

    // Get staff performance
    const staffPerformance = await sql`
      SELECT 
        s.id,
        s.name,
        s.role,
        SUM(t.total_amount) as revenue,
        COUNT(t.id) as transactions,
        SUM(CASE WHEN ti.item_type = 'service' THEN ti.quantity ELSE 0 END) as services,
        SUM(t.total_amount * s.commission_rate / 100) as commission
      FROM staff s
      LEFT JOIN transactions t ON s.id = t.staff_id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      ${sql.unsafe(
        dateFilter.replace("WHERE", "WHERE t.transaction_date IS NOT NULL AND")
      )}
      GROUP BY s.id, s.name, s.role, s.commission_rate
      ORDER BY revenue DESC
    `;

    // Get product performance
    const productPerformance = await sql`
      SELECT 
        ti.item_id as id,
        ti.item_name as name,
        ti.item_type as type,
        SUM(ti.total_price) as revenue,
        SUM(ti.quantity) as quantity,
        CASE 
          WHEN ti.item_type = 'product' THEN SUM(ti.total_price - (p.cost_price * ti.quantity))
          ELSE SUM(ti.total_price)
        END as profit
      FROM transaction_items ti
      LEFT JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN products p ON ti.item_id = p.id AND ti.item_type = 'product'
      ${sql.unsafe(
        dateFilter.replace("WHERE", "WHERE t.transaction_date IS NOT NULL AND")
      )}
      GROUP BY ti.item_id, ti.item_name, ti.item_type, p.cost_price
      ORDER BY revenue DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      data: {
        dailySales,
        staffPerformance,
        productPerformance,
      },
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
