// src/components/category-table-dummy.tsx
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

// Dummy data kategori
const dummyCategories: any[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: `Kategori ${i + 1}`,
  slug: `kategori-${i + 1}`,
  parent: i % 2 === 0 ? `Parent ${i + 1}` : null,
  createdAt: new Date(2026, 1, i + 1),
}));

export function CategoryTableDummy() {
  const [categories, setCategories] = React.useState(dummyCategories);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof any>("name");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filtered = categories
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.parent?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )
    .sort((a, b) => {
      const aValue = a[sortKey] ?? "";
      const bValue = b[sortKey] ?? "";
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
          placeholder="Search by Name or Parent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch("")}>Clear</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("name")}>Name</TableHead>
              <TableHead onClick={() => toggleSort("slug")}>Slug</TableHead>
              <TableHead onClick={() => toggleSort("parent")}>Parent</TableHead>
              <TableHead onClick={() => toggleSort("createdAt")}>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>{cat.parent ?? "-"}</TableCell>
                <TableCell>{cat.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="destructive">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}