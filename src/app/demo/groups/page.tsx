import { Users } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Card, CardSubtitle, CardTitle } from "../../../components/ui/card";
import { demoGroups } from "../../../lib/demo/data";

export default function DemoGroupsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Groups</h1>

      <ul className="space-y-3">
        {demoGroups.map((group, index) => (
          <li key={group.id}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{group.name}</CardTitle>
                  <CardSubtitle className="line-clamp-2">
                    {group.description}
                  </CardSubtitle>
                </div>
                <Badge tone={group.role === "OWNER" ? "success" : "neutral"}>
                  {group.role.toLowerCase()}
                </Badge>
              </div>
              {index === 0 ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <Users className="size-4" aria-hidden />
                  Active
                </p>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
