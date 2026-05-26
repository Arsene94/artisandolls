import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { getBlogPostRowByIdForAdmin } from "@/lib/blog/posts";
import { updateBlogPostAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
    const { id } = await params;
    const post = await getBlogPostRowByIdForAdmin(id);
    if (!post) notFound();

    const action = updateBlogPostAction.bind(null, id);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/blog"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la blog
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-2">
                {post.title}
            </h1>
            <p className="text-sm text-silk/60 mb-8">/blog/{post.slug}</p>
            <BlogPostForm
                action={action}
                initial={post}
                submitLabel="Salvează modificările"
            />
        </main>
    );
}
