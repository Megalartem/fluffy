"use client";

import * as React from "react";
import {
    FormProvider,
    useForm,
    useWatch,
    type SubmitHandler,
} from "react-hook-form";

import styles from "./BudgetUpsertSheet.module.css";

import type { Budget } from "@/features/budgets/model/types";
import type {
    CreateBudgetInput,
    UpdateBudgetInput,
} from "@/features/budgets/model/types";

import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import { AppError } from "@/shared/errors/app-error";

import { ButtonBase, IconButton, IOptionBase } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";

import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";
import { FormFieldSelect } from "@/shared/ui/molecules/FormField/FormFieldSelect";
import { Trash2 } from "lucide-react";
import { toMinorByCurrency, fromMinorByCurrency } from "@/shared/lib/money/helper";

// +++
import {
    buildCategoryOptions,
} from "@/features/transactions/lib/categoryOptions";
import { renderCategoryIcon } from "@/shared/lib/renderCategoryIcon";
import { CategoriesSheet } from "@/features/transactions/ui/components/CategoryField/CategoriesSheet";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";
// ---

type FormValues = {
    categoryId: string | null;
    limit: string;
};

interface IBudgetUpsertSheet {
    open: boolean;
    budget?: Budget;
    currentSpentMinor?: number;

    onClose: () => void;

    onCreate: (input: CreateBudgetInput) => Promise<void> | void;
    onUpdate: (input: UpdateBudgetInput) => Promise<void> | void;
    onDelete?: (budget: Budget) => Promise<void> | void;
}

