// src/components/shop-table-dummy.tsx
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

// Dummy data toko
const dummyShops: any[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: `Toko ${i + 1}`,
  owner: `Owner ${i + 1}`,
  status: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"][i % 4],
  balance: (1000 + i * 250).toFixed(2),
  createdAt: new Date(2026, 1, i + 1),
}));

export function ShopTableDummy() {
  const [shops, setShops] = React.useState(dummyShops);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof any>("name");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filtered = shops
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.owner.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "string") return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      if (typeof aValue === "number") return sortAsc ? aValue - bValue : bValue - aValue;
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
              <TableHead onClick={() => toggleSort("name")}>Shop Name</TableHead>
              <TableHead onClick={() => toggleSort("owner")}>Owner</TableHead>
              <TableHead onClick={() => toggleSort("status")}>Status</TableHead>
              <TableHead onClick={() => toggleSort("balance")}>Balance</TableHead>
              <TableHead onClick={() => toggleSort("createdAt")}>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell>{shop.name}</TableCell>
                <TableCell>{shop.owner}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      shop.status === "APPROVED"
                        ? "success"
                        : shop.status === "REJECTED"
                        ? "destructive"
                        : shop.status === "default"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {shop.status}
                  </Badge>
                </TableCell>
                <TableCell>${shop.balance}</TableCell>
                <TableCell>{shop.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline">View</Button>
                  {shop.status === "PENDING" && (
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