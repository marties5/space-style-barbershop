    import { type NextRequest, NextResponse } from "next/server";
    import { neon } from "@neondatabase/serverless";

    const sql = neon(process.env.DATABASE_URL!);

    export async function GET(request: NextRequest) {
      try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const status = searchParams.get("status"); // all, low-stock, out-of-stock

        let whereClause = "WHERE is_active = true";
        const params: any[] = [];

        if (search) {
          whereClause += ` AND name ILIKE $${params.length + 1}`;
          params.push(`%${search}%`);
        }

        if (status === "low-stock") {
          whereClause +=
            " AND stock_quantity <= min_stock_level AND stock_quantity > 0";
        } else if (status === "out-of-stock") {
          whereClause += " AND stock_quantity = 0";
        }

        const products = await sql`
      SELECT * FROM products 
      ${sql.unsafe(whereClause)}
      ORDER BY name ASC
    `;

        return NextResponse.json({
          success: true,
          products,
        });
      } catch (error) {
        console.error("Get products error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch products" },
          { status: 500 }
        );
      }
    }

    export async function POST(request: NextRequest) {
      try {
        const body = await request.json();
        const {
          name,
          price,
          costPrice,
          stockQuantity,
          minStockLevel,
          imageUrl,
        } = body;

        const [product] = await sql`
      INSERT INTO products (name, price, cost_price, stock_quantity, min_stock_level, image_url)
      VALUES (${name}, ${price}, ${costPrice}, ${stockQuantity}, ${minStockLevel}, ${imageUrl})
      RETURNING *
    `;

        return NextResponse.json({
          success: true,
          product,
          message: "Product created successfully",
        });
      } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to create product" },
          { status: 500 }
        );
      }
    }
