import { notFound } from "next/navigation";
import { RecipeForm } from "@/presentation/components/recipe/RecipeForm";
import { getRecipeById } from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { getRecipeDetailUsecase } from "@/usecase/recipe/get-recipe-detail-usecase";
import { getSignedImageUrl } from "@/lib/get-signed-image-url";
import { createAuthedClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * レシピ編集画面。作者本人だけが開ける。
 */
export default async function RecipeEditPage({ params }: Props) {
  const { id } = await params;
  const { user } = await createAuthedClient();

  let recipe: Awaited<ReturnType<typeof getRecipeDetailUsecase>>;
  try {
    recipe = await getRecipeDetailUsecase(id, { getRecipeById });
  } catch {
    notFound();
  }

  if (recipe.authorId !== user.id) {
    notFound();
  }

  const thumbnailUrl = recipe.thumbnailPath
    ? await getSignedImageUrl(recipe.thumbnailPath)
    : undefined;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">レシピを編集</h1>
        <p className="text-sm text-gray-600">内容を直して、家族のレシピ帳に残します</p>
      </div>
      <div className="w-full max-w-3xl mx-auto px-4 pb-12">
        <RecipeForm recipe={recipe} thumbnailUrl={thumbnailUrl} />
      </div>
    </div>
  );
}
