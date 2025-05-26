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
                    .pinyin-container {
                        line-height: 2.2;
                        margin: 0.5em 0;
                    }
                    .pinyin-text {
                        position: relative;
                        display: inline-block;
                        margin: 0 0.1em;
                        vertical-align: baseline;
                        min-width: 1em;
                        text-align: center;
                    }
                    .pinyin-annotation {
                        position: absolute;
                        top: -1.8em;
                        left: 50%;
                        transform: translateX(-50%);
                        white-space: nowrap;
                        font-size: 0.65em;
                        color: #f59e0b;
                        line-height: 1;
                        pointer-events: none;
                        font-weight: normal;
                        z-index: 1;
                    }
                    .pinyin-char {
                        display: inline-block;
                        position: relative;
                        z-index: 0;
                    }
                    .multi-pinyin {
                        color: #ef4444;
                        font-weight: 500;
                    }
                    p, div {
                        margin-bottom: 1em;
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

                // 多音词字典 - 常见的多音字及其可能的读音
                const multiPinyinDict: { [key: string]: string[] } = {
                    '行': ['xíng', 'háng'],
                    '中': ['zhōng', 'zhòng'],
                    '长': ['cháng', 'zhǎng'],
                    '重': ['zhòng', 'chóng'],
                    '发': ['fā', 'fà'],
                    '数': ['shù', 'shǔ'],
                    '为': ['wéi', 'wèi'],
                    '得': ['dé', 'de', 'děi'],
                    '了': ['le', 'liǎo'],
                    '的': ['de', 'dí', 'dì'],
                    '地': ['dì', 'de'],
                    '着': ['zhe', 'zháo', 'zhuó'],
                    '看': ['kàn', 'kān'],
                    '处': ['chù', 'chǔ'],
                    '都': ['dōu', 'dū'],
                    '还': ['hái', 'huán'],
                    '会': ['huì', 'kuài'],
                    '要': ['yào', 'yāo'],
                    '应': ['yīng', 'yìng'],
                    '便': ['biàn', 'pián'],
                    '当': ['dāng', 'dàng'],
                    '正': ['zhèng', 'zhēng'],
                    '只': ['zhǐ', 'zhī'],
                    '种': ['zhǒng', 'zhòng'],
                    '间': ['jiān', 'jiàn'],
                    '分': ['fēn', 'fèn'],
                    '干': ['gān', 'gàn'],
                    '几': ['jǐ', 'jī'],
                    '少': ['shǎo', 'shào'],
                    '更': ['gèng', 'gēng'],
                    '过': ['guò', 'guo'],
                    '把': ['bǎ', 'bà'],
                    '好': ['hǎo', 'hào'],
                    '教': ['jiāo', 'jiào'],
                    '乐': ['lè', 'yuè'],
                    '难': ['nán', 'nàn'],
                    '切': ['qiē', 'qiè'],
                    '思': ['sī', 'sāi'],
                    '调': ['tiáo', 'diào'],
                    '血': ['xuè', 'xiě'],
                    '压': ['yā', 'yà'],
                    '载': ['zài', 'zǎi'],
                    '作': ['zuò', 'zuō'],
                    '背': ['bèi', 'bēi'],
                    '薄': ['báo', 'bó', 'bò'],
                    '藏': ['cáng', 'zàng'],
                    '差': ['chā', 'chà', 'chāi', 'cī'],
                    '称': ['chēng', 'chèn', 'chèng'],
                    '传': ['chuán', 'zhuàn'],
                    '弹': ['dàn', 'tán'],
                    '倒': ['dǎo', 'dào'],
                    '度': ['dù', 'duó'],
                    '恶': ['è', 'wù', 'ě'],
                    '佛': ['fó', 'fú'],
                    '供': ['gōng', 'gòng'],
                    '冠': ['guān', 'guàn'],
                    '华': ['huá', 'huà', 'huā'],
                    '将': ['jiāng', 'jiàng'],
                    '角': ['jiǎo', 'jué'],
                    '解': ['jiě', 'jiè', 'xiè'],
                    '禁': ['jīn', 'jìn'],
                    '卷': ['juàn', 'juǎn'],
                    '空': ['kōng', 'kòng'],
                    '累': ['léi', 'lěi', 'lèi'],
                    '量': ['liáng', 'liàng'],
                    '模': ['mó', 'mú'],
                    '泊': ['bó', 'pō'],
                    '朴': ['pǔ', 'pò', 'piáo'],
                    '铺': ['pū', 'pù'],
                    '强': ['qiáng', 'qiǎng', 'jiàng'],
                    '任': ['rèn', 'rén'],
                    '散': ['sàn', 'sǎn'],
                    '省': ['shěng', 'xǐng'],
                    '识': ['shí', 'zhì'],
                    '似': ['sì', 'shì'],
                    '宿': ['sù', 'xiǔ', 'xiù'],
                    '提': ['tí', 'dī'],
                    '挑': ['tiāo', 'tiǎo'],
                    '兴': ['xīng', 'xìng'],
                    '削': ['xuē', 'xiāo'],
                    '银': ['yín', 'yìn'],
                    '与': ['yǔ', 'yù', 'yú'],
                    '曾': ['céng', 'zēng'],
                    '扎': ['zhā', 'zā', 'zhá'],
                    '占': ['zhàn', 'zhān'],
                    '涨': ['zhǎng', 'zhàng'],
                    '症': ['zhèng', 'zhēng'],
                    '殖': ['zhí', 'shi'],
                    '转': ['zhuǎn', 'zhuàn'],
                    '撞': ['zhuàng', 'chuáng']
                };

                textNodes.forEach(textNode => {
                    const text = textNode.textContent || '';
                    const parent = textNode.parentNode;
                    if (!parent) return;

                    if (!/[\u4e00-\u9fa5]/.test(text)) {
                        return;
                    }

                    // 创建容器来包装拼音文本
                    const container = doc.createElement('span');
                    container.className = 'pinyin-container';
                    const fragment = doc.createDocumentFragment();
                    let currentTextBuffer = '';

                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        if (/[\u4e00-\u9fa5]/.test(char)) {
                            // 处理非中文字符缓冲区
                            if (currentTextBuffer) {
                                fragment.appendChild(doc.createTextNode(currentTextBuffer));
                                currentTextBuffer = '';
                            }

                            // 获取拼音
                            const defaultPinyin = pinyin(char, { toneType: 'symbol', nonZh: 'removed' });
                            const isMultiPinyin = multiPinyinDict.hasOwnProperty(char);
                            
                            // 创建拼音容器
                            const span = doc.createElement('span');
                            span.className = 'pinyin-text';
                            
                            // 创建拼音注释
                            const annotation = doc.createElement('span');
                            annotation.className = isMultiPinyin ? 'pinyin-annotation multi-pinyin' : 'pinyin-annotation';
                            
                            if (isMultiPinyin) {
                                // 显示多个读音，用斜杠分隔
                                const allPinyins = multiPinyinDict[char];
                                annotation.textContent = allPinyins.join('/');
                                annotation.title = `多音字：${allPinyins.join('、')}`;
                            } else {
                                annotation.textContent = defaultPinyin;
                            }
                            
                            // 创建汉字容器
                            const charSpan = doc.createElement('span');
                            charSpan.className = 'pinyin-char';
                            charSpan.textContent = char;
                            
                            span.appendChild(annotation);
                            span.appendChild(charSpan);
                            fragment.appendChild(span);
                        } else {
                            currentTextBuffer += char;
                        }
                    }

                    // 处理剩余的非中文字符
                    if (currentTextBuffer) {
                        fragment.appendChild(doc.createTextNode(currentTextBuffer));
                    }

                    container.appendChild(fragment);
                    parent.replaceChild(container, textNode);
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

