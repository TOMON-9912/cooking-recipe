import Image from "next/image";
import Link from "next/link";
import { Clock, Pencil, Users } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  recipe: Recipe;
  thumbnailUrl?: string;
  canEdit?: boolean;
};

/**
 * レシピ詳細の表示。
 *
 * @param recipe 表示するレシピ
 * @param thumbnailUrl 署名付き画像 URL
 * @param canEdit 作者本人のとき編集導線を出す
 */
export function RecipeDetailView({ recipe, thumbnailUrl, canEdit }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
          {canEdit && (
            <Link
              href={`/recipe/${recipe.id}/edit`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
            >
              <Pencil className="w-4 h-4" />
              レシピを編集
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.preparationTimeMinutes}分
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servingCount}人前
          </span>
        </div>
        {recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.categories.map((cat) => (
              <Badge key={cat.id} variant="secondary">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={thumbnailUrl}
            alt={recipe.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {recipe.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {recipe.description}
            </p>
          </CardContent>
        </Card>
      )}

      {recipe.ingredients.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">材料</h2>
            <ul className="divide-y divide-gray-100">
              {recipe.ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-gray-800">{ing.name}</span>
                  <span className="text-sm text-gray-500 text-right">
                    {ing.quantityDisplay} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recipe.instructions.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">作り方</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((inst) => (
                <li key={inst.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                    {inst.stepNumber}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700">{inst.description}</p>
                    {inst.imageUrl && (
                      <div className="relative mt-2 max-w-sm aspect-video">
                        <Image
                          src={inst.imageUrl}
                          alt={`手順 ${inst.stepNumber}`}
                          fill
                          unoptimized
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
