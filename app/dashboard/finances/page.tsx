"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppData } from "@/lib/data-context";
import {
  deleteTransaction,
  updateTransaction,
} from "@/app/lib/transactions-client";
import { updateExpenseApi, deleteExpenseApi } from "@/lib/services/expenses";
import { deletePaymentApi } from "@/lib/services/payments";
import { formatCurrency } from "@/lib/currency";
import { useActiveCurrency } from "@/lib/hooks/use-active-currency";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import {
  Plus,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  Printer,
  Share2,
} from "lucide-react";
import {
  AdminSkeletonHeader,
  AdminTableSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AddExpenseForm from "@/components/forms/add-expense-form";
import RecordPaymentModal from "@/components/modals/record-payment-modal";

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState("rent-collection");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    | "complete"
    | "balance"
    | "pending"
    | "failed"
    | "refunded"
    | "recorded"
    | "confirmed"
  >("complete");
  const {
    tenants: allTenants,
    properties: allProperties,
    payments,
    expenses,
    isLoading,
    isFetching,
    refetchAll,
    paymentsError,
    expensesError,
  } = useAppData();

  const [transactions, setTransactions] = useState<any[]>([]);
  const activeCurrency = useActiveCurrency();

  useEffect(() => {
    setTransactions(expenses);
  }, [expenses]);

  useEffect(() => {
    const refreshHandler = () => {
      refetchAll();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("transactionsUpdated", refreshHandler);
      window.addEventListener("paymentsUpdated", refreshHandler);
      window.addEventListener("expensesUpdated", refreshHandler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("transactionsUpdated", refreshHandler);
        window.removeEventListener("paymentsUpdated", refreshHandler);
        window.removeEventListener("expensesUpdated", refreshHandler);
      }
    };
  }, [refetchAll]);

  // Enrich transactions with tenant and property data from real lists
  const enrichedTransactions = (transactions || []).map((transaction) => {
    const tenant = allTenants.find((t) => t.id === transaction.tenantId);
    const property = allProperties.find((p) => p.id === transaction.propertyId);
    return {
      ...transaction,
      tenantName: tenant?.name || "Unknown Tenant",
      propertyName: property?.name || "Unknown Property",
    };
  });

  // Calculate financial metrics from persisted payments
  const enrichedPayments = (payments || []).map((p) => {
    const tenant = allTenants.find((t) => t.id === p.tenantId);
    const property = allProperties.find((pr) => pr.id === p.propertyId);
    return {
      ...p,
      tenantName: tenant?.name || "Unknown Tenant",
      propertyName: property?.name || "Unknown Property",
    };
  });

  const rentPayments = enrichedPayments;
  const completedPayments = rentPayments.filter(
    (t) =>
      t.status === "complete" ||
      t.status === "completed" ||
      t.status === "paid",
  );
  // only count pending payments for tenants whose status is 'due'
  const dueTenantIds = allTenants
    .filter((t) => t.status === "due")
    .map((t) => t.id);
  const pendingPayments = rentPayments.filter((t) => {
    const status = String(t.status || "").toLowerCase();
    return (
      (status === "pending" || status === "balance" || status === "") &&
      t.tenantId &&
      dueTenantIds.includes(t.tenantId)
    );
  });

  const partialPayments = rentPayments.filter(
    (t) => String(t.status || "").toLowerCase() === "balance",
  );
  const totalRevenue = rentPayments
    .filter((t) => {
      const status = String(t.status || "").toLowerCase();
      return ["complete", "completed", "paid", "balance"].includes(status);
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const expectedOutstanding = partialPayments.reduce(
    (sum, t) => sum + (t.balance || 0),
    0,
  );
  const totalPending = pendingPayments.reduce((sum, t) => {
    if (String(t.status || "").toLowerCase() === "balance") {
      return sum + Number(t.balance || 0);
    }
    return sum + Number(t.amount || 0);
  }, 0);
  const totalExpenses = enrichedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const netLabel = netProfit >= 0 ? "Net Profit" : "Net Loss";
  const netColorClass = netProfit >= 0 ? "text-green-600" : "text-red-600";

  const chartData = useMemo(() => {
    const months = 6;
    const now = new Date();
    const monthKeys = Array.from({ length: months }).map((_, index) => {
      const d = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() - (months - 1 - index),
          1,
        ),
      );
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      return { key, label };
    });

    const map: Record<string, { revenue: number; expenses: number }> = {};
    monthKeys.forEach(({ key }) => {
      map[key] = { revenue: 0, expenses: 0 };
    });

    const normalizeAmount = (value: any) => {
      const raw = value ?? 0;
      return Number(String(raw).replace(/[^0-9.-]+/g, "")) || 0;
    };

    const paymentMonth = (payment: any) => {
      const dateString =
        payment.date ||
        payment.paymentDate ||
        payment.paidOn ||
        payment.createdAt;
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return null;
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
        .toISOString()
        .slice(0, 7);
    };

    const expenseMonth = (expense: any) => {
      const dateString =
        expense.date ||
        expense.createdAt ||
        expense.transactionDate ||
        expense.postedAt ||
        expense.entryDate;
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return null;
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
        .toISOString()
        .slice(0, 7);
    };

    payments.forEach((payment) => {
      const monthKey = paymentMonth(payment);
      if (!monthKey || !map[monthKey]) return;
      const status = String(payment.status || "").toLowerCase();
      const amount = normalizeAmount(
        payment.amount ??
          payment.total ??
          payment.value ??
          payment.paymentAmount ??
          payment.amountPaid,
      );
      const completeStatuses = [
        "complete",
        "completed",
        "paid",
        "recorded",
        "confirmed",
        "settled",
        "success",
      ];
      if (completeStatuses.includes(status) || status === "") {
        map[monthKey].revenue += amount;
      }
    });

    expenses.forEach((expense) => {
      const monthKey = expenseMonth(expense);
      if (!monthKey || !map[monthKey]) return;
      const amount = normalizeAmount(
        expense.amount ??
          expense.total ??
          expense.value ??
          expense.paymentAmount ??
          expense.expenseAmount,
      );
      map[monthKey].expenses += amount;
    });

    return monthKeys.map(({ key, label }) => ({
      month: label,
      revenue: Math.round(map[key].revenue),
      expenses: Math.round(map[key].expenses),
    }));
  }, [payments, expenses]);

  const expenseBreakdown = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    expenses.forEach((expense) => {
      const category = (expense.category || "Other").toString();
      categoryMap[category] =
        (categoryMap[category] || 0) + Number(expense.amount || 0);
    });

    const colorMap: Record<string, string> = {
      maintenance: "#8884d8",
      utilities: "#82ca9d",
      insurance: "#ffc658",
      rent: "#ff7c7c",
      repairs: "#a4de6c",
      cleaning: "#d084d0",
      management: "#ffc069",
    };

    return Object.entries(categoryMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      value: Math.round(value),
      color: colorMap[name.toLowerCase()] || "#8884d8",
    }));
  }, [expenses]);

  const occupiedPropertyIds = new Set(
    allTenants.filter((t) => t.propertyId).map((t) => t.propertyId),
  );
  const occupancyRate = allProperties.length
    ? Math.round((occupiedPropertyIds.size / allProperties.length) * 1000) / 10
    : 0;

  // Filter payments by status
  const filteredPayments = rentPayments.filter((payment) => {
    const normalizedStatus = String(payment.status || "").toLowerCase();
    const matchesStatus =
      filterStatus === "complete" &&
      [
        "complete",
        "balance",
        "pending",
        "failed",
        "refunded",
        "recorded",
        "confirmed",
      ].includes(normalizedStatus);
    const matchesSearch =
      !searchQuery ||
      (payment.tenantName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (payment.propertyName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const expenseTransactions = enrichedTransactions
    .filter((t) => t.type === "expense")
    .filter(
      (expense) =>
        !searchQuery ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleRowClick = (tx: any) => {
    setSelectedTx(tx);
    setIsEditingTx(false);
    setTxFormData({
      ...tx,
      amount: tx.amount.toString(),
    });
    setIsTxDialogOpen(true);
  };

  const refreshTransactions = () => {
    refetchAll();
    setTransactions(expenses);
  };
  const refreshPayments = () => {
    refetchAll();
  };

  const isPageLoading = isLoading;

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  // dialog for viewing/editing a transaction
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isEditingTx, setIsEditingTx] = useState(false);
  const [txFormData, setTxFormData] = useState<any>({});

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <AdminSkeletonHeader />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border border-border p-4 sm:p-6">
              <Skeleton className="h-5 w-1/3 mb-4 rounded-full" />
              <Skeleton className="h-10 w-2/3 rounded-xl" />
              <Skeleton className="h-4 w-1/2 rounded-xl mt-4" />
            </Card>
          ))}
        </div>

        <Card className="border border-border p-6">
          <Skeleton className="h-6 w-1/3 rounded-xl mb-4" />
          <Skeleton className="h-72 rounded-3xl" />
        </Card>

        <Card className="border border-border p-6">
          <Skeleton className="h-6 w-1/3 rounded-xl mb-4" />
          <AdminTableSkeleton rowCount={5} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground mb-1">Finances</h1>
          <p className="text-muted-foreground">
            Manage rent collection, expenses, and financial reports
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Total Revenue
          </p>
          <p className="text-2xl sm:text-lg font-bold text-green-600 dark:text-green-400 mb-1 whitespace-nowrap truncate">
            {formatCurrency(totalRevenue, activeCurrency)}
          </p>
          <p className="text-xs text-muted-foreground">
            Includes partial and completed rent payments
          </p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Outstanding Balances
          </p>
          <p className="text-2xl sm:text-lg font-bold text-orange-600 dark:text-orange-400 mb-1 whitespace-nowrap truncate">
            {formatCurrency(expectedOutstanding, activeCurrency)}
          </p>
          <p className="text-xs text-muted-foreground">
            Expected from partial payments and overdue rent
          </p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Pending Payments
          </p>
          <p className="text-2xl sm:text-lg font-bold text-orange-600 dark:text-orange-400 mb-1 whitespace-nowrap truncate">
            {formatCurrency(
              payments
                .filter((t) => t.status === "pending" || t.status === "balance")
                .reduce((sum, t) => sum + (t.balance || 0), 0),
              activeCurrency,
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {
              payments.filter(
                (t) => t.status === "pending" || t.status === "balance",
              ).length
            }{" "}
            pending/partial payments
          </p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Total Expenses
          </p>
          <p className="text-2xl sm:text-lg font-bold text-foreground mb-1 whitespace-nowrap truncate">
            {formatCurrency(totalExpenses, activeCurrency)}
          </p>
          <p className="text-xs text-muted-foreground">Maintenance & other</p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            {netLabel}
          </p>
          <p
            className={`text-2xl sm:text-lg font-bold mb-1 ${netColorClass} whitespace-nowrap truncate`}
          >
            {formatCurrency(netProfit, activeCurrency)}
          </p>
          <p className="text-xs text-muted-foreground">
            Revenue minus expenses
          </p>
        </Card>
      </div>

      {(paymentsError || expensesError) && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          {paymentsError && (
            <p className="mb-1">Payments load error: {paymentsError}</p>
          )}
          {expensesError && <p>Expenses load error: {expensesError}</p>}
        </div>
      )}

      {/* Tabs */}

      {/* transaction detail dialog */}
      <RecordPaymentModal
        open={showRecordPayment}
        onOpenChange={setShowRecordPayment}
      />
      <Dialog open={isTxDialogOpen} onOpenChange={setIsTxDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingTx ? "Edit Transaction" : "Transaction Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedTx ? selectedTx.id : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedTx && !isEditingTx && (
            <div className="space-y-2">
              {selectedTx.transID && (
                <p>
                  <strong>Trans ID:</strong> {selectedTx.transID}
                </p>
              )}
              <p>
                <strong>Type:</strong> {selectedTx.type}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatCurrency(selectedTx.amount, activeCurrency)}
              </p>
              <p>
                <strong>Status:</strong> {selectedTx.status}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedTx.date).toLocaleString()}
              </p>
              <p>
                <strong>Property:</strong> {selectedTx.propertyName || "N/A"}
              </p>
              <p>
                <strong>Tenant:</strong> {selectedTx.tenantName || "N/A"}
              </p>
              <p>
                <strong>Description:</strong> {selectedTx.notes || "—"}
              </p>
              {selectedTx.receiptReference && (
                <p>
                  <strong>Receipt/Invoice Reference:</strong>{" "}
                  {selectedTx.receiptReference}
                </p>
              )}
              {selectedTx.category && (
                <p>
                  <strong>Category:</strong> {selectedTx.category}
                </p>
              )}
              {selectedTx.paymentMethod && (
                <p>
                  <strong>Payment Method:</strong> {selectedTx.paymentMethod}
                </p>
              )}
            </div>
          )}

          {selectedTx && isEditingTx && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const basePatch = {
                  amount: Number(txFormData.amount),
                  status: txFormData.status,
                  date: txFormData.date,
                  description: txFormData.description,
                  propertyId: txFormData.propertyId,
                  tenantId: txFormData.tenantId,
                  category: txFormData.category,
                  paymentMethod: txFormData.paymentMethod,
                };
                try {
                  if (selectedTx.type === "expense") {
                    await updateExpenseApi(selectedTx.id, basePatch);
                  } else {
                    updateTransaction(selectedTx.id, {
                      ...basePatch,
                      type: txFormData.type,
                    });
                  }
                } catch (err) {
                  console.error("Failed to update transaction", err);
                }
                await refreshTransactions();
                setIsTxDialogOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type
                </label>
                <select
                  value={txFormData.type}
                  onChange={(e) =>
                    setTxFormData({ ...txFormData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="rent">Rent</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {txFormData.type === "expense" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category
                  </label>
                  <Input
                    type="text"
                    value={txFormData.category || ""}
                    onChange={(e) =>
                      setTxFormData({ ...txFormData, category: e.target.value })
                    }
                    placeholder="e.g., maintenance, utilities, repairs"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Payment Method
                </label>
                <select
                  value={txFormData.paymentMethod || ""}
                  onChange={(e) =>
                    setTxFormData({
                      ...txFormData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Amount
                </label>
                <Input
                  type="text"
                  value={txFormData.amount}
                  onChange={(e) =>
                    setTxFormData({ ...txFormData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={txFormData.status}
                  onChange={(e) =>
                    setTxFormData({ ...txFormData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date
                </label>
                <Input
                  type="datetime-local"
                  value={txFormData.date}
                  onChange={(e) =>
                    setTxFormData({ ...txFormData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <Textarea
                  value={txFormData.description}
                  onChange={(e) =>
                    setTxFormData({
                      ...txFormData,
                      description: e.target.value,
                    })
                  }
                  className="h-20"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingTx(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Save
                </Button>
              </div>
            </form>
          )}

          <DialogFooter>
            {!isEditingTx && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!selectedTx) return;
                    try {
                      if (selectedTx.type === "expense") {
                        await deleteExpenseApi(selectedTx.id);
                      } else {
                        deleteTransaction(selectedTx.id);
                      }
                    } catch (err) {
                      console.error("Failed to delete transaction", err);
                    }
                    await refreshTransactions();
                    setIsTxDialogOpen(false);
                  }}
                >
                  Delete
                </Button>
                <Button onClick={() => setIsEditingTx(true)}>Edit</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="border-b border-border bg-transparent h-auto p-0 rounded-none">
            <TabsTrigger
              value="rent-collection"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Rent Collection
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Expenses
            </TabsTrigger>
            {/* <TabsTrigger
              value="reports"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Reports
            </TabsTrigger> */}
          </TabsList>

          {/* <Button size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button> */}
        </div>

        {/* Rent Collection Tab */}
        <TabsContent value="rent-collection" className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                placeholder="Filter by tenant or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="completed">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowRecordPayment(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => handleRowClick(payment)}
                  >
                    <div>
                      {payment.status === "complete" ||
                      payment.status === "completed" ||
                      payment.status === "paid" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {payment.tenantName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.propertyName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <b>Reason:</b> {payment.reasonForPayment}
                      </p>
                      {payment.reasonForPayment === "balancePayment" && (
                        <p className="text-sm text-muted-foreground">
                          <b>Balance:</b>{" "}
                          {payment.priorBalance != null
                            ? formatCurrency(
                                payment.priorBalance,
                                activeCurrency,
                              )
                            : "—"}{" "}
                          →{" "}
                          {payment.balanceAfterPayment != null
                            ? formatCurrency(
                                payment.balanceAfterPayment,
                                activeCurrency,
                              )
                            : "—"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {formatCurrency(payment.amount, activeCurrency)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        ["complete", "completed", "paid"].includes(
                          String(payment.status || "").toLowerCase(),
                        )
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {["complete", "completed", "paid"].includes(
                        String(payment.status || "").toLowerCase(),
                      )
                        ? "Paid"
                        : String(payment.status || "").toLowerCase() ===
                            "balance"
                          ? "Partial payment"
                          : "Pending"}{" "}
                      {payment.balance && payment.balance > 0
                        ? `• ${formatCurrency(payment.balance, activeCurrency)}`
                        : ""}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 ml-4"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRowClick(payment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            const deleted = await deletePaymentApi(payment.id);
                            if (deleted) {
                              refreshPayments();
                              if (typeof window !== "undefined")
                                window.dispatchEvent(
                                  new CustomEvent("paymentsUpdated"),
                                );
                            }
                          } catch (e) {
                            console.error("Failed to delete payment", e);
                          }
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (typeof window === "undefined") return;
                          const w = window.open("", "_blank");
                          if (!w) return;
                          w.document.write(
                            `<html><head><title>Payment ${payment.transId || payment.id}</title></head><body><pre>${JSON.stringify(payment, null, 2)}</pre></body></html>`,
                          );
                          w.document.close();
                          w.print();
                        }}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            const text = `Payment ${payment.transId || payment.id}: ${formatCurrency(payment.amount || 0, activeCurrency)}`;
                            if (navigator.share) {
                              await navigator.share({
                                title: "Payment",
                                text,
                                url: window.location.href,
                              });
                            } else if (navigator.clipboard) {
                              await navigator.clipboard.writeText(text);
                              alert("Payment details copied to clipboard");
                            } else {
                              alert(text);
                            }
                          } catch (e) {
                            console.error("Share failed", e);
                          }
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">No rent payments found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="p-6 space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                placeholder="Filter by description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setShowAddExpense(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <AddExpenseForm
            isOpen={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            onSubmit={() => {
              setShowAddExpense(false);
              refreshTransactions();
            }}
          />

          <div>
            {expenseTransactions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {expenseTransactions.map((expense: any) => (
                  <Card
                    key={expense.id}
                    className="p-4 border border-border hover:bg-secondary transition-colors cursor-pointer h-full"
                    onClick={() => handleRowClick(expense)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-5">
                            {expense.category || "Expense"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {expense.propertyName}
                            {expense.unit ? ` • ${expense.unit}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(expense.amount, activeCurrency)}
                          </p>
                          <p
                            className={`text-xs font-semibold ${expense.status === "completed" ? "text-green-600" : expense.status === "pending" ? "text-orange-600" : "text-red-600"}`}
                          >
                            {expense.status.charAt(0).toUpperCase() +
                              expense.status.slice(1)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex-1">
                        <p className="text-sm text-foreground leading-5 line-clamp-3">
                          {expense.description}
                        </p>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                        <div className="truncate">
                          {expense.transID && (
                            <span className="mr-2">ID: {expense.transID}</span>
                          )}
                          {expense.receiptReference && (
                            <span>Receipt: {expense.receiptReference}</span>
                          )}
                        </div>
                        <div className="text-right">
                          {expense.paymentMethod && (
                            <span className="inline-block bg-muted px-2 py-1 rounded-md text-[11px]">
                              {expense.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">No expenses found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab: merged from standalone reports page */}
        <TabsContent value="reports" className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-lg font-bold text-foreground">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground">
                Generate and download detailed reports for your properties
              </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Report Type
                </label>
                <select
                  value={undefined as any}
                  onChange={() => {}}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="income">Income Report</option>
                  <option value="expense">Expense Report</option>
                  <option value="tax">Tax Preparation</option>
                  <option value="occupancy">Occupancy Report</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Time Period
                </label>
                <select
                  defaultValue="month"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div className="flex gap-2 col-span-1 sm:col-span-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Apply</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>

            {/* Report Type Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { id: "income", label: "Income Report", icon: "📊" },
                { id: "expense", label: "Expense Report", icon: "📉" },
                { id: "tax", label: "Tax Preparation", icon: "📋" },
                { id: "occupancy", label: "Occupancy Report", icon: "📈" },
              ].map((type) => (
                <Card key={type.id} className="p-4">
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <p className="text-sm font-medium text-foreground text-center">
                    {type.label}
                  </p>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Revenue Trends
                </h3>
                <div className="w-full h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Expense Breakdown
                </h3>
                <div className="w-full h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: any) =>
                          `${name}: ${formatCurrency(Number(value), activeCurrency)}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) =>
                          formatCurrency(Number(value), activeCurrency)
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: formatCurrency(totalRevenue, activeCurrency),
                  change: undefined,
                },
                {
                  label: "Total Expenses",
                  value: formatCurrency(totalExpenses, activeCurrency),
                  change: undefined,
                },
                {
                  label: netLabel,
                  value: formatCurrency(netProfit, activeCurrency),
                  change: undefined,
                },
                {
                  label: "Occupancy Rate",
                  value: `${occupancyRate}%`,
                  change: undefined,
                },
              ].map((stat) => (
                <Card key={stat.label} className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  {stat.change ? (
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>

            {/* Recent Reports */}
            <Card className="border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Recent Reports
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Report Name
                      </th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">
                        Period
                      </th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">
                        Generated
                      </th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Monthly Income Report",
                        period: "January 2024",
                        generated: "2024-02-01",
                      },
                      {
                        name: "Tax Preparation Report",
                        period: "Q4 2023",
                        generated: "2024-01-15",
                      },
                      {
                        name: "Occupancy Analysis",
                        period: "December 2023",
                        generated: "2024-01-05",
                      },
                      {
                        name: "Expense Summary",
                        period: "November 2023",
                        generated: "2023-12-20",
                      },
                    ].map((report, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border hover:bg-secondary"
                      >
                        <td className="py-3 px-2 text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="truncate">{report.name}</span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                          {report.period}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                          {report.generated}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
