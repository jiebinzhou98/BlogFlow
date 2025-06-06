'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'

export default function CreatePostPage() {
    const [title, setTitle] = useState('')

    const editor = useEditor({
        extensions: [
            StarterKit,
            CharacterCount.configure({ limit: 500 }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg w-full min-h-[70vh] outline-none focus:outline-none cursor-text text-neutral-800',
            },
        }
    }
    )

    // 加载草稿
    useEffect(() => {
        const draft = localStorage.getItem('notion_style_draft')
        if (draft) {
            const parsed = JSON.parse(draft)
            setTitle(parsed.title || '')
            editor?.commands.setContent(parsed.content || '')
        }
    }, [editor])

    // 自动保存草稿
    useEffect(() => {
        const interval = setInterval(() => {
            const draft = {
                title,
                content: editor?.getHTML() || '',
            }
            localStorage.setItem('notion_style_draft', JSON.stringify(draft))
        }, 1000)
        return () => clearInterval(interval)
    }, [title, editor])

    return (
        <main className="max-w-7xl mx-auto py-12 px-6">
            <input
                className="w-full text-4xl font-bold border-none outline-none placeholder:text-gray-400"
                placeholder="👋 Your title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            {editor && <EditorContent editor={editor} />}


            {editor && (
                <p className="text-xs text-gray-400 text-right mt-2">
                    {editor.storage.characterCount.characters()}/500 characters
                </p>
            )}
        </main>
    )
}
