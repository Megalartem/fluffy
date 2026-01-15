"use client";

import * as React from "react";

import type { Category } from "@/features/categories/model/types";
import type {
    Transaction,
    TransactionType,
    CurrencyCode,
    CreateTransactionInput,
    UpdateTransactionInput,
} from "@/features/transactions/model/types";

import type { OptionBaseProps } from "@/shared/ui/atoms";
import { ButtonBase } from "@/shared/ui/atoms";
import { BottomSheet, FormStringField, ModalHeader } from "@/shared/ui/molecules";

import CategoryField from "../CategoryField/CategoryField";
import { CategoriesSheet } from "../CategoryField/CategoriesSheet";

import { buildCategoryOptions, findCategoryOption } from "@/features/transactions/lib/categoryOptions";
import { normalizeSingleChosen, toSingle } from "@/features/transactions/lib/optionSingle";
import {
    toMinorByCurrency,
    fromMinorByCurrency,
} from "@/shared/lib/money/helper";
import { AppError } from "@/shared/errors/app-error";

import styles from "./TransactionUpsertSheet.module.css";

type Props = {
    open: boolean;
    onClose: () => void;

    workspaceId: string;
    type: TransactionType;
    currency: CurrencyCode;

    categories: Category[];

    /**
     * Если передали initial — считаем, что это edit.
     * (Можно заменить на mode, но так проще в интеграции: initial? значит edit)
     */
    initial?: Transaction;

    /** Можно оставить note на потом: в MVP держим null/как есть */
    onCreate: (input: CreateTransactionInput) => Promise<void> | void;
    onUpdate: (input: UpdateTransactionInput) => Promise<void> | void;
};
const categorySelectMode = "single";

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export function TransactionUpsertSheet({
    open,
    onClose,
    workspaceId,
    type,
    currency,
    categories,
    initial,
    onCreate,
    onUpdate,
}: Props) {
    const isEdit = Boolean(initial);

    // --- options for CategorySheet
    const categoryOptions = React.useMemo<OptionBaseProps[]>(
        () =>
            buildCategoryOptions({
                categories,
                txType: type,
                // renderIcon: (c) => <CategoryIcon iconKey={c.iconKey} colorKey={c.colorKey} />,
            }),
        [categories, type]
    );

    // --- form state
    const [amountRaw, setAmountRaw] = React.useState("");
    const [dateKey, setDateKey] = React.useState(todayKey());
    const [chosenCategory, setChosenCategory] = React.useState<OptionBaseProps[] | null>(null);

    const [catOpen, setCatOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [amountError, setAmountError] = React.useState<string | null>(null);

    // --- prefill / reset on open
    React.useEffect(() => {
        if (!open) return;

        setAmountError(null);
        setSaving(false);
        setCatOpen(false);

        if (!initial) {
            // create
            setAmountRaw("");
            setDateKey(todayKey());
            setChosenCategory(null);
            return;
        }

        // edit
        setAmountRaw(fromMinorByCurrency(initial.amountMinor, currency));
        setDateKey(initial.dateKey);

        const preselected = findCategoryOption(categoryOptions, initial.categoryId);
        setChosenCategory(preselected ? [preselected] : null);
    }, [open, initial, currency, categoryOptions]);

    // transfer: category всегда null и поле можно скрыть
    React.useEffect(() => {
        if (type === "transfer") {
            setChosenCategory(null);
            setCatOpen(false);
        }
    }, [type]);

    const selectedCategory = toSingle(chosenCategory);

    async function handleSave() {
        setAmountError(null);

        const amountMinor = toMinorByCurrency(amountRaw, currency);
        if (amountMinor == null || amountMinor <= 0) {
            setAmountError("Введите сумму больше нуля");
            return;
        }

        const categoryId =
            type === "transfer" ? null : (selectedCategory?.value ?? null);

        setSaving(true);
        try {
            if (!isEdit) {
                const input: CreateTransactionInput = {
                    workspaceId,
                    type,
                    amountMinor,
                    currency,
                    categoryId,
                    note: null,
                    dateKey,
                };

                await onCreate(input);
            } else {
                const patch = {
                    amountMinor,
                    dateKey,
                    categoryId,
                    // type/currency/note — не трогаем, так как в форме их нет
                };

                const input: UpdateTransactionInput = {
                    id: initial!.id,
                    patch,
                };

                await onUpdate(input);
            }

            onClose();
        } catch (e) {
            if (e instanceof AppError &&
                e.code === "VALIDATION_ERROR" &&
                e.meta?.field === "amount"
            ) {
                setAmountError(e.message);
                return;
            }
            throw e;
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <BottomSheet
                open={open}
                title={
                    <ModalHeader
                        title={isEdit ? "Edit transaction" : "New transaction"}
                        onClose={onClose}
                    />
                }
                height="half"
                onClose={onClose}
                footer={
                    <ButtonBase className={styles.actionsButton} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </ButtonBase>
                }
            >
                <div className={styles.sheetInner}>
                    <div className={styles.body}>
                        {/* Amount */}
                        <FormStringField
                            label="Amount"
                            placeholder="0"
                            type="number"
                            value={amountRaw}
                            onChange={(e) => setAmountRaw(e.target.value)}
                            error={amountError || undefined}
                            rightSlot={currency}
                        />

                        {type !== "transfer" && (
                            <CategoryField
                                mode={categorySelectMode}
                                values={selectedCategory ? [selectedCategory] : []}
                                isOpen={catOpen}
                                onOpen={() => setCatOpen(true)}
                                onRemove={() => setChosenCategory(null)}
                            />
                        )}

                        {/* Date */}
                        <FormStringField
                            label="Date"
                            type="date"
                            value={dateKey}
                            onChange={(e) => setDateKey(e.target.value)}
                        />
                    </div>
                </div>
            </BottomSheet>

            {type !== "transfer" && (
                <CategoriesSheet
                    open={catOpen}
                    mode={categorySelectMode}
                    title="Category"
                    onClose={() => setCatOpen(false)}
                    options={categoryOptions}
                    chosenOptions={chosenCategory}
                    onChange={(val) => setChosenCategory(normalizeSingleChosen(val))}
                    onApply={(chosen) => {
                        setChosenCategory(normalizeSingleChosen(chosen));
                        setCatOpen(false);
                    }}
                />
            )}
        </>
    );
}

export default TransactionUpsertSheet;