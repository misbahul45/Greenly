// src/components/order-table-dummy.tsx
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

// Dummy data: any[] supaya gampang
const dummyOrders: any[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  orderNumber: `ORD-00${i + 1}`,
  customer: `Customer ${i + 1}`,
  totalAmount: (100 + i * 10).toFixed(2),
  status: ["PENDING", "PAID", "PROCESSING", "SHIPPED"][i % 4],
  createdAt: new Date(2026, 1, i + 1),
}));

export function OrderTableDummy() {
  const [orders, setOrders] = React.useState(dummyOrders);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof any>("orderNumber");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filtered = orders
    .filter((o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "string") {
        return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (aValue instanceof Date) {
        return sortAsc ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      if (typeof aValue === "number") {
        return sortAsc ? aValue - bValue : bValue - aValue;
      }
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
          placeholder="Search by Order or Customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch("")}>Clear</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("orderNumber")}>Order #</TableHead>
              <TableHead onClick={() => toggleSort("customer")}>Customer</TableHead>
              <TableHead onClick={() => toggleSort("totalAmount")}>Total</TableHead>
              <TableHead onClick={() => toggleSort("status")}>Status</TableHead>
              <TableHead onClick={() => toggleSort("createdAt")}>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>${order.totalAmount}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === "PAID"
                      ? "success"
                      : order.status === "PENDING"
                      ? "default"
                      : "secondary"
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="destructive" className="ml-2">Cancel</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}