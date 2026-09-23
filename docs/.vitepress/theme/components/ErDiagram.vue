<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import { data } from "../../../03_database/er.data";
import type { ErColumn, ErRelation, ErTable } from "../../../03_database/er.data";

const props = defineProps<{
  /** 列ごとのテーブル配置（上から順に積む）。表示名または DBML の alias を指定 */
  columns: string[][];
}>();

const TABLE_WIDTH = 280;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 24;
const TABLE_PADDING_BOTTOM = 6;
const GAP_X = 100;
const GAP_Y = 32;
const MARGIN = 24;
const LANE_INSET = 30;
const BRACKET_OFFSET = 26;
const BRACKET_STEP = 12;
const MAX_PERMUTATION_SIZE = 7;

type PlacedTable = ErTable & { x: number; y: number; height: number; col: number };

type Endpoint = { x: number; y: number; dir: 1 | -1 };

type RoutedEdge = {
  relation: ErRelation;
  path: string;
  child: Endpoint;
  parent: Endpoint;
};

type Focus = { kind: "table"; key: string } | { kind: "edge"; id: string } | null;

const tableByName = new Map<string, ErTable>();
for (const table of data.tables) {
  tableByName.set(table.name, table);
  tableByName.set(table.key, table);
}

const hovered = ref<Focus>(null);
const pinned = ref<Focus>(null);
const fitToWidth = ref(true);

const active = computed<Focus>(() => hovered.value ?? pinned.value);

/**
 * テーブルの高さを求める
 * @param table - テーブル
 * @returns 高さ（px）
 */
function tableHeight(table: ErTable): number {
  return HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + TABLE_PADDING_BOTTOM;
}

/**
 * 列の行中心の y 座標を求める
 * @param table - 配置済みテーブル
 * @param columnName - 列名
 * @returns y 座標
 */
function rowCenterY(table: PlacedTable, columnName: string): number {
  const index = Math.max(
    0,
    table.columns.findIndex((column) => column.name === columnName),
  );
  return table.y + HEADER_HEIGHT + index * ROW_HEIGHT + ROW_HEIGHT / 2;
}

const diagramRelations = computed(() => {
  const keys = new Set(
    props.columns.flat().map((name) => tableByName.get(name)?.key ?? name),
  );
  return data.relations.filter(
    (relation) => keys.has(relation.child.table) && keys.has(relation.parent.table),
  );
});

/**
 * 同一列内のリレーションが左右どちら側を使うか（先頭列だけ左側）
 * @param col - 列インデックス
 * @returns 1 = 右側、-1 = 左側
 */
function bracketSide(col: number): 1 | -1 {
  return col === 0 ? -1 : 1;
}

const layout = computed(() => {
  const placed = new Map<string, PlacedTable>();
  const leftBrackets = diagramRelations.value.filter((relation) => {
    const childCol = props.columns.findIndex((names) =>
      names.some((name) => tableByName.get(name)?.key === relation.child.table),
    );
    const parentCol = props.columns.findIndex((names) =>
      names.some((name) => tableByName.get(name)?.key === relation.parent.table),
    );
    return childCol === 0 && parentCol === 0;
  }).length;

  const offsetX = MARGIN + (leftBrackets > 0 ? BRACKET_OFFSET + leftBrackets * BRACKET_STEP : 0);

  props.columns.forEach((names, col) => {
    let y = MARGIN;
    for (const name of names) {
      const table = tableByName.get(name);
      if (!table) {
        continue;
      }
      const height = tableHeight(table);
      placed.set(table.key, {
        ...table,
        x: offsetX + col * (TABLE_WIDTH + GAP_X),
        y,
        height,
        col,
      });
      y += height + GAP_Y;
    }
  });

  return { placed, offsetX };
});

/**
 * 隣接列間のエッジ同士の交差数を数える
 * @param edges - 左端 y・右端 y・レーン x を持つエッジ
 * @returns 交差数
 */
