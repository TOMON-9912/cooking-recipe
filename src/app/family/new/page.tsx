import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";

export default function CreateFamilyPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-serif">
                    家族グループを作る
                </h1>
                <p className="text-sm text-gray-600">
                    家族の味を、ここに残すための共有スペースを作成します
                </p>
            </div>
            <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <CreateFamilyForm />
            </div>
        </div>
    );
}
