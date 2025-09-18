import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, quantity, reason, staffId } = body;

    // Get current product info
    const [product] = await sql`
      SELECT * FROM products WHERE id = ${productId}
    `;

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    let newQuantity = product.stock_quantity;

    if (type === "in" || type === "adjustment") {
      newQuantity += quantity;
    } else if (type === "out") {
      newQuantity = Math.max(0, newQuantity - quantity);
    }

    // Update product stock
    await sql`
      UPDATE products 
      SET stock_quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
    `;

    // Record stock movement (you'll need to create this table)
    await sql`
      INSERT INTO stock_movements (product_id, type, quantity, reason, staff_id, previous_quantity, new_quantity)
      VALUES (${productId}, ${type}, ${quantity}, ${reason}, ${staffId}, ${product.stock_quantity}, ${newQuantity})
    `;

    return NextResponse.json({
      success: true,
      message: "Stock adjustment completed successfully",
      previousQuantity: product.stock_quantity,
      newQuantity,
    });
  } catch (error) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to adjust stock" },
      { status: 500 }
    );
  }
}
