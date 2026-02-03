"use client";

import React, { useState } from 'react';
import {
  Amount,
  ButtonBase,
  CategoryIcon,
  Icon,
  IconButton,
  IOptionBase,
  Text,
} from '@/shared/ui/atoms';
import {
  BottomSheet,
  Card,
  Carousel,
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
  FormFieldString,
  FormFieldSelect,
  ConfirmDialog
} from '@/shared/ui/molecules';
import { Bell, ArrowUpDown, ShoppingCart, Beef, Car, House, LucideIcon, PlugZap, Banana } from 'lucide-react';


type ColorItem = {
  id: string;
  hex: string;
  name: string;
};

const DEFAULT_COLORS: ColorItem[] = [
  { id: "coral",  hex: "#FF6B6B", name: "Coral" },
  { id: "orange", hex: "#FF9F43", name: "Orange" },
  { id: "yellow", hex: "#FECB2F", name: "Yellow" },
  { id: "mint",   hex: "#2ECC71", name: "Mint" },
  { id: "teal",   hex: "#1ABC9C", name: "Teal" },
  { id: "blue",   hex: "#4D96FF", name: "Blue" },
  { id: "indigo", hex: "#6C5CE7", name: "Indigo" },
  { id: "purple", hex: "#A66CFF", name: "Purple" },
  { id: "pink",   hex: "#FF4D8D", name: "Pink" },
  { id: "gray",   hex: "#E5E7EB", name: "Gray" },
];


const renderIcon = (icon: LucideIcon) => (
  <Icon icon={icon} size="l" />
);

const categoryOptions: IOptionBase[] = [
  { label: "Food", value: "food", icon: renderIcon(Beef) },
  { label: "Taxi", value: "taxi", icon: renderIcon(Car) },
  { label: "Rent", value: "rent", icon: renderIcon(House) },
  { label: "Shopping", value: "shopping", icon: renderIcon(ShoppingCart) },
  { label: "Utilities", value: "utilities", icon: renderIcon(PlugZap) },
  { label: "Other", value: "other", icon: renderIcon(Banana) },
];

interface FilterValues {
  amountMin: string;
  category: IOptionBase | null;
  categories: IOptionBase[];
}


export default function TestUIAtomsPage() {
  const [val, setVal] = useState("expense");
  const [src, setSrc] = useState('');
  const [demoAmount, setDemoAmount] = useState<string>("");
  const [demoText, setDemoText] = useState<string>("");
  const [demoSelectLabel, setDemoSelectLabel] = useState<string | null>(null);

  const [filterValues, setFilterValues] = useState<FilterValues>({
    amountMin: "",
    category: null,
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
  const [chosenOptions, setChosenOptions] = useState<IOptionBase[] | null>(null);


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


  const handleSingleSelectOption = (option: IOptionBase | null) => {
    setFilterValues((prev) => ({
      ...prev,
      category: option,
    }));
    setIsCategoryOptionsOpen(false);
  }

  const handleMultiSelectOption = (options: IOptionBase[]) => {
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

      {/* <FormFieldString
        label="Amount"
        type='number'
        helperText="Add the amount in USD"
        required
        value={demoAmount}
        onChange={(e) => setDemoAmount((e.target.value))} name={''}      />

      <FormFieldString
        label="String label"
        placeholder="Enter text"
        value={demoText}
        onChange={(e) => setDemoText(e.target.value)} name={''}      />

      <FormFieldSelect
        label="Select label"
        mode="single"
        placeholder="Choose an option"
        name={'Choose an option'}
        onOpen={() => console.log("open select")}
        optionsByValue={{
          option1: { label: "Option 1", value: "option1" },
          option2: { label: "Option 2", value: "option2" },
          option3: { label: "Option 3", value: "option3" },
        }}
        /> */}

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
{/* 
        <FormFieldSelect
          label="Category"
          mode="multi"
          name="categories"
          // value={filterValues.categories[0] || null}
          placeholder="Choose an option"
          onOpen={() => setIsCategoryOptionsOpen(true)}
          optionsByValue={{
            food: { label: "Food", value: "food" },
            taxi: { label: "Taxi", value: "taxi" },
            rent: { label: "Rent", value: "rent" },
          }}
          /> */}

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
        btnBgColorVariant="ghost"
        options={categoryOptions}
        chosenOptions={chosenOptions}
        onChange={(val) => {
          setChosenOptions(val);
        }}
      />

    </div>
  );
}
