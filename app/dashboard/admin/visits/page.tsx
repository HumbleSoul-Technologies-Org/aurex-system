"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  AlertCircle,
  Clock,
  User,
  FileText,
} from "lucide-react";
import {
  listVisits,
  ListVisitsResponse,
  VisitRecord,
} from "@/lib/services/visits";

const visitStatusOptions = [
  "all",
  "scheduled",
  "checked_in",
  "checked_out",
  "cancelled",
  "completed",
];

export default function AdminVisitHistoryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [router, user, isLoading]);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const options: any = {
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 200,
        };
        const response: ListVisitsResponse = await listVisits(options);
        setVisits(response.data.visits || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load visit history.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Visit History
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              View all visitor records created by security guards.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search visitor, guard, property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {visitStatusOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === "all"
                      ? "All Statuses"
                      : value.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        <Card className="p-4">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="inline-block h-4 w-4 mr-2 align-text-bottom" />
              {error}
            </div>
          ) : visits.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No visit records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Guard</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                </thead>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {visit.visitorName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {visit.visitorPhone || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{visit.securityGuardName}</TableCell>
                      <TableCell>
                        {visit.propertyName || visit.hostTenantName || "—"}
                      </TableCell>
                      <TableCell>{`${visit.visitDate} ${visit.visitTime}`}</TableCell>
                      <TableCell>{visit.purpose || "—"}</TableCell>
                      <TableCell className="capitalize">
                        {visit.status.replace(/_/g, " ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
