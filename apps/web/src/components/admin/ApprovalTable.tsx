// src/components/approval-table-dummy.tsx
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";

// Dummy data: Approval Toko
const dummyApprovals: any[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  shopName: `Toko ${i + 1}`,
  ownerName: `Owner ${i + 1}`,
  submittedAt: new Date(2026, 1, i + 1),
  status: ["PENDING", "APPROVED", "REJECTED"][i % 3],
}));

export function ApprovalTableDummy() {
  const [approvals, setApprovals] = React.useState(dummyApprovals);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof any>("shopName");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filtered = approvals
    .filter((a) =>
      a.shopName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "string") return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      if (aValue instanceof Date) return sortAsc ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      return 0;
    });

  const toggleSort = (key: keyof any) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by Shop or Owner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch("")}>Clear</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("shopName")}>Shop Name</TableHead>
              <TableHead onClick={() => toggleSort("ownerName")}>Owner</TableHead>
              <TableHead onClick={() => toggleSort("submittedAt")}>Submitted At</TableHead>
              <TableHead onClick={() => toggleSort("status")}>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>{approval.shopName}</TableCell>
                <TableCell>{approval.ownerName}</TableCell>
                <TableCell>{approval.submittedAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      approval.status === "APPROVED"
                        ? "success"
                        : approval.status === "REJECTED"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {approval.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline">View</Button>
                  {approval.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="success">Approve</Button>
                      <Button size="sm" variant="destructive">Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}