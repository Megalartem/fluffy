"use client";

import React, { useState } from 'react';
import {
  Amount,
  ButtonBase,
  CategoryIcon,
  Icon,
  IconButton,
  OptionBaseProps,
  Text,
} from '@/shared/ui/atoms';
import {
  BottomSheet,
  Card,
  EmptyState,
  FiltersSheet,
  InlineNotice,
  ListRowBase,
  LoadMoreBar,
  Modal,
  ModalActions,
  ModalHeader,
  NoticeStack,
  OptionControl,
  SearchBar,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  SortControl,
  SortSheet,
  TopBar,
} from '@/shared/ui/molecules';
import {
  LoadMoreBarState,
  NoticeItem,
  FormNumberField,
  FormStringField,
  FormSelectField,
  ConfirmDialog
} from '@/shared/ui/molecules';
import { Bell, ArrowUpDown, ShoppingCart, Beef, Car, House, LucideIcon, PlugZap, Banana } from 'lucide-react';


const renderIcon = (icon: LucideIcon) => (
  <Icon icon={icon} size="l" />
);

const categoryOptions: OptionBaseProps[] = [
  { label: "Food", value: "food", icon: renderIcon(Beef) },
  { label: "Taxi", value: "taxi", icon: renderIcon(Car) },
  { label: "Rent", value: "rent", icon: renderIcon(House) },
  { label: "Shopping", value: "shopping", icon: renderIcon(ShoppingCart) },
  { label: "Utilities", value: "utilities", icon: renderIcon(PlugZap) },
  { label: "Other", value: "other", icon: renderIcon(Banana) },
];

interface FilterValues {
  amountMin: string;
  categories: OptionBaseProps[];
}


