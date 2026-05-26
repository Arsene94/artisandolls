import Link from "next/link";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { createBlogPostAction } from "../actions";

export default function NewBlogPostPage() {
    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/blog"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la blog
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                Articol nou
            </h1>
            <BlogPostForm action={createBlogPostAction} submitLabel="Publică articolul" />
        </main>
    );
}
