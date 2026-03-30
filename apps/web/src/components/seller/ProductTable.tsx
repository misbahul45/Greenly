// src/components/product-table-full.tsx
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

// Dummy Data
const dummyProducts: any[] = Array.from({ length: 10 }).map((_, i) => ({
  ID: { Hex: () => `prod${i + 1}` } as any,
  Name: `Product ${i + 1}`,
  SKU: `SKU${100 + i}`,
  PriceID: { Hex: () => `price${i + 1}` } as any,
  IsActive: i % 2 === 0,
  CreatedAt: new Date(2026, 1, i + 1),
  UpdatedAt: new Date(2026, 1, i + 2),
  ShopID: {} as any,
  CategoryID: {} as any,
  InventoryID: {} as any,
  ImageIDs: [],
  DiscountIDs: [],
  EcoID: {} as any,
  Description: `Description for Product ${i + 1}`,
}));

export function ProductTableFull() {
  const [products, setProducts] = React.useState(dummyProducts);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof any>("Name");
  const [sortAsc, setSortAsc] = React.useState(true);

  // Handle search & sort
  const filtered = products
    .filter((p) =>
      p.Name.toLowerCase().includes(search.toLowerCase()) ||
      p.SKU.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = (a[sortKey] as any) ?? "";
      const bValue = (b[sortKey] as any) ?? "";
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortAsc
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortAsc
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
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
          placeholder="Search by Name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch("")}>Clear</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>dmin/dashboard
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("ID")}>ID</TableHead>
              <TableHead onClick={() => toggleSort("Name")}>Name</TableHead>
              <TableHead onClick={() => toggleSort("SKU")}>SKU</TableHead>
              <TableHead onClick={() => toggleSort("PriceID")}>Price ID</TableHead>
              <TableHead onClick={() => toggleSort("IsActive")}>Active</TableHead>
              <TableHead onClick={() => toggleSort("CreatedAt")}>Created At</TableHead>
              <TableHead onClick={() => toggleSort("UpdatedAt")}>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.ID.Hex()}>
                <TableCell>{product.ID.Hex()}</TableCell>
                <TableCell>{product.Name}</TableCell>
                <TableCell>{product.SKU}</TableCell>
                <TableCell>{product.PriceID?.Hex() || "-"}</TableCell>
                <TableCell>{product.IsActive ? "Yes" : "No"}</TableCell>
                <TableCell>{product.CreatedAt.toLocaleDateString()}</TableCell>
                <TableCell>{product.UpdatedAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="ml-2">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}