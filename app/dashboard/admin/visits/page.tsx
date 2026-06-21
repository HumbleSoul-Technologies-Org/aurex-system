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
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteVisit,
  listVisits,
  ListVisitsResponse,
  updateVisit,
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

const archiveOptions = [
  { value: "all", label: "All Records" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export default function AdminVisitHistoryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("active");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [confirmDeleteVisitId, setConfirmDeleteVisitId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [router, user, isLoading]);

  const handleArchiveChange = async (visitId: string, isArchived: boolean) => {
    setError(null);
    setActionLoading(visitId);

    try {
      await updateVisit(visitId, { isArchived });
      const options: any = {
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        isArchived:
          archiveFilter === "active"
            ? false
            : archiveFilter === "archived"
              ? true
              : undefined,
        visitDate: filterDate || undefined,
        limit: 200,
      };
      const response: ListVisitsResponse = await listVisits(options);
      setVisits(response.data.visits || []);
      toast({
        title: isArchived ? "Visit archived" : "Visit restored",
        description: isArchived
          ? "The visit history record was archived successfully."
          : "The visit history record was restored successfully.",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to update archive status.");
      toast({
        title: "Error",
        description: err?.message || "Failed to update archive status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    setError(null);
    setActionLoading(visitId);

    try {
      await deleteVisit(visitId);
      const options: any = {
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        isArchived:
          archiveFilter === "active"
            ? false
            : archiveFilter === "archived"
              ? true
              : undefined,
        visitDate: filterDate || undefined,
        limit: 200,
      };
      const response: ListVisitsResponse = await listVisits(options);
      setVisits(response.data.visits || []);
      toast({
        title: "Visit deleted",
        description: "The visit record was deleted successfully.",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to delete visit record.");
      toast({
        title: "Error",
        description: err?.message || "Failed to delete visit record.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteVisitId) return;

    await handleDeleteVisit(confirmDeleteVisitId);
    setConfirmDeleteVisitId(null);
  };

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const options: any = {
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          isArchived:
            archiveFilter === "active"
              ? false
              : archiveFilter === "archived"
                ? true
                : undefined,
          visitDate: filterDate || undefined,
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
  }, [search, statusFilter, archiveFilter, filterDate]);

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
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
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
            <Select value={archiveFilter} onValueChange={setArchiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Archive filter" />
              </SelectTrigger>
              <SelectContent>
                {archiveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker((s) => !s)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {filterDate ? filterDate : "Date"}
              </Button>
              {showDatePicker && (
                <Input
                  type="date"
                  value={filterDate || ""}
                  onChange={(e) => setFilterDate(e.target.value || undefined)}
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setArchiveFilter("active");
                setFilterDate(undefined);
                setShowDatePicker(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        <Card className="p-4 w-full">
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
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full divide-y divide-border text-left text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
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
                      <TableCell className="max-w-[220px] truncate">
                        {visit.purpose || "—"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {visit.status.replace(/_/g, " ")}
                        {visit.isArchived ? " (Archived)" : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant={visit.isArchived ? "secondary" : "outline"}
                            disabled={actionLoading === visit.id}
                            onClick={() =>
                              handleArchiveChange(visit.id, !visit.isArchived)
                            }
                          >
                            {actionLoading === visit.id ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </span>
                            ) : visit.isArchived ? (
                              "Unarchive"
                            ) : (
                              "Archive"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === visit.id}
                            onClick={() => setConfirmDeleteVisitId(visit.id)}
                          >
                            {actionLoading === visit.id ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                              </span>
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
      <AlertDialog
        open={Boolean(confirmDeleteVisitId)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDeleteVisitId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Visit Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this visit history record? This
            action cannot be undone.
          </AlertDialogDescription>

          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={actionLoading === confirmDeleteVisitId}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === confirmDeleteVisitId
                ? "Deleting..."
                : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