function countCrossings(edges: { yL: number; yR: number; lane: number }[]): number {
  let crossings = 0;
  for (const a of edges) {
    const top = Math.min(a.yL, a.yR);
    const bottom = Math.max(a.yL, a.yR);
    for (const b of edges) {
      if (a === b) {
        continue;
      }
      if (a.lane < b.lane && b.yL > top && b.yL < bottom) {
        crossings += 1;
      }
      if (a.lane > b.lane && b.yR > top && b.yR < bottom) {
        crossings += 1;
      }
    }
  }
  return crossings;
}

/**
 * 配列の全順列を列挙する
 * @param items - 要素
 * @returns 順列の配列
 */
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) {
    return [items];
  }
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [
      item,
      ...rest,
    ]),
  );
}

/**
 * 端点マーカー（クロウフット記法）のパスを作る
 * @param point - 端点
 * @param kind - one = 必ず 1、many = 多
 * @returns SVG path の d 属性
 */
function markerPath(point: Endpoint, kind: "one" | "many"): string {
  const { x, y, dir } = point;
  if (kind === "one") {
    return `M ${x + dir * 8} ${y - 6} V ${y + 6} M ${x + dir * 13} ${y - 6} V ${y + 6}`;
  }
  return [
    `M ${x + dir * 14} ${y} L ${x} ${y - 7}`,
    `M ${x + dir * 14} ${y} L ${x} ${y + 7}`,
    `M ${x + dir * 14} ${y} L ${x} ${y}`,
  ].join(" ");
}

const routed = computed(() => {
  const { placed } = layout.value;
  const gaps = new Map<number, { relation: ErRelation; left: PlacedTable; right: PlacedTable; yL: number; yR: number; childOnLeft: boolean }[]>();
  const brackets = new Map<string, ErRelation[]>();
  const edges: RoutedEdge[] = [];

  for (const relation of diagramRelations.value) {
    const child = placed.get(relation.child.table);
    const parent = placed.get(relation.parent.table);
    if (!child || !parent) {
      continue;
    }
    if (child.col === parent.col) {
      const key = `${child.col}:${bracketSide(child.col)}`;
      brackets.set(key, [...(brackets.get(key) ?? []), relation]);
      continue;
    }
    const childOnLeft = child.col < parent.col;
    const left = childOnLeft ? child : parent;
    const right = childOnLeft ? parent : child;
    const yL = rowCenterY(left, childOnLeft ? relation.child.column : relation.parent.column);
    const yR = rowCenterY(right, childOnLeft ? relation.parent.column : relation.child.column);
    const gap = left.col;
    gaps.set(gap, [...(gaps.get(gap) ?? []), { relation, left, right, yL, yR, childOnLeft }]);
  }

  const rightBracketCount = (col: number) => brackets.get(`${col}:1`)?.length ?? 0;

  for (const [gap, gapEdges] of gaps) {
    const gapLeft = layout.value.offsetX + gap * (TABLE_WIDTH + GAP_X) + TABLE_WIDTH;
    const gapRight = gapLeft + GAP_X;
    const laneStart = gapLeft + LANE_INSET + rightBracketCount(gap) * BRACKET_STEP;
    const laneEnd = gapRight - LANE_INSET;
    const laneAt = (index: number) =>
      gapEdges.length === 1
        ? (laneStart + laneEnd) / 2
        : laneStart + ((laneEnd - laneStart) * index) / (gapEdges.length - 1);

    const candidates =
      gapEdges.length <= MAX_PERMUTATION_SIZE
        ? permutations(gapEdges)
        : [[...gapEdges].sort((a, b) => Math.abs(b.yL - b.yR) - Math.abs(a.yL - a.yR))];

    let best = candidates[0];
    let bestScore = Number.POSITIVE_INFINITY;
    for (const order of candidates) {
      const score = countCrossings(
        order.map((edge, index) => ({ yL: edge.yL, yR: edge.yR, lane: laneAt(index) })),
      );
      if (score < bestScore) {
        best = order;
        bestScore = score;
      }
    }

    best.forEach((edge, index) => {
      const lane = laneAt(index);
      const leftPoint: Endpoint = { x: edge.left.x + TABLE_WIDTH, y: edge.yL, dir: 1 };
      const rightPoint: Endpoint = { x: edge.right.x, y: edge.yR, dir: -1 };
      const path =
        edge.yL === edge.yR
          ? `M ${leftPoint.x} ${leftPoint.y} H ${rightPoint.x}`
          : `M ${leftPoint.x} ${leftPoint.y} H ${lane} V ${rightPoint.y} H ${rightPoint.x}`;
      edges.push({
        relation: edge.relation,
        path,
        child: edge.childOnLeft ? leftPoint : rightPoint,
        parent: edge.childOnLeft ? rightPoint : leftPoint,
      });
    });
  }

  for (const [key, relations] of brackets) {
    const side = Number(key.split(":")[1]) as 1 | -1;
    relations.forEach((relation, index) => {
      const child = placed.get(relation.child.table)!;
      const parent = placed.get(relation.parent.table)!;
      const edgeX = side === 1 ? child.x + TABLE_WIDTH : child.x;
      const bracketX = edgeX + side * (BRACKET_OFFSET + index * BRACKET_STEP);
      const childPoint: Endpoint = { x: edgeX, y: rowCenterY(child, relation.child.column), dir: side };
      const parentPoint: Endpoint = { x: edgeX, y: rowCenterY(parent, relation.parent.column), dir: side };
      edges.push({
        relation,
        path: `M ${childPoint.x} ${childPoint.y} H ${bracketX} V ${parentPoint.y} H ${parentPoint.x}`,
        child: childPoint,
        parent: parentPoint,
      });
    });
  }

  const lastCol = props.columns.length - 1;
  const width =
    layout.value.offsetX +
    props.columns.length * TABLE_WIDTH +
    lastCol * GAP_X +
    MARGIN +
    (rightBracketCount(lastCol) > 0 ? BRACKET_OFFSET + rightBracketCount(lastCol) * BRACKET_STEP : 0);
  const height =
    Math.max(...[...placed.values()].map((table) => table.y + table.height)) + MARGIN;

  return { edges, width, height };
});