export function BudgetUpsertSheet({
    open,
    onClose,
    budget,
    onCreate,
    onUpdate,
    onDelete,
}: IBudgetUpsertSheet) {
    const isEdit = Boolean(budget?.id);
    const { currency } = useWorkspace();

    const form = useForm<FormValues>({
        defaultValues: { limit: "", categoryId: null },
        mode: "onSubmit",
    });

    const [saving, setSaving] = React.useState(false);
    const [catOpen, setCatOpen] = React.useState(false);

    // +++ categoryId logic mirrored from TransactionUpsertSheet
    const categories = useCategories();
    const { budgets } = useBudgets();

    // Filter out categories that already have budgets (except current budget's category in edit mode)
    const categoryOptions = React.useMemo(() => {
        if (!categories) return [];

        const expenseCategories = categories.items.filter((c) => c.type === "expense");

        // Get set of category IDs that already have budgets
        const budgetedCategoryIds = new Set(
            budgets.map(b => b.categoryId)
        );

        // In edit mode, allow the current budget's category
        if (isEdit && budget?.categoryId) {
            budgetedCategoryIds.delete(budget.categoryId);
        }

        // Filter out categories with existing budgets
        const availableCategories = expenseCategories.filter(
            c => !budgetedCategoryIds.has(c.id)
        );

        return buildCategoryOptions({
            categories: availableCategories,
            txType: "expense",
            includeArchived: false,
            renderIcon: renderCategoryIcon,
        });
    }, [categories, budgets, isEdit, budget?.categoryId]);

    // Build lookup map for category options
    const categoryOptionsByValue = React.useMemo<Record<string, IOptionBase>>(() => {
        const base = categoryOptions.reduce<Record<string, IOptionBase>>((acc, opt) => {
            acc[String(opt.value)] = opt;
            return acc;
        }, {});

        // In edit mode, ensure current category is always available (even if archived)
        if (isEdit && budget?.categoryId && categories?.items) {
            const currentCategory = categories.items.find(c => c.id === budget.categoryId);
            if (currentCategory && !base[budget.categoryId]) {
                // Build option for current category if not already in the list
                const currentOpt = buildCategoryOptions({
                    categories: [currentCategory],
                    txType: "expense",
                    includeArchived: true, // Include archived for current category display
                    renderIcon: renderCategoryIcon,
                })[0];
                if (currentOpt) {
                    base[String(currentOpt.value)] = currentOpt;
                }
            }
        }

        return base;
    }, [categoryOptions, isEdit, budget?.categoryId, categories?.items]);

    const categoryId = useWatch({ control: form.control, name: "categoryId" });
    const chosenCategory = React.useMemo<IOptionBase[] | null>(() => {
        if (!categoryId) return null;
        // Look up in the complete options map (includes current category even if archived)
        const opt = categoryOptionsByValue[categoryId];
        return opt ? [opt] : null;
    }, [categoryId, categoryOptionsByValue]);
    // ---

    React.useEffect(() => {
        if (!open) return;
        setSaving(false);
        setCatOpen(false);

        form.reset({
            limit: isEdit && budget ? fromMinorByCurrency(budget.limitMinor, budget.currency) : "",
            categoryId: isEdit && budget ? budget.categoryId : null,
        });
    }, [open, isEdit, budget, form]);

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        form.clearErrors("limit");
        form.clearErrors("categoryId");

        // Validate category selection
        const selectedCategoryId = values.categoryId;
        if (!selectedCategoryId) {
            form.setError("categoryId", { type: "validate", message: "Choose a category" });
            return;
        }

        // Validate limit amount
        const limitMinor = toMinorByCurrency(values.limit, currency);
        if (limitMinor == null || limitMinor <= 0) {
            form.setError("limit", {
                type: "validate",
                message: "Введите лимит больше нуля",
            });
            return;
        }

        setSaving(true);
        try {
            if (!isEdit) {
                // Create new budget
                const input: CreateBudgetInput = {
                    categoryId: selectedCategoryId,
                    period: "monthly",
                    currency,
                    limitMinor,
                };
                await onCreate(input);
            } else {
                // Update existing budget
                const input: UpdateBudgetInput = {
                    id: budget!.id,
                    patch: {
                        categoryId: selectedCategoryId,
                        limitMinor
                    },
                };
                await onUpdate(input);
            }

            onClose();
        } catch (e) {
            // Handle validation errors
            if (e instanceof AppError && e.code === "VALIDATION_ERROR") {
                const field = (e.meta as { field?: string })?.field;
                if (field === "limit") {
                    form.setError("limit", { type: "server", message: e.message });
                } else if (field === "categoryId") {
                    form.setError("categoryId", { type: "server", message: e.message });
                }
                return;
            }
            // Handle duplicate category budget
            if (e instanceof AppError && e.code === "CONFLICT") {
                form.setError("categoryId", { type: "server", message: e.message });
                return;
            }
            throw e;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!isEdit || !onDelete || !budget) return;
        setSaving(true);
        try {
            await onDelete(budget);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const title = isEdit ? "Edit budget" : "Set budget";

    return (
        <>
            <BottomSheet
                open={open}
                title={<ModalHeader title={title} onClose={onClose} />}
                height="half"
                onClose={onClose}
                footer={
                    <div className={styles.footer}>
                        <ButtonBase
                            fullWidth
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={saving}
                        >
                            {saving ? "Saving…" : "Save"}
                        </ButtonBase>

                        {isEdit && onDelete && (
                            <IconButton
                                icon={Trash2}
                                variant="default"
                                onClick={handleDelete}
                                disabled={saving}
                                className={styles.deleteButton}
                                ariaLabel="Remove budget"
                            />
                        )}
                    </div>
                }
            >
                <FormProvider {...form}>
                    <div className={styles.form}>
                        <FormFieldSelect<FormValues>
                            name="categoryId"
                            label="Category"
                            mode="single"
                            placeholder="Choose category"
                            onOpen={() => setCatOpen(true)}
                            optionsByValue={categoryOptionsByValue}
                            showChevron
                            removable
                            isOpen={catOpen}
                            rules={{ required: "Choose a category" }}
                            helperText="The category this budget applies to."
                        />

                        <FormFieldString<FormValues>
                            name="limit"
                            label="Monthly limit"
                            placeholder="0"
                            rightSlot={currency}
                            rules={{
                                required: "Введите лимит",
                                validate: (v) => {
                                    const minor = toMinorByCurrency(v as string, currency);
                                    if (minor == null || minor <= 0) return "Введите лимит больше нуля";
                                    return true;
                                },
                            }}
                            helperText="Set a monthly spending limit for this category."
                        />
                    </div>
                </FormProvider>
            </BottomSheet>

            <CategoriesSheet
                open={catOpen}
                mode="single"
                title="Category"
                onClose={() => setCatOpen(false)}
                options={Object.values(categoryOptionsByValue)}
                chosenOptions={chosenCategory}
                onChange={(val) => {
                    const next = Array.isArray(val) && val[0] ? String(val[0].value) : null;
                    form.setValue("categoryId", next, { shouldValidate: true });
                }}
                onApply={(chosen) => {
                    const next = Array.isArray(chosen) && chosen[0] ? String(chosen[0].value) : null;
                    form.setValue("categoryId", next, { shouldValidate: true });
                    setCatOpen(false);
                }}
            />
        </>
    );
}

export default BudgetUpsertSheet;