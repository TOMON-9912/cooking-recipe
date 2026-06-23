import { redirect } from "next/navigation";

/**
 * 旧 URL `/family/new` から `/family` へリダイレクトする
 */
export default function LegacyCreateFamilyPage() {
    redirect("/family");
}
