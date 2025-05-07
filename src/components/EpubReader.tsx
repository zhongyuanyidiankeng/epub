import React, { useRef, useEffect, useState, useCallback } from "react";
import { pinyin } from "pinyin-pro";
import { Book, Rendition, NavItem } from "epubjs";
import Navigation from 'epubjs/types/navigation';
import type { Contents } from 'epubjs';

// 动态引入 epubjs 类型
type EpubOptions = {
    requestHeaders?: { [key: string]: string };
    openAs?: string;
    worker?: boolean;
};
let Epub: (urlOrData: string | ArrayBuffer, options?: EpubOptions) => Book;

interface EpubReaderProps {
    fileUrl: string;
    showPinyin?: boolean;
}

export default function EpubReader({ fileUrl, showPinyin = false }: EpubReaderProps) {
    const containerRef = useRef<HTMLDivElement>(null!);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState<NavItem[]>([]);
    const [showToc, setShowToc] = useState(false);

    const registerHooks = useCallback((rendition: Rendition) => {
        rendition.hooks.content.clear();

        // Always register base style
        rendition.hooks.content.register((contents: Contents) => {
            const doc = contents.document;
            const style = doc.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: 'EPUBFallbackFont';
                    src: local('Noto Serif SC'), local('SimSun'), local('serif');
                }
                body {
                    font-family: 'EPUBFallbackFont', serif !important;
                }
            `;
            doc.head.appendChild(style);
        });

        // Register pinyin logic if enabled
        if (showPinyin) {
            rendition.hooks.content.register(async (contents: Contents) => {
                const doc = contents.document;
                const style = doc.createElement('style');
                style.textContent = `
                    .pinyin-text {
                        position: relative;
                        display: inline-block;
                        margin-top: 1.5em;
                    }
                    .pinyin-annotation {
                        position: absolute;
                        top: -1.5em;
                        left: 0;
                        width: 100%;
                        text-align: center;
                        font-size: 0.7em;
                        color: #f59e0b;
                        line-height: 1;
                        pointer-events: none;
                    }
                `;
                doc.head.appendChild(style);

                const textNodes: Node[] = [];
                function findTextNodes(node: Node) {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
                        textNodes.push(node);
                    } else {
                        for (let i = 0; i < node.childNodes.length; i++) {
                            findTextNodes(node.childNodes[i]);
                        }
                    }
                }

                findTextNodes(doc.body);

                textNodes.forEach(textNode => {
                    const text = textNode.textContent || '';
                    const parent = textNode.parentNode;
                    if (!parent) return;

                    if (!/[\u4e00-\u9fa5]/.test(text)) {
                        return;
                    }

                    const fragment = doc.createDocumentFragment();
                    let currentTextBuffer = '';

                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        if (/[\u4e00-\u9fa5]/.test(char)) {
                            if (currentTextBuffer) {
                                fragment.appendChild(doc.createTextNode(currentTextBuffer));
                                currentTextBuffer = '';
                            }

                            const pinyinText = pinyin(char, { toneType: 'symbol', nonZh: 'removed' });
                            const span = doc.createElement('span');
                            span.className = 'pinyin-text';
                            const annotation = doc.createElement('span');
                            annotation.className = 'pinyin-annotation';
                            annotation.textContent = pinyinText;
                            span.appendChild(annotation);
                            span.appendChild(doc.createTextNode(char));
                            fragment.appendChild(span);
                        } else {
                            currentTextBuffer += char;
                        }
                    }

                    if (currentTextBuffer) {
                        fragment.appendChild(doc.createTextNode(currentTextBuffer));
                    }

                    parent.replaceChild(fragment, textNode);
                });
            });
        }
    }, [showPinyin]);

    useEffect(() => {
        let cancelled = false;
        setError(null);
        setLoading(true);
        (async () => {
            try {
                Epub = (await import("epubjs")).default;
                if (bookRef.current) {
                    bookRef.current.destroy();
                    bookRef.current = null;
                }
                bookRef.current = Epub(fileUrl);
                renditionRef.current = bookRef.current.renderTo(containerRef.current!, {
                    width: "100%",
                    height: "100%",
                    flow: "scrolled-doc",
                    manager: "continuous"
                });
                
                // Register hooks before display
                if (renditionRef.current) {
                    registerHooks(renditionRef.current);
                }
                
                renditionRef.current.display();
                renditionRef.current.on("rendered", () => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
                bookRef.current.loaded.navigation.then((nav: Navigation) => {
                    if (!cancelled) setToc(nav.toc || []);
                });
            } catch {
                setError("epub解析失败，请检查文件格式");
            }
        })();
        return () => {
            cancelled = true;
            if (renditionRef.current) renditionRef.current.destroy();
            if (bookRef.current) bookRef.current.destroy();
            renditionRef.current = null;
            bookRef.current = null;
        };
    }, [fileUrl, registerHooks]);

    useEffect(() => {
        if (!loading && renditionRef.current) {
            registerHooks(renditionRef.current);
            renditionRef.current.display();
        }
    }, [showPinyin, loading, registerHooks]);

    // 跳转到指定章节
    const handleTocClick = (href: string) => {
        setShowToc(false);
        if (renditionRef.current) {
            renditionRef.current.display(href);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">加载中...</div>}
            {error && <div className="text-red-500 p-4">{error}</div>}
            <button
                className="absolute left-2 top-2 z-20 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                onClick={() => setShowToc((v) => !v)}
            >
                {showToc ? "关闭目录" : "显示目录"}
            </button>
            {showToc && (
                <div className="absolute left-2 top-10 z-20 bg-white shadow rounded p-2 max-h-[80vh] overflow-y-auto w-64">
                    <div className="font-bold mb-2">目录</div>
                    <ul className="space-y-1">
                        {toc.map((item) => (
                            <li key={item.id}>
                                <button
                                    className="text-left w-full hover:bg-blue-100 px-2 py-1 rounded"
                                    onClick={() => handleTocClick(item.href)}
                                >
                                    {item.label}
                                </button>
                                {item.subitems && item.subitems.length > 0 && (
                                    <ul className="ml-4">
                                        {item.subitems.map((sub: NavItem) => (
                                            <li key={sub.id}>
                                                <button
                                                    className="text-left w-full hover:bg-blue-100 px-2 py-1 rounded"
                                                    onClick={() => handleTocClick(sub.href)}
                                                >
                                                    {sub.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full overflow-y-auto" style={{ height: '100%' }} />
        </div>
    );
}