const activeState = computed(() => {
  const focus = active.value;
  if (!focus) {
    return null;
  }
  const edgeIds = new Set<string>();
  const tableKeys = new Set<string>();
  const columnKeys = new Set<string>();

  for (const { relation } of routed.value.edges) {
    const matches =
      focus.kind === "edge"
        ? relation.id === focus.id
        : relation.child.table === focus.key || relation.parent.table === focus.key;
    if (!matches) {
      continue;
    }
    edgeIds.add(relation.id);
    tableKeys.add(relation.child.table);
    tableKeys.add(relation.parent.table);
    columnKeys.add(`${relation.child.table}.${relation.child.column}`);
    columnKeys.add(`${relation.parent.table}.${relation.parent.column}`);
  }
  if (focus.kind === "table") {
    tableKeys.add(focus.key);
  }
  return { edgeIds, tableKeys, columnKeys };
});

const tablesToRender = computed(() => [...layout.value.placed.values()]);

const tableByKey = computed(() => layout.value.placed);

/**
 * リレーションの説明文を作る
 * @param relation - リレーション
 * @returns 説明文
 */
function describeRelation(relation: ErRelation): string {
  const child = tableByKey.value.get(relation.child.table)?.name ?? relation.child.table;
  const parent = tableByKey.value.get(relation.parent.table)?.name ?? relation.parent.table;
  const parts = [
    `${child}.${relation.child.column} → ${parent}.${relation.parent.column}`,
    relation.kind === "1:1" ? "1:1" : "N:1",
    relation.optional ? "NULL 可" : "必須",
  ];
  if (relation.onDelete) {
    parts.push(`ON DELETE ${relation.onDelete.toUpperCase()}`);
  }
  return parts.join("　・　");
}

