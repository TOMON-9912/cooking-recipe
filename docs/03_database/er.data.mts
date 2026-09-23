import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Parser } from "@dbml/core";

export type ErColumn = {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  unique: boolean;
  nullable: boolean;
  defaultValue: string | null;
};

export type ErTable = {
  /** 表示名（例: auth.users） */
  name: string;
  /** DBML 上の参照キー（alias があれば alias） */
  key: string;
  note: string | null;
  external: boolean;
  columns: ErColumn[];
};

export type ErRelation = {
  id: string;
  kind: "1:1" | "N:1";
  child: { table: string; column: string };
  parent: { table: string; column: string };
  onDelete: string | null;
  optional: boolean;
};

export type ErData = {
  tables: ErTable[];
  relations: ErRelation[];
};

declare const data: ErData;
export { data };

const DBML_PATH = fileURLToPath(new URL("./cooking-recipe.dbml", import.meta.url));

type NormalizedModel = ReturnType<ReturnType<Parser["parse"]>["normalize"]>;

/**
 * DBML の既定値を表示用文字列にする
 * @param dbdefault - DBML パーサーの既定値オブジェクト
 * @returns 表示用文字列。未設定なら null
 */
function formatDefault(
  dbdefault: { value: string | number | boolean; type: string } | undefined,
): string | null {
  if (!dbdefault) {
    return null;
  }
  return String(dbdefault.value);
}

/**
 * 正規化済み DBML モデルを図描画用のデータに変換する
 * @param model - Parser.parse(...).normalize() の結果
 * @returns テーブルとリレーション
 */
function toErData(model: NormalizedModel): ErData {
  const tableKeyById = new Map<number, string>();
  const fkFieldIds = new Set<number>();
  const pkFieldIds = new Set<number>();
  const uniqueFieldIds = new Set<number>();

  for (const table of Object.values(model.tables)) {
    tableKeyById.set(table.id, table.alias ?? table.name);

    for (const indexId of table.indexIds) {
      const index = model.indexes[indexId];
      if (!index.pk && !index.unique) {
        continue;
      }
      for (const columnId of index.columnIds) {
        const indexColumn = model.indexColumns[columnId];
        const field = table.fieldIds
          .map((fieldId) => model.fields[fieldId])
          .find((f) => f.name === indexColumn.value);
        if (!field) {
          continue;
        }
        (index.pk ? pkFieldIds : uniqueFieldIds).add(field.id);
      }
    }
  }

  const relations: ErRelation[] = Object.values(model.refs).map((ref) => {
    const [childEndpoint, parentEndpoint] = ref.endpointIds.map((id) => model.endpoints[id]);
    const childField = model.fields[childEndpoint.fieldIds[0]];
    const parentField = model.fields[parentEndpoint.fieldIds[0]];
    fkFieldIds.add(childField.id);

    return {
      id: `${childEndpoint.tableName}.${childField.name}->${parentEndpoint.tableName}.${parentField.name}`,
      kind: childEndpoint.relation === "*" ? "N:1" : "1:1",
      child: { table: tableKeyById.get(childField.tableId)!, column: childField.name },
      parent: { table: tableKeyById.get(parentField.tableId)!, column: parentField.name },
      onDelete: ref.onDelete ?? null,
      optional: !childField.pk && !childField.not_null && !pkFieldIds.has(childField.id),
    };
  });

  const tables: ErTable[] = Object.values(model.tables).map((table) => {
    const schemaName = model.schemas[table.schemaId].name;
    const external = schemaName !== "public";

    return {
      name: external ? `${schemaName}.${table.name}` : table.name,
      key: table.alias ?? table.name,
      note: typeof table.note === "string" ? table.note : null,
      external,
      columns: table.fieldIds.map((fieldId) => {
        const field = model.fields[fieldId];
        const pk = Boolean(field.pk) || pkFieldIds.has(field.id);
        return {
          name: field.name,
          type: field.type.type_name,
          pk,
          fk: fkFieldIds.has(field.id),
          unique: Boolean(field.unique) || uniqueFieldIds.has(field.id),
          nullable: !pk && !field.not_null,
          defaultValue: formatDefault(field.dbdefault),
        };
      }),
    };
  });

  return { tables, relations };
}

export default {
  watch: [DBML_PATH],
  /**
   * DBML を読み込んで図描画用データを返す
   * @returns テーブルとリレーション
   */
  load(): ErData {
    const source = readFileSync(DBML_PATH, "utf8");
    const model = new Parser().parse(source, "dbml").normalize();
    return toErData(model);
  },
};
