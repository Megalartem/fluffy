"use client";

import React, { useState } from 'react';
import {
  Text,
  Heading,
  Amount,
  Surface,
  Divider,
  Icon,
  CategoryIcon,
  ButtonBase,
  IconButton,
  FAB,
  InputBase,
  SearchInput,
  Toggle,
  Checkmark,
  Badge,
  Dot,
  Overlay,
  SelectBase,
} from '@/shared/ui/atoms';
import {
  Heart,
  Home,
  Settings,
  Search,
  Plus,
  Trash2,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  ChevronDownIcon,
} from 'lucide-react';

export default function TestUIAtomsPage() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [input1, setInput1] = useState('');
  const [search, setSearch] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main p-l space-y-xl p-8 gap-4">
      {/* Header */}
      <div className="space-y-s">
        <Heading variant="page">UI Atoms Showcase</Heading>
        <Text variant="caption">Полная демонстрация дизайн-системы</Text>
      </div>

      {/* 1. Typography */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Typography</Heading>

        <div className="space-y-s">
          <div>
            <Text variant="label">Body (основной текст)</Text>
            <Text variant="body">Это основной текст для контента. Используется повсеместно в UI.</Text>
          </div>

          <div>
            <Text variant="label">Caption (вторичный текст)</Text>
            <Text variant="caption">Это вторичный текст. Используется для описаний и подсказок.</Text>
          </div>

          <div>
            <Text variant="label">Label (подписи полей)</Text>
            <Text variant="label">Это подпись поля ввода</Text>
          </div>

          <div>
            <Text variant="label">Muted (приглушённый текст)</Text>
            <Text variant="muted">Это приглушённый текст. Менее заметен на фоне.</Text>
          </div>
        </div>

        <Divider />

        <div className="space-y-s">
          <div>
            <Text variant="label">Heading: Page</Text>
            <Heading variant="page">Заголовок страницы</Heading>
          </div>

          <div>
            <Text variant="label">Heading: Section</Text>
            <Heading variant="section">Заголовок секции</Heading>
          </div>

          <div>
            <Text variant="label">Amount: Neutral</Text>
            <Amount state="neutral">2,500.00 ₽</Amount>
          </div>

          <div>
            <Text variant="label">Amount: Positive (доход)</Text>
            <Amount state="positive">+5,000.00 ₽</Amount>
          </div>

          <div>
            <Text variant="label">Amount: Negative (расход)</Text>
            <Amount state="negative">-1,250.50 ₽</Amount>
          </div>
        </div>
      </Surface>

      {/* 2. Colors & Icons */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Icons & Colors</Heading>

        <div className="space-y-m">
          <div>
            <Text variant="label">Icon variants</Text>
            <div className="flex gap-4">
              <Icon icon={Heart} variant="default" />
              <Icon icon={Settings} variant="muted" />
              <Icon icon={TrendingUp} variant="accent" />
            </div>
          </div>

          <div>
            <Text variant="label">Category Icons</Text>
            <div className="flex gap-4">
              <CategoryIcon icon={ShoppingCart} backgroundColor="bg-status-success" />
              <CategoryIcon icon={TrendingUp} backgroundColor="bg-status-warning" />
              <CategoryIcon icon={AlertCircle} backgroundColor="bg-status-error" />
            </div>
          </div>
        </div>
      </Surface>

      {/* 3. Buttons */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Buttons</Heading>

        <div className="space-y-m gap-10">
          <div>
            <Text variant="label">ButtonBase (sizes)</Text>
            <div className="flex gap-2">
              <ButtonBase size="s">Small</ButtonBase>
              <ButtonBase size="m">Medium</ButtonBase>
            </div>
          </div>

          <div>
            <Text variant="label">ButtonBase (variants)</Text>
            <div className="flex gap-2">
              <ButtonBase variant="default">Primary</ButtonBase>
              <ButtonBase variant="muted">Secondary</ButtonBase>
              <ButtonBase variant="ghost">Ghost</ButtonBase>
            </div>
          </div>

          <div>
            <Text variant="label">ButtonBase (pressed state)</Text>
            <div className="flex gap-2">
              <ButtonBase variant="default" pressed>Primary Pressed</ButtonBase>
              <ButtonBase variant="muted" pressed>Secondary Pressed</ButtonBase>
              <ButtonBase variant="ghost" pressed>Ghost Pressed</ButtonBase>
            </div>
          </div>

          <div>
            <Text variant="label">ButtonBase (states)</Text>
            <div className="flex gap-2">
              <ButtonBase>Default</ButtonBase>
              <ButtonBase disabled>Disabled</ButtonBase>
            </div>
          </div>

          <div>
            <Text variant="label">IconButton</Text>
            <div className="flex gap-2">
              <IconButton variant="muted" icon={Heart} />
              <IconButton icon={Settings} />
              <IconButton icon={Trash2} />
              <IconButton icon={Home} />
            </div>
          </div>
        </div>
      </Surface>

      {/* 4. Inputs */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Inputs</Heading>

        <div className="space-y-m">
          <div>
            <Text variant="label">InputBase (default)</Text>
            <InputBase
              placeholder="Введите текст..."
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          </div>

          <div>
            <Text variant="label">InputBase (error)</Text>
            <InputBase placeholder="Ошибка!" state="error" />
          </div>

          <div>
            <Text variant="label">InputBase (disabled)</Text>
            <InputBase placeholder="Отключено" state='disabled' />
          </div>

          <div>
            <Text variant="label">SearchInput</Text>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
        </div>
      </Surface>

      {/* 5. Selection */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Selection</Heading>

        <div className="space-y-m">
          <div className="flex items-center gap-4">
            <Text variant="label">Toggle OFF:</Text>
            <Toggle enabled={toggle1} onChange={setToggle1} />
          </div>

          <div className="flex items-center gap-4">
            <Text variant="label">Toggle ON:</Text>
            <Toggle enabled={toggle2} onChange={setToggle2} />
          </div>

          <div className="flex items-center gap-4">
            <Text variant="label">Toggle disabled:</Text>
            <Toggle enabled={false} onChange={() => {}} disabled />
          </div>

          <Divider />

          <div className="space-y-s">
            <div className="flex items-center gap-2">
              <Checkmark checked={checkbox1} />
              <Text>Unchecked</Text>
            </div>

            <div className="flex items-center gap-2">
              <Checkmark checked={checkbox2} />
              <Text>Checked</Text>
            </div>
          </div>
        </div>
      </Surface>

      {/* 6. Feedback */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Feedback</Heading>

        <div className="space-y-m">
          <div>
            <Text variant="label">Badges</Text>
            <div className="flex gap-2 flex-wrap width-full">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </div>

          <Divider />

          <div>
            <Text variant="label">Dots (Status indicators)</Text>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Dot colorKey="default" size="s" />
                <Text variant="caption">Primary</Text>
              </div>
              <div className="flex items-center gap-2">
                <Dot colorKey="error" size="m" />
                <Text variant="caption">Error</Text>
              </div>
              <div className="flex items-center gap-2">
                <Dot colorKey="warning" size="l" />
                <Text variant="caption">Warning</Text>
              </div>
            </div>
          </div>
        </div>
      </Surface>

      {/* 8. Overlay Example */}
      <Surface className="p-l space-y-m">
        <Heading variant="section">Overlay</Heading>

        <div className="space-y-m">
          <Text variant="caption">
            Overlay используется для затемнения фона при модальных окнах и sheet'ах
          </Text>
          <ButtonBase onClick={() => setOverlayVisible(!overlayVisible)}>
            {overlayVisible ? 'Скрыть Overlay' : 'Показать Overlay'}
          </ButtonBase>
          <Overlay visible={overlayVisible} onClick={() => setOverlayVisible(false)} />
        </div>
      </Surface>

      {/* FAB */}
      <FAB icon={Plus} onClick={() => alert('FAB clicked!')} />

        <SelectBase
          text={"Все категории"}
          ariaHaspopup="listbox"
          hasValue={true}
          onClick={() => {alert('Select clicked')}}
          className='w-full justify-between'
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CategoryIcon
              icon={ShoppingCart}
              size="s"
              backgroundColor="bg-status-success"
            />
            <Heading as="h2">Grocery</Heading>
          </div>
          <ChevronDownIcon />
        </SelectBase>
    </div>
  );
}