const statusText = computed(() => {
  const focus = active.value;
  if (!focus) {
    return "テーブルにカーソルを合わせると関連だけを強調表示します。クリックで固定、テーブル名で定義書へ移動します。";
  }
  if (focus.kind === "edge") {
    const relation = routed.value.edges.find((edge) => edge.relation.id === focus.id)?.relation;
    return relation ? describeRelation(relation) : "";
  }
  const table = tableByKey.value.get(focus.key);
  if (!table) {
    return "";
  }
  const outgoing = routed.value.edges.filter((edge) => edge.relation.child.table === focus.key).length;
  const incoming = routed.value.edges.filter((edge) => edge.relation.parent.table === focus.key).length;
  return `${table.name}${table.note ? ` — ${table.note}` : ""}　・　参照 ${outgoing} / 被参照 ${incoming}`;
});

/**
 * テーブル定義書への URL を返す
 * @param table - テーブル
 * @returns URL。外部テーブルは null
 */
function tableHref(table: ErTable): string | null {
  return table.external ? null : withBase(`/03_database/tables/${table.name}`);
}

/**
 * 列のバッジ文字列を返す
 * @param column - 列
 * @returns PK / UK / FK。なければ null
 */
function badgeOf(column: ErColumn): "PK" | "UK" | "FK" | null {
  if (column.pk) {
    return "PK";
  }
  if (column.unique) {
    return "UK";
  }
  if (column.fk) {
    return "FK";
  }
  return null;
}

/**
 * 列のツールチップ文字列を作る
 * @param column - 列
 * @returns ツールチップ
 */
function columnTitle(column: ErColumn): string {
  const parts = [column.name, column.type, column.nullable ? "NULL" : "NOT NULL"];
  if (column.defaultValue) {
    parts.push(`DEFAULT ${column.defaultValue}`);
  }
  return parts.join(" ");
}

/**
 * テーブルのクリックで強調表示を固定・解除する
 * @param key - テーブルキー
 */
function togglePin(key: string): void {
  pinned.value =
    pinned.value?.kind === "table" && pinned.value.key === key ? null : { kind: "table", key };
}

/**
 * 背景クリックで固定を解除する
 */
function clearPin(): void {
  pinned.value = null;
}
</script>

