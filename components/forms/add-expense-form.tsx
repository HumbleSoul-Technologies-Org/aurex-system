"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, DollarSign, Calendar, Tag } from "lucide-react";
import { createTransaction } from "@/app/lib/transactions-client";
import { listProperties } from "@/lib/services/properties";

interface AddExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ExpenseFormData) => void;
}

interface ExpenseFormData {
  category: string;
  expenseType: "residential" | "commercial" | "both";
  amount: string;
  date: string;
  description: string;
  property: string;
  receipt?: string;
  unit?: string;
  paymentMethod?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceNumber?: string;
  dueDate?: string;
  requiresApproval: boolean;
  approvedBy?: string;
  approvalDate?: string;
  recurringFrequency?: "weekly" | "monthly" | "quarterly" | "yearly";
  autoPay: boolean;
}

export default function AddExpenseForm({
  isOpen,
  onClose,
  onSubmit,
}: AddExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: "maintenance",
    expenseType: "commercial",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    property: "",
    receipt: "",
    unit: "",
    paymentMethod: "",
    vendorId: "",
    vendorName: "",
    invoiceNumber: "",
    dueDate: "",
    requiresApproval: false,
    approvedBy: "",
    approvalDate: "",
    recurringFrequency: "monthly",
    autoPay: false,
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[] | null>(null);

  // Load properties on mount
  useEffect(() => {
    setProperties(listProperties());
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "property") {
      const prop = properties.find((p) => p.id === value);
      if (prop && Array.isArray(prop.units) && prop.units.length > 0) {
        setAvailableUnits(prop.units);
        if (prop.units.length === 1) {
          setFormData((prev) => ({
            ...prev,
            property: value,
            unit: prop.units[0],
          }));
          return;
        }
      } else {
        setAvailableUnits(null);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // create transaction record
    try {
      createTransaction({
        amount: parseFloat(formData.amount) || 0,
        type: "expense",
        expenseType: formData.expenseType,
        description: formData.description,
        propertyId: formData.property || undefined,
        status: "completed",
        category: formData.category,
        date: formData.date,
        receiptReference: formData.receipt || undefined,
        unit: formData.unit || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        vendorName: formData.vendorName || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        dueDate: formData.dueDate || undefined,
        requiresApproval: formData.requiresApproval,
        approvedBy: formData.approvedBy || undefined,
        approvalDate: formData.approvalDate || undefined,
        recurring: {
          frequency: formData.recurringFrequency,
          autoPay: formData.autoPay,
        },
      });
    } catch (err) {
      // ignore
    }
    onSubmit?.(formData);
    setFormData({
      category: "maintenance",
      expenseType: "commercial",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      property: "",
      receipt: "",
      unit: "",
      paymentMethod: "",
      vendorId: "",
      vendorName: "",
      invoiceNumber: "",
      dueDate: "",
      requiresApproval: false,
      approvedBy: "",
      approvalDate: "",
      recurringFrequency: "monthly",
      autoPay: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Add Expense
              </h2>
              <p className="text-sm text-muted-foreground">
                Record a new property expense
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Expense Category
                </div>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="maintenance">Maintenance & Repairs</option>
                <option value="utilities">Utilities</option>
                <option value="insurance">Insurance</option>
                <option value="property-tax">Property Tax</option>
                <option value="cleaning">Cleaning & Services</option>
                <option value="legal">Legal & Compliance</option>
                <option value="management">Management Fees</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Amount
                </div>
              </label>
              <Input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date
                </div>
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Expense Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expense Type
              </label>
              <select
                name="expenseType"
                value={formData.expenseType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Property */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Property
              </label>
              <select
                name="property"
                value={formData.property}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit (conditional) */}
            {availableUnits && availableUnits.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select Unit</option>
                  {availableUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select Method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>

            {/* Vendor Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vendor Name
                </label>
                <Input
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invoice #
                </label>
                <Input
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="Invoice number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Approval Required
                </label>
                <select
                  name="requiresApproval"
                  value={String(formData.requiresApproval)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requiresApproval: e.target.value === "true",
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            {formData.requiresApproval && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Approved By
                  </label>
                  <Input
                    name="approvedBy"
                    value={formData.approvedBy}
                    onChange={handleChange}
                    placeholder="Approver name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Approval Date
                  </label>
                  <Input
                    type="date"
                    name="approvalDate"
                    value={formData.approvalDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recurring Frequency
                </label>
                <select
                  name="recurringFrequency"
                  value={formData.recurringFrequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Auto-pay
                </label>
                <select
                  name="autoPay"
                  value={String(formData.autoPay)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      autoPay: e.target.value === "true",
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the expense..."
                className="h-20"
                required
              />
            </div>

            {/* Receipt */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Receipt/Invoice Reference
              </label>
              <Input
                name="receipt"
                value={formData.receipt}
                onChange={handleChange}
                placeholder="Receipt number or file name"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-border text-foreground bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                Add Expense
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
