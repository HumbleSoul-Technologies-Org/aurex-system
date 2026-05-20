"use client";

import { useState, useEffect } from "react";
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
import { chartData, expenseBreakdown } from "@/app/lib/sample-data";
import { useAppData } from "@/lib/data-context";
import {
  listTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/app/lib/transactions-client";
import {
  getAllExpenses,
  updateExpenseApi,
  deleteExpenseApi,
} from "@/lib/services/expenses";
import { listPayments } from "@/lib/services/payments";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { deletePayment } from "@/lib/services/payments";
import AddExpenseForm from "@/components/forms/add-expense-form";

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState("rent-collection");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">(
    "all",
  );
  const { tenants: allTenants, properties: allProperties } = useAppData();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // load server-backed expenses for display
    (async () => {
      try {
        const serverExpenses = await getAllExpenses();
        setTransactions(serverExpenses);
      } catch (e) {
        // fallback to empty list if API fails
        setTransactions([]);
      }
    })();

    setPayments(listPayments());
    const onTxUpdate = () => refreshTransactions();
    const onPaymentsUpdated = () => setPayments(listPayments());
    window.addEventListener("transactionsUpdated", onTxUpdate);
    window.addEventListener("paymentsUpdated", onPaymentsUpdated);
    return () => {
      window.removeEventListener("transactionsUpdated", onTxUpdate);
      window.removeEventListener("paymentsUpdated", onPaymentsUpdated);
    };
  }, []);

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
    (t) => t.status === "completed" || t.status === "paid",
  );
  // only count pending payments for tenants whose status is 'due'
  const dueTenantIds = allTenants
    .filter((t) => t.status === "due")
    .map((t) => t.id);
  const pendingPayments = rentPayments.filter(
    (t) =>
      (t.status === "pending" || t.status === undefined) &&
      t.tenantId &&
      dueTenantIds.includes(t.tenantId),
  );

  const totalRevenue = completedPayments.reduce(
    (sum, t) => sum + (t.amount || 0),
    0,
  );
  const totalExpenses = enrichedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPending = pendingPayments.reduce(
    (sum, t) => sum + (t.amount || 0),
    0,
  );

  // Filter payments by status
  const filteredPayments = rentPayments.filter((payment) => {
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
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
    (async () => {
      try {
        const serverExpenses = await getAllExpenses();
        setTransactions(serverExpenses);
      } catch (e) {
        setTransactions([]);
      }
    })();
  };
  const refreshPayments = () => {
    setPayments(listPayments());
  };

  const [showAddExpense, setShowAddExpense] = useState(false);

  // dialog for viewing/editing a transaction
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isEditingTx, setIsEditingTx] = useState(false);
  const [txFormData, setTxFormData] = useState<any>({});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Finances</h1>
          <p className="text-muted-foreground">
            Manage rent collection, expenses, and financial reports
          </p>
        </div>
        {/* <Button className="bg-primary hover:bg-primary/90 text-white">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button> */}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Total Revenue
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 whitespace-nowrap truncate">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">From rent payments</p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Total Expenses
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1 whitespace-nowrap truncate">
            ${totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Maintenance & other</p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Net Profit
          </p>
          <p
            className={`text-2xl sm:text-3xl font-bold mb-1 ${totalRevenue - totalExpenses > 0 ? "text-green-600" : "text-red-600"} whitespace-nowrap truncate`}
          >
            ${(totalRevenue - totalExpenses).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Revenue minus expenses
          </p>
        </Card>

        <Card className="border border-border p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Pending Payments
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1 whitespace-nowrap truncate">
            ${totalPending.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {pendingPayments.length} payments
          </p>
        </Card>
      </div>

      {/* Tabs */}

      {/* transaction detail dialog */}
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
                <strong>Amount:</strong> ${selectedTx.amount.toLocaleString()}
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
                <strong>Description:</strong> {selectedTx.description || "—"}
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
            {/* <Button size="sm" onClick={async () => {
              const tenantId = prompt('Tenant ID (optional)') || undefined
              const amtStr = prompt('Payment amount')
              if (!amtStr) return
              const amount = Number(amtStr)
              if (Number.isNaN(amount)) return alert('Invalid amount')
              const desc = prompt('Description (optional)') || 'Manual payment'
              const created = await createTransaction({ tenantId, amount, type: 'rent', description: desc })
              if (created) alert('Payment recorded')
              else alert('Failed to record payment')
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button> */}
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
                      {payment.status === "completed" ? (
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
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      ${payment.amount.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs font-semibold ${payment.status === "completed" ? "text-green-600" : "text-orange-600"}`}
                    >
                      {payment.status === "completed" ? "Paid" : "Pending"}
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
                        onClick={() => {
                          try {
                            deletePayment(payment.id);
                            refreshPayments();
                            if (typeof window !== "undefined")
                              window.dispatchEvent(
                                new CustomEvent("paymentsUpdated"),
                              );
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
                            const text = `Payment ${payment.transId || payment.id}: $${(payment.amount || 0).toFixed(2)}`;
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
                            -${expense.amount.toLocaleString()}
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
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
                        label={({ name, value }: any) => `${name}: $${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: "$127,500", change: "+12.5%" },
                { label: "Total Expenses", value: "$42,300", change: "-3.2%" },
                { label: "Net Income", value: "$85,200", change: "+18.7%" },
                { label: "Occupancy Rate", value: "94%", change: "+2.1%" },
              ].map((stat) => (
                <Card key={stat.label} className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
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
