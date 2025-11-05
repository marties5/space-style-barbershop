import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllGroups } from "./actions";
import CreateGroupForm from "./components/createGroupForm";
import { DeleteGroupButton } from "./components/deleteButton";
import { GroupActions } from "./components/groupActions";

export default async function GroupsPage() {
  const groups = await getAllGroups();

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>Groups</CardTitle>
        <CreateGroupForm />
      </CardHeader>

      <CardContent>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b">
                <td className="p-2">{g.name}</td>
                <td className="p-2">{g.description || "-"}</td>
                <td className="p-2">
                  <GroupActions group={g} />
                  <DeleteGroupButton groupId={g.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