<template>
  <div class="er-diagram">
    <div class="er-toolbar">
      <p class="er-status" :class="{ 'is-focused': active }">{{ statusText }}</p>
      <button type="button" class="er-toggle" @click="fitToWidth = !fitToWidth">
        {{ fitToWidth ? "原寸で表示" : "幅に合わせる" }}
      </button>
    </div>
    <div class="er-canvas" :class="{ 'is-fit': fitToWidth }">
      <svg
        :viewBox="`0 0 ${routed.width} ${routed.height}`"
        :width="fitToWidth ? '100%' : routed.width"
        :height="fitToWidth ? undefined : routed.height"
        role="img"
        aria-label="ER diagram"
        @mouseleave="hovered = null"
      >
        <rect
          class="er-background"
          x="0"
          y="0"
          :width="routed.width"
          :height="routed.height"
          @click="clearPin"
        />

        <g
          v-for="edge in routed.edges"
          :key="edge.relation.id"
          class="er-edge"
          :class="{
            'is-active': activeState?.edgeIds.has(edge.relation.id),
            'is-dim': activeState && !activeState.edgeIds.has(edge.relation.id),
            'is-optional': edge.relation.optional,
          }"
          @mouseenter="hovered = { kind: 'edge', id: edge.relation.id }"
          @mouseleave="hovered = null"
        >
          <title>{{ describeRelation(edge.relation) }}</title>
          <path class="er-edge-hit" :d="edge.path" />
          <path class="er-edge-line" :d="edge.path" />
          <path class="er-edge-marker" :d="markerPath(edge.parent, 'one')" />
          <path
            class="er-edge-marker"
            :d="markerPath(edge.child, edge.relation.kind === '1:1' ? 'one' : 'many')"
          />
          <circle
            v-if="edge.relation.optional"
            class="er-edge-optional"
            :cx="edge.child.x + edge.child.dir * 20"
            :cy="edge.child.y"
            r="3.5"
          />
        </g>

        <g
          v-for="table in tablesToRender"
          :key="table.key"
          class="er-table"
          :class="{
            'is-external': table.external,
            'is-pinned': pinned?.kind === 'table' && pinned.key === table.key,
            'is-dim': activeState && !activeState.tableKeys.has(table.key),
          }"
          @mouseenter="hovered = { kind: 'table', key: table.key }"
          @click="togglePin(table.key)"
        >
          <title>{{ table.note ?? table.name }}</title>
          <rect
            class="er-table-body"
            :x="table.x"
            :y="table.y"
            :width="TABLE_WIDTH"
            :height="table.height"
            rx="8"
          />
          <path
            class="er-table-header"
            :d="`M ${table.x} ${table.y + HEADER_HEIGHT} V ${table.y + 8} Q ${table.x} ${table.y} ${table.x + 8} ${table.y} H ${table.x + TABLE_WIDTH - 8} Q ${table.x + TABLE_WIDTH} ${table.y} ${table.x + TABLE_WIDTH} ${table.y + 8} V ${table.y + HEADER_HEIGHT} Z`"
          />
          <a v-if="tableHref(table)" :href="tableHref(table)!" class="er-table-link" @click.stop>
            <text class="er-table-name" :x="table.x + 12" :y="table.y + 23">{{ table.name }}</text>
          </a>
          <text v-else class="er-table-name" :x="table.x + 12" :y="table.y + 23">{{ table.name }}</text>
          <text
            v-if="table.external"
            class="er-table-tag"
            :x="table.x + TABLE_WIDTH - 12"
            :y="table.y + 23"
            text-anchor="end"
          >
            Supabase Auth
          </text>

          <g
            v-for="(column, index) in table.columns"
            :key="column.name"
            class="er-row"
            :class="{ 'is-active': activeState?.columnKeys.has(`${table.key}.${column.name}`) }"
          >
            <title>{{ columnTitle(column) }}</title>
            <rect
              class="er-row-bg"
              :x="table.x + 1"
              :y="table.y + HEADER_HEIGHT + index * ROW_HEIGHT"
              :width="TABLE_WIDTH - 2"
              :height="ROW_HEIGHT"
            />
            <g v-if="badgeOf(column)">
              <rect
                class="er-badge"
                :class="`er-badge--${badgeOf(column)!.toLowerCase()}`"
                :x="table.x + 10"
                :y="table.y + HEADER_HEIGHT + index * ROW_HEIGHT + 5"
                width="26"
                height="14"
                rx="3"
              />
              <text
                class="er-badge-text"
                :x="table.x + 23"
                :y="table.y + HEADER_HEIGHT + index * ROW_HEIGHT + 15.5"
                text-anchor="middle"
              >
                {{ badgeOf(column) }}
              </text>
            </g>
            <text
              class="er-col-name"
              :class="{ 'is-fk': column.fk, 'is-pk': column.pk }"
              :x="table.x + 44"
              :y="table.y + HEADER_HEIGHT + index * ROW_HEIGHT + 16"
            >
              {{ column.name }}
            </text>
            <text
              class="er-col-type"
              :x="table.x + TABLE_WIDTH - 12"
              :y="table.y + HEADER_HEIGHT + index * ROW_HEIGHT + 16"
              text-anchor="end"
            >
              {{ column.type }}{{ column.nullable ? "?" : "" }}
            </text>
          </g>
        </g>
      </svg>
    </div>
    <ul class="er-legend">
      <li><span class="er-legend-badge er-badge--pk">PK</span>主キー</li>
      <li><span class="er-legend-badge er-badge--fk">FK</span>外部キー（緑の列名も FK）</li>
      <li><span class="er-legend-badge er-badge--uk">UK</span>UNIQUE</li>
      <li><code>type?</code>NULL 許可</li>
      <li>
        <svg width="44" height="16" aria-hidden="true">
          <path class="er-legend-line" d="M 2 8 H 42 M 30 2 V 14 M 35 2 V 14 M 2 1 L 16 8 L 2 15" />
        </svg>
        多 対 1（左が子、縦 2 本が親）
      </li>
      <li>
        <svg width="44" height="16" aria-hidden="true">
          <path class="er-legend-line is-dashed" d="M 2 8 H 42" />
          <circle class="er-legend-circle" cx="22" cy="8" r="3.5" />
        </svg>
        NULL 可の FK
      </li>
    </ul>
  </div>
</template>
