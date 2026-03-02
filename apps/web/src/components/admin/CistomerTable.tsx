// src/components/customer-table-dummy.tsx
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

// Dummy data customer
const dummyCustomers: any[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  fullName: `Customer ${i + 1}`,
  email: `customer${i + 1}@mail.com`,
  phone: `0812-0000-00${i + 1}`,
  status: ["ACTIVE", "SUSPENDED", "BANNED", "PENDING_VERIFICATION"][i % 4],
  createdAt: new Date(2026, 1, i + 1),
}));

export function CustomerTableDummy() {
  const [customers, setCustomers] = React.useState(dummyCustomers);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof any>("fullName");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filtered = customers
    .filter((c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
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
      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by Name, Email, or Phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch("")}>Clear</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("fullName")}>Full Name</TableHead>
              <TableHead onClick={() => toggleSort("email")}>Email</TableHead>
              <TableHead onClick={() => toggleSort("phone")}>Phone</TableHead>
              <TableHead onClick={() => toggleSort("status")}>Status</TableHead>
              <TableHead onClick={() => toggleSort("createdAt")}>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.fullName}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      customer.status === "ACTIVE"
                        ? "success"
                        : customer.status === "SUSPENDED"
                        ? "secondary"
                        : customer.status === "BANNED"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>{customer.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline">View</Button>
                  {customer.status === "PENDING_VERIFICATION" && (
                    <Button size="sm" variant="success">Verify</Button>
                  )}
                  {customer.status !== "BANNED" && (
                    <Button size="sm" variant="destructive">Ban</Button>
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