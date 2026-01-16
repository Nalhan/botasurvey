import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SurveyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
