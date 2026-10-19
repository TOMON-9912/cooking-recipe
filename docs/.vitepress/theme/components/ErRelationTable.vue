<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { data } from "../../../03_database/er.data";

const tableByKey = new Map(data.tables.map((table) => [table.key, table]));

const rows = computed(() =>
  [...data.relations]
    .sort((a, b) =>
      `${a.child.table}.${a.child.column}`.localeCompare(`${b.child.table}.${b.child.column}`),
    )
    .map((relation) => {
      const child = tableByKey.get(relation.child.table)!;
      const parent = tableByKey.get(relation.parent.table)!;
      return {
        id: relation.id,
        child: { name: child.name, column: relation.child.column, href: hrefOf(child) },
        parent: { name: parent.name, column: relation.parent.column, href: hrefOf(parent) },
        kind: relation.kind,
        nullable: relation.optional ? "YES" : "NO",
        onDelete: relation.onDelete ? relation.onDelete.toUpperCase() : "NO ACTION",
      };
    }),
);

/**
 * テーブル定義書への URL を返す
 * @param table - テーブル
 * @param table.name - 表示名
 * @param table.external - public 外なら true
 * @returns URL。外部テーブルは null
 */
function hrefOf(table: { name: string; external: boolean }): string | null {
  return table.external ? null : withBase(`/03_database/tables/${table.name}`);
}
</script>

<template>
  <table class="er-relation-table">
    <thead>
      <tr>
        <th>FK（子）</th>
        <th>参照先（親）</th>
        <th>多重度</th>
        <th>NULL</th>
        <th>ON DELETE</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>
          <code>
            <a v-if="row.child.href" :href="row.child.href">{{ row.child.name }}</a>
            <template v-else>{{ row.child.name }}</template>.{{ row.child.column }}
          </code>
        </td>
        <td>
          <code>
            <a v-if="row.parent.href" :href="row.parent.href">{{ row.parent.name }}</a>
            <template v-else>{{ row.parent.name }}</template>.{{ row.parent.column }}
          </code>
        </td>
        <td>{{ row.kind }}</td>
        <td>{{ row.nullable }}</td>
        <td><code>{{ row.onDelete }}</code></td>
      </tr>
    </tbody>
  </table>
</template>