export default function TestUIAtomsPage() {
  const [val, setVal] = useState("expense");
  const [src, setSrc] = useState('');
  const [demoAmount, setDemoAmount] = useState<string>("");
  const [demoText, setDemoText] = useState<string>("");
  const [demoSelectLabel, setDemoSelectLabel] = useState<string | null>(null);

  const [filterValues, setFilterValues] = useState<FilterValues>({
    amountMin: "",
    categories: [],
  });
  const [activeFilterSelect, setActiveFilterSelect] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [sortValue, setSortValue] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null,
  });
  const [isCategoryOptionsOpen, setIsCategoryOptionsOpen] = useState(false);
  const [chosenOptions, setChosenOptions] = useState<OptionBaseProps[] | null>(null);


  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: "1",
      tone: "warning" as const,
      title: "Бюджет почти исчерпан",
      message: "Ты потратил 80% лимита.",
      onClick: () => console.log("open budget"),
      onClose: () => setNotices((p) => p.filter((x) => x.id !== "1")),
    },
  ]);
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreBarState>("idle");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const sortOptions = [
    { key: 'amount', label: 'Сумма' },
    { key: 'type', label: 'Тип' },
    { key: 'category', label: 'Категория' },
  ];

  const filterOptions = [
    {
      key: "amountMin",
      label: "Min amount",
      type: "number" as const,
      placeholder: "0",
    },
    {
      key: "category",
      label: "Category",
      type: "select" as const,
      mode: "single" as const,
      placeholder: "All categories",
      options: [
        { value: "food", label: "Food", icon: ShoppingCart },
        { value: "taxi", label: "Taxi", icon: Car },
      ],
    },
    {
      key: "categories",
      label: "Categories (multi)",
      type: "select" as const,
      mode: "multi" as const,
      placeholder: "All categories",
      options: [
        { value: "food", label: "Food" },
        { value: "taxi", label: "Taxi" },
        { value: "rent", label: "Rent" },
      ],
    },
  ];

  const activeSelectConfig = filterOptions.find(
    (o) => o.type === "select" && o.key === activeFilterSelect
  );


  const handleSingleSelectOption = (option: OptionBaseProps | null) => {
    setFilterValues((prev) => ({
      ...prev,
      category: option,
    }));
    setIsCategoryOptionsOpen(false);
  }

  const handleMultiSelectOption = (options: OptionBaseProps[]) => {
    console.log('Selected options:', options);
    setChosenOptions(options);
    setFilterValues((prev) => ({
      ...prev,
      categories: options,
    }));
    setIsCategoryOptionsOpen(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-main p-l space-y-xl p-8 gap-4">
      <Card>
        <Text>Контент карточки</Text>
      </Card>

      <Card variant="ghost">
        <Text>Группировка без акцента</Text>
      </Card>

      <TopBar
        title="Заголовок страницы"
        subtitle="Подзаголовок страницы"
        rightAction={{
          icon: Bell,
          onClick: () => alert('Уведомления нажаты'),
        }}
      />

      <ModalHeader title="Добавить запись" onClose={() => { console.log('Закрыть') }} />

      <ModalActions
        secondary={{ label: "Отмена", onClick: () => { console.log('Отмена') } }}
        primary={{ label: "Удалить", onClick: () => { console.log('Удалить') }, disabled: false }}
      />

      <FormNumberField
        label="Amount"
        helperText="Add the amount in USD"
        error="Incorrect amount"
        required
        value={demoAmount}
        onChange={(e) => setDemoAmount((e.target.value))}
      />

      <FormStringField
        label="String label"
        placeholder="Enter text"
        value={demoText}
        onChange={(e) => setDemoText(e.target.value)}
      />

      <FormSelectField
        label="Select label"
        mode="single"
        values={filterValues.categories}
        placeholder="Choose an option"
        onClick={() => {
          // demo only
          setDemoSelectLabel((p) => (p ? null : "ood"));
        }}
      />

      <SegmentedControl
        value={val}
        size="m"
        options={[
          { value: "expense", label: "Расход" },
          { value: "income", label: "Доход" },
        ]}
        onChange={(value) => { setVal(value); }}
      />

      <ListRowBase
        leading={
          <CategoryIcon icon={ShoppingCart} color='violet' size='s' />
        }
        title="Grocery"
        tone='ghost'
        size='m'
        trailing={
          <Amount state="negative">
            2 500 ₽
          </Amount>
        }
        onClick={() => alert("click row 1")}
      />
      <ListRowBase
        leading={
          <CategoryIcon icon={Beef} color='violet' size='s' />
        }
        title="Food"
        tone='ghost'
        trailing={
          <Amount state="negative">
            2 500 ₽
          </Amount>
        }
        onClick={() => alert("click row 1")}
      />


      <EmptyState
        title="Пока нет транзакций"
        description="Добавь первую запись, чтобы начать отслеживать расходы."
        size="l"
        tone="default"
        primaryAction={{
          label: "Добавить транзакцию",
          onClick: () => console.log("add transaction")
        }}
      />

      <ButtonBase onClick={() => setOpen(true)}>Открыть модалку</ButtonBase>

      <Modal
        open={open}
        title="Добавить запись"
        onClose={() => setOpen(false)}
        dismissible={false} // как ты хотел: иногда запрещаем закрытие по overlay
      >
        <Text>Контент модалки</Text>
        <div className="mt-4">
          <ModalActions
            secondary={{ label: "Отмена", onClick: () => setOpen(false) }}
            primary={{ label: "Сохранить", onClick: () => setOpen(false) }}
          />
        </div>
      </Modal>

      <SearchBar
        value={src}
        onChange={setSrc}
        placeholder="Search"
        onOpenFilters={() => setOpenFilters(true)}
        filtersActive={Boolean(filterValues.categories.length > 0 || filterValues.amountMin)}
      />

      <ButtonBase onClick={() => setOpenSheet(true)}>Открыть Bottom Sheet</ButtonBase>

      <BottomSheet
        open={openSheet}
        title={<ModalHeader title="Bottom Sheet" onClose={() => setOpenSheet(false)} />}
        height="half"
        onClose={() => setOpenSheet(false)}
      >
        <Text>Контент bottom sheet</Text>
      </BottomSheet>

      <FiltersSheet
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        title="Фильтры"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <ButtonBase variant="muted" onClick={() => alert('reset filters')}>
              Сбросить
            </ButtonBase>
            <ButtonBase onClick={() => setOpenFilters(false)}>
              Применить
            </ButtonBase>
          </div>
        }
      >

        <FormSelectField
          label="Category"
          mode="multi"
          values={filterValues.categories}
          isOpen={isCategoryOptionsOpen}
          placeholder="Choose an option"
          onClick={() => setIsCategoryOptionsOpen(true)}
          onRemoveValue={(value: OptionBaseProps) => {
            setFilterValues((prev) => ({
              ...prev,
              categories: prev.categories.filter((cat) => cat.value !== value.value),
            }));
            setChosenOptions((prev) => {
              if (!prev) return null;
              return prev.filter((cat) => cat.value !== value.value);
            });

          }}
        />

        <Card variant="ghost">
          <Text>activeSelect: {String(activeFilterSelect)}</Text>
          <Text>values: {JSON.stringify(filterValues)}</Text>
        </Card>
      </FiltersSheet>

      <BottomSheet
        open={isCategoryOptionsOpen}
        title={
          <ModalHeader
            title={activeSelectConfig?.label ?? "Options"}
            onClose={setIsCategoryOptionsOpen.bind(null, false)}
          />
        }
        height="half"
        onClose={setIsCategoryOptionsOpen.bind(null, false)}
      >
        <OptionControl
          mode="multi"
          options={categoryOptions}
          chosenOptions={chosenOptions}
          onChange={(val) => {
            setChosenOptions(val);
            // handleSingleSelectOption(val[0]);
          }}
          onApply={(chosen) => {
            handleMultiSelectOption(chosen || []);
          }}          
        />
      </BottomSheet>

      <ButtonBase onClick={() => setOpenSort(true)}>
        Открыть сортировку
      </ButtonBase>

      <SortSheet
        open={openSort}
        onClose={() => setOpenSort(false)}
        title={
          <ModalHeader
            title="Сортировка"
            onClose={() => setOpenSort(false)}
          />
        }
      >
        <SortControl
          options={sortOptions}
          value={sortValue}
          onChange={setSortValue}
        />
        <div className="mt-4">
          <Card variant="ghost">
            <Text>
              sort: {String(sortValue.key)} / {String(sortValue.direction)}
            </Text>
          </Card>
        </div>
      </SortSheet>

      <SectionHeader
        title="Заголовок секции"
        subtitle="Подзаголовок секции"
        rightSec={
          <IconButton
            variant="ghost"
            size="s"
            onClick={() => alert('Сортировать')}
            icon={ArrowUpDown}
            ariaLabel="Сортировать"
          />
        }
      />

      <InlineNotice
        tone="success"
        title="Информационное уведомление"
        onClick={() => alert('Тык на уведомление')}
        onClose={() => alert('Уведомление закрыто')}
      >
        Это пример информационного уведомления.
      </InlineNotice>

      <NoticeStack items={notices} />

      <Skeleton variant="line" width="60%" height={12} />
      <Skeleton variant="block" height={96} />
      <Skeleton variant="circle" width={40} height={40} />

      <LoadMoreBar
        state={loadMoreState}
        onLoadMore={() => {
          setLoadMoreState("loading");
          setTimeout(() => setLoadMoreState("idle"), 3000);
        }}
        label="Показать ещё"
        loadingLabel="Загружаю…"
        disabledLabel="Больше нет"
        hint="Показываем по 50 записей"
      />

      <ButtonBase
        onClick={() => {
          setOpenConfirmModal(true);
        }}
      >
        Открыть Confirm Dialog
      </ButtonBase>

      <ConfirmDialog
        open={openConfirmModal}
        title="Delete record?"
        description="This action is irreversible."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        confirmDisabled={false}
        closeOnOverlay={true}
        onConfirm={() => {
          alert("Record deleted");
          setOpenConfirmModal(false);
        }}
        onCancel={() => {
          setOpenConfirmModal(false);
        }}
      />

      <OptionControl
        mode="multi"
        options={categoryOptions}
        chosenOptions={chosenOptions}
        onChange={(val) => {
          setChosenOptions(val);
        }}
        onApply={() => {
          console.log("Options applied")
        }}
      />

    </div>
  );
}
