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

// Dummy data pesanan
const dummyOrders: any[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  orderNumber: `ORD-00${i + 1}`,
  customerName: `Customer ${i + 1}`,
  shopName: `Toko ${i % 5 + 1}`,
  totalAmount: (100 + i * 25).toFixed(2),
  status: ["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED"][i % 5],
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
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.shopName.toLowerCase().includes(search.toLowerCase())
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
      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by Order, Customer, or Shop"
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
              <TableHead onClick={() => toggleSort("orderNumber")}>Order #</TableHead>
              <TableHead onClick={() => toggleSort("customerName")}>Customer</TableHead>
              <TableHead onClick={() => toggleSort("shopName")}>Shop</TableHead>
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
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.shopName}</TableCell>
                <TableCell>${order.totalAmount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "PAID" || order.status === "COMPLETED"
                        ? "success"
                        : order.status === "PENDING"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline">View</Button>
                  {order.status === "PENDING" && (
                    <Button size="sm" variant="success">Mark Paid</Button>
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