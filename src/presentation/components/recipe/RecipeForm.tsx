"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IngredientUI, InstructionUI } from "./recipe-create-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeCategorySection } from "./RecipeCategorySection";
import { RecipeGeneralSection } from "./RecipeGeneralSection";
import { RecipeIngredientsSection } from "./RecipeIngredientsSection";
import { RecipeInstructionsSection } from "./RecipeInstructionsSection";
import { createRecipeAction } from "@/app/recipe/new/action";
import { updateRecipeAction } from "@/app/recipe/[id]/edit/action";
import { uploadRecipeThumbnailAction } from "@/app/recipe/new/upload-recipe-thumbnail-action";
import { resolveThumbnailPath } from "./recipe-thumbnail-path";
import { RECIPE_THUMBNAIL_MAX_BYTES } from "@/constants/recipe-thumbnail-upload";
import type { Recipe } from "@/types/recipe";

type Props = {
    recipe?: Recipe;
    thumbnailUrl?: string;
};

/**
 * レシピの作成・編集フォーム。
 *
 * @param recipe 編集時の初期値。無いときは新規作成
 * @param thumbnailUrl 編集時の既存画像 URL
 */
export function RecipeForm({ recipe, thumbnailUrl }: Props) {
    const isEdit = recipe != null;
    // 編集では「保存 = 公開」になるため、下書きかどうかで文言を変える
    const submitLabel = !isEdit
        ? "レシピを登録"
        : recipe.isDraft
          ? "公開して保存"
          : "変更を保存";
    const draftLabel = !isEdit
        ? "下書き保存"
        : recipe.isDraft
          ? "下書きのまま保存"
          : "下書きに戻す";
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState(recipe?.title ?? "");
    const [minutes, setMinutes] = useState<number | "">(
        recipe?.preparationTimeMinutes ?? "",
    );
    const [servingCount, setServingCount] = useState<number | "">(
        recipe?.servingCount ?? "",
    );
    const [comment, setComment] = useState(recipe?.description ?? "");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        thumbnailUrl ?? null,
    );

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        recipe?.categories.map((cat) => cat.id) ?? [],
    );

    const [ingredients, setIngredients] = useState<IngredientUI[]>(
        recipe && recipe.ingredients.length > 0
            ? recipe.ingredients.map((ing, idx) => ({
                id: ing.id,
                name: ing.name,
                quantity: ing.quantityDisplay,
                unit: ing.unit,
                note: ing.note,
                order: idx,
            }))
            : [{ id: crypto.randomUUID(), name: "", quantity: "", unit: "", order: 0 }],
    );

    const [instructions, setInstructions] = useState<InstructionUI[]>(
        recipe && recipe.instructions.length > 0
            ? recipe.instructions.map((inst) => ({
                id: inst.id,
                stepNumber: inst.stepNumber,
                description: inst.description,
                images: [],
            }))
            : [{ id: crypto.randomUUID(), stepNumber: 1, description: "", images: [] }],
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setError(null);
        if (file.size > RECIPE_THUMBNAIL_MAX_BYTES) {
            setError(
                `画像は ${Math.floor(RECIPE_THUMBNAIL_MAX_BYTES / (1024 * 1024))}MB 以下にしてください`,
            );
            return;
        }

        setImagePreview((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return URL.createObjectURL(file);
        });
        setImageFile(file);
    };

    const handleImageClear = () => {
        setImagePreview((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return null;
        });
        setImageFile(null);
    };

    const addIngredient = () => {
        setIngredients((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: "", quantity: "", unit: "", order: prev.length },
        ]);
    };

    const removeIngredient = (id: string) => {
        setIngredients((prev) => {
            const filtered = prev.filter((ing) => ing.id !== id);
            return filtered.map((ing, idx) => ({ ...ing, order: idx }));
        });
    };

    const addInstruction = () => {
        setInstructions((prev) => [
            ...prev,
            { id: crypto.randomUUID(), stepNumber: prev.length + 1, description: "", images: [] },
        ]);
    };

    const addInstructionImage = (instructionId: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setInstructions((prev) =>
                prev.map((v) =>
                    v.id === instructionId ? { ...v, images: [...v.images, { preview: reader.result as string, file }] } : v
                )
            );
        };
        reader.readAsDataURL(file);
    };

    const removeInstructionImage = (instructionId: string, imageIndex: number) => {
        setInstructions((prev) =>
            prev.map((v) =>
                v.id === instructionId ? { ...v, images: v.images.filter((_, i) => i !== imageIndex) } : v
            )
        );
    };

    const removeInstruction = (id: string) => {
        setInstructions((prev) => {
            const filtered = prev.filter((inst) => inst.id !== id);
            return filtered.map((inst, idx) => ({ ...inst, stepNumber: idx + 1 }));
        });
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    const buildFormData = (isDraft: boolean, thumbnailPath?: string) => ({
        title,
        description: comment,
        thumbnailPath,
        servingCount: Number(servingCount),
        preparationTimeMinutes: Number(minutes),
        isDraft,
        categoryIds: selectedCategories,
        ingredients: ingredients.map((ing, idx) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            note: ing.note,
            order: idx,
        })),
        instructions: instructions.map((inst) => ({
            stepNumber: inst.stepNumber,
            description: inst.description,
        })),
    });

    const handleSubmit = (isDraft: boolean) => {
        setError(null);
        startTransition(async () => {
            let uploadedPath: string | undefined;

            // サムネイルは原寸のまま送る。流れは app/recipe/new/レシピ新規と画像.md
            if (imageFile) {
                try {
                    const fd = new FormData();
                    fd.append("file", imageFile);
                    const uploadResult = await uploadRecipeThumbnailAction(fd);
                    if (!uploadResult.success) {
                        throw new Error(uploadResult.error);
                    }
                    uploadedPath = uploadResult.path;
                } catch (e) {
                    setError(e instanceof Error ? e.message : "画像のアップロードに失敗しました");
                    return;
                }
            }

            const thumbnailPath = resolveThumbnailPath({
                isEdit,
                uploadedPath,
                hasPreview: imagePreview != null,
                currentPath: recipe?.thumbnailPath,
            });

            const payload = buildFormData(isDraft, thumbnailPath ?? undefined);
            const result = isEdit
                ? await updateRecipeAction({
                    ...payload,
                    id: recipe.id,
                    thumbnailPath,
                })
                : await createRecipeAction(payload);
            if (result.success) {
                router.push(`/recipe/${result.recipe.id}`);
            } else {
                setError(result.error);
            }
        });
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(false);
            }}
        >
            <Card className="p-6">
                <CardContent className="pt-0 space-y-8">
                <RecipeGeneralSection
                    title={title}
                    setTitle={setTitle}
                    minutes={minutes}
                    setMinutes={setMinutes}
                    servingCount={servingCount}
                    setServingCount={setServingCount}
                    comment={comment}
                    setComment={setComment}
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    onImageClear={handleImageClear}
                />

                <RecipeCategorySection
                    selectedCategories={selectedCategories}
                    onToggleCategory={toggleCategory}
                />

                <RecipeIngredientsSection
                    ingredients={ingredients}
                    onIngredientsChange={setIngredients}
                    onAddIngredient={addIngredient}
                    onRemoveIngredient={removeIngredient}
                />

                <RecipeInstructionsSection
                    instructions={instructions}
                    onInstructionsChange={setInstructions}
                    onAddInstruction={addInstruction}
                    onAddInstructionImage={addInstructionImage}
                    onRemoveInstructionImage={removeInstructionImage}
                    onRemoveInstruction={removeInstruction}
                />

                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <section className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        className="order-2 sm:order-1"
                        disabled={isPending}
                        onClick={() => handleSubmit(true)}
                    >
                        {isPending ? "保存中..." : draftLabel}
                    </Button>
                    <Button
                        type="submit"
                        className="order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                        disabled={isPending}
                    >
                        {isPending
                            ? isEdit
                                ? "保存中..."
                                : "登録中..."
                            : submitLabel}
                    </Button>
                </section>
                </CardContent>
            </Card>
        </form>
    );
}
