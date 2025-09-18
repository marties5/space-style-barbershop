import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { sql } from "@/lib/database"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occurred", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // Create user in database
      const newUser = await sql`
        INSERT INTO users (
          clerk_id, 
          email, 
          first_name, 
          last_name, 
          avatar_url
        ) VALUES (
          ${id},
          ${email_addresses[0]?.email_address || ""},
          ${first_name || ""},
          ${last_name || ""},
          ${image_url || ""}
        )
        RETURNING *
      `

      // Assign default "User" group
      const defaultGroup = await sql`
        SELECT id FROM groups WHERE name = 'User' LIMIT 1
      `

      if (defaultGroup.length > 0) {
        await sql`
          INSERT INTO group_roles (user_id, group_id)
          VALUES (${newUser[0].id}, ${defaultGroup[0].id})
        `
      }

      console.log("User created:", newUser[0])
    } catch (error) {
      console.error("Error creating user:", error)
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      await sql`
        UPDATE users SET
          email = ${email_addresses[0]?.email_address || ""},
          first_name = ${first_name || ""},
          last_name = ${last_name || ""},
          avatar_url = ${image_url || ""},
          updated_at = CURRENT_TIMESTAMP
        WHERE clerk_id = ${id}
      `

      console.log("User updated:", id)
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    try {
      await sql`
        UPDATE users SET
          is_active = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE clerk_id = ${id}
      `

      console.log("User deactivated:", id)
    } catch (error) {
      console.error("Error deactivating user:", error)
    }
  }

  return new Response("", { status: 200 })
}
